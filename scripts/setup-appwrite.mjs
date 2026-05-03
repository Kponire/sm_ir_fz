import { readFileSync } from "fs";
import { resolve } from "path";

// ─── Load .env.local
function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed
        .slice(eqIdx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
    console.log("✅ Loaded .env.local");
  } catch {
    console.log(
      "⚠️  No .env.local found — using process environment variables",
    );
  }
}

loadEnv();

// ─── Config
const ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "";
const API_KEY = process.env.APPWRITE_API_KEY ?? "";
const DB_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "smart_irrigation_db";

const DRY_RUN = process.argv.includes("--dry-run");
const PROMOTE_ADMIN = process.argv.includes("--promote-admin");

if (!PROJECT_ID || !API_KEY) {
  console.error(
    "❌ Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID or APPWRITE_API_KEY",
  );
  console.error("   Fill these in .env.local before running this script.");
  process.exit(1);
}

// ─── Appwrite REST helpers
const headers = {
  "Content-Type": "application/json",
  "X-Appwrite-Project": PROJECT_ID,
  "X-Appwrite-Key": API_KEY,
};

async function api(method, path, body) {
  if (DRY_RUN) {
    console.log(
      `  [dry-run] ${method} ${path}`,
      body ? JSON.stringify(body).slice(0, 120) : "",
    );
    return { $id: "dry-run-id" };
  }
  const res = await fetch(`${ENDPOINT}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    // 409 = already exists — treat as success
    if (res.status === 409) return json;
    throw new Error(
      `${method} ${path} → ${res.status}: ${json.message ?? JSON.stringify(json)}`,
    );
  }
  return json;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Appwrite needs a small pause between attribute creations (index building)
async function createAttr(collId, type, payload) {
  await api(
    "POST",
    `/databases/${DB_ID}/collections/${collId}/attributes/${type}`,
    payload,
  );
  await sleep(300);
}

// ─── Permission helpers
const PERM = {
  // Authenticated users can read/write their own documents
  usersRW: [
    'read("users")',
    'create("users")',
    'update("users")',
    'delete("users")',
  ],
  // Any client can create (ESP8266 uploads), users can read
  anyCreate: [
    'read("users")',
    'create("any")',
    'update("users")',
    'delete("users")',
  ],
  // ESP8266 needs to read & update without a session
  anyReadUpdate: [
    'read("any")',
    'create("users")',
    'update("any")',
    'delete("users")',
  ],
  // Fully open create + update (device self-registration)
  anyCreateUpdate: [
    'read("users")',
    'create("any")',
    'update("any")',
    'delete("users")',
  ],
};

// ─── Schema definition
/**
 * Each collection entry:
 *   id          — Appwrite collection ID (must match COLLECTIONS in appwrite.ts)
 *   name        — Human-readable label
 *   permissions — Array of permission strings
 *   attrs       — Array of attribute definitions
 *   indexes     — Array of index definitions
 */
const COLLECTIONS = [
  // ── 1. farms
  {
    id: "farms",
    name: "Farms",
    permissions: PERM.usersRW,
    attrs: [
      { type: "string", key: "userId", size: 36, required: true },
      { type: "string", key: "name", size: 255, required: true },
      { type: "string", key: "location", size: 500, required: true },
      { type: "string", key: "deviceId", size: 100, required: true },
      {
        type: "integer",
        key: "zones",
        required: true,
        min: 1,
        max: 10,
        def: 3,
      },
      {
        type: "enum",
        key: "waterSource",
        required: true,
        elements: ["Tank", "Borehole", "Well", "River"],
      },
      { type: "datetime", key: "createdAt", required: true },
    ],
    indexes: [
      { key: "idx_userId", type: "key", attrs: ["userId"] },
      { key: "idx_deviceId", type: "key", attrs: ["deviceId"] },
    ],
  },

  // ── 2. sensor_data
  {
    id: "sensor_data",
    name: "Sensor Data",
    permissions: PERM.anyCreate, // ESP8266 uploads without a session
    attrs: [
      { type: "string", key: "deviceId", size: 100, required: true },
      { type: "float", key: "soilMoisture1", required: true, min: 0, max: 100 },
      { type: "float", key: "soilMoisture2", required: true, min: 0, max: 100 },
      { type: "float", key: "temperature", required: true, min: -50, max: 100 },
      { type: "float", key: "humidity", required: true, min: 0, max: 100 },
      { type: "boolean", key: "rainDetected", required: true, def: false },
      { type: "float", key: "flowRate", required: true, min: 0, max: 1000 },
      { type: "float", key: "waterUsedToday", required: true, min: 0 },
      { type: "float", key: "tankLevel", required: true, min: 0, max: 100 },
      { type: "boolean", key: "pumpOn", required: true, def: false },
      {
        type: "enum",
        key: "systemStatus",
        required: true,
        elements: ["online", "offline", "idle"],
      },
    ],
    indexes: [
      { key: "idx_deviceId", type: "key", attrs: ["deviceId"] },
      { key: "idx_created_at", type: "key", attrs: ["$createdAt"] },
      {
        key: "idx_device_time",
        type: "key",
        attrs: ["deviceId", "$createdAt"],
      },
    ],
  },

  // ── 3. irrigation_schedules
  {
    id: "irrigation_schedules",
    name: "Irrigation Schedules",
    permissions: PERM.usersRW,
    attrs: [
      { type: "string", key: "farmId", size: 36, required: true },
      { type: "enum", key: "zone", required: true, elements: ["A", "B", "C"] },
      {
        type: "string",
        key: "days",
        size: 100,
        required: true,
        comment: "Comma-separated: Mon,Tue,Wed …",
      },
      {
        type: "string",
        key: "startTime",
        size: 5,
        required: true,
        comment: "HH:MM format",
      },
      { type: "integer", key: "duration", required: true, min: 1, max: 180 },
      { type: "boolean", key: "enabled", required: true, def: true },
    ],
    indexes: [{ key: "idx_farmId", type: "key", attrs: ["farmId"] }],
  },

  // ── 4. automation_settings
  {
    id: "automation_settings",
    name: "Automation Settings",
    permissions: PERM.usersRW,
    attrs: [
      { type: "string", key: "farmId", size: 36, required: true },
      {
        type: "float",
        key: "moistureThreshold",
        required: true,
        min: 0,
        max: 100,
        def: 40,
      },
      {
        type: "integer",
        key: "maxIrrigationTime",
        required: true,
        min: 1,
        max: 180,
        def: 30,
      },
      {
        type: "integer",
        key: "minTimeBetween",
        required: true,
        min: 0,
        max: 1440,
        def: 60,
      },
      { type: "boolean", key: "stopOnRain", required: true, def: true },
      { type: "boolean", key: "reduceOnHumidity", required: true, def: false },
      { type: "boolean", key: "increaseOnTemp", required: true, def: false },
      {
        type: "string",
        key: "morningStart",
        size: 5,
        required: true,
        def: "06:00",
      },
      {
        type: "string",
        key: "morningEnd",
        size: 5,
        required: true,
        def: "09:00",
      },
      {
        type: "string",
        key: "eveningStart",
        size: 5,
        required: true,
        def: "17:00",
      },
      {
        type: "string",
        key: "eveningEnd",
        size: 5,
        required: true,
        def: "20:00",
      },
    ],
    indexes: [{ key: "idx_farmId", type: "unique", attrs: ["farmId"] }],
  },

  // ── 5. notifications
  {
    id: "notifications",
    name: "Notifications",
    permissions: PERM.usersRW,
    attrs: [
      { type: "string", key: "userId", size: 36, required: true },
      { type: "string", key: "farmId", size: 36, required: false },
      {
        type: "enum",
        key: "type",
        required: true,
        elements: ["critical", "warning", "success", "info"],
      },
      { type: "string", key: "title", size: 255, required: true },
      { type: "string", key: "body", size: 1000, required: true },
      { type: "boolean", key: "isRead", required: true, def: false },
    ],
    indexes: [
      { key: "idx_userId", type: "key", attrs: ["userId"] },
      { key: "idx_userId_read", type: "key", attrs: ["userId", "isRead"] },
      { key: "idx_created_at", type: "key", attrs: ["$createdAt"] },
    ],
  },

  // ── 6. devices
  {
    id: "devices",
    name: "Devices",
    permissions: PERM.anyCreateUpdate, // ESP8266 self-registers on first boot
    attrs: [
      { type: "string", key: "deviceId", size: 100, required: true },
      { type: "string", key: "userId", size: 36, required: false },
      { type: "string", key: "farmId", size: 36, required: false },
      { type: "string", key: "name", size: 255, required: true },
      { type: "string", key: "firmwareVersion", size: 20, required: true },
      { type: "string", key: "wifiName", size: 255, required: false },
      { type: "string", key: "signalStrength", size: 20, required: false },
      {
        type: "enum",
        key: "connectionStatus",
        required: true,
        elements: ["online", "offline"],
      },
      { type: "datetime", key: "lastSeenAt", required: false },
    ],
    indexes: [
      { key: "idx_deviceId", type: "unique", attrs: ["deviceId"] },
      { key: "idx_userId", type: "key", attrs: ["userId"] },
    ],
  },

  // ── 7. device_commands
  {
    id: "device_commands",
    name: "Device Commands",
    permissions: PERM.anyReadUpdate, // ESP8266 reads & updates without session
    attrs: [
      { type: "string", key: "deviceId", size: 100, required: true },
      { type: "string", key: "farmId", size: 36, required: false },
      { type: "string", key: "issuedBy", size: 36, required: false },
      {
        type: "enum",
        key: "command",
        required: true,
        elements: ["start", "stop"],
      },
      { type: "enum", key: "zone", required: false, elements: ["A", "B", "C"] },
      { type: "integer", key: "duration", required: false, min: 1, max: 180 },
      {
        type: "enum",
        key: "status",
        required: true,
        elements: ["pending", "executed", "failed"],
      },
      { type: "datetime", key: "issuedAt", required: true },
      { type: "datetime", key: "executedAt", required: false },
      { type: "string", key: "errorMsg", size: 500, required: false },
    ],
    indexes: [
      { key: "idx_deviceId", type: "key", attrs: ["deviceId"] },
      { key: "idx_device_status", type: "key", attrs: ["deviceId", "status"] },
      { key: "idx_issuedAt", type: "key", attrs: ["issuedAt"] },
    ],
  },

  // ── 8. system_logs
  {
    id: "system_logs",
    name: "System Logs",
    permissions: PERM.anyCreate, // Devices log freely without a session
    attrs: [
      { type: "string", key: "deviceId", size: 100, required: false },
      { type: "string", key: "userId", size: 36, required: false },
      { type: "string", key: "farmId", size: 36, required: false },
      { type: "string", key: "eventType", size: 50, required: true },
      { type: "string", key: "description", size: 1000, required: true },
    ],
    indexes: [
      { key: "idx_deviceId", type: "key", attrs: ["deviceId"] },
      { key: "idx_eventType", type: "key", attrs: ["eventType"] },
      { key: "idx_created_at", type: "key", attrs: ["$createdAt"] },
    ],
  },

  // ── 9. users_meta
  {
    id: "users_meta",
    name: "Users Meta",
    permissions: PERM.usersRW,
    attrs: [
      { type: "string", key: "userId", size: 36, required: true },
      {
        type: "enum",
        key: "role",
        required: true,
        elements: ["admin", "user"],
      },
      { type: "string", key: "phone", size: 30, required: false },
      { type: "string", key: "farmId", size: 36, required: false },
      { type: "boolean", key: "isActive", required: true, def: true },
      { type: "datetime", key: "createdAt", required: true },
    ],
    indexes: [
      { key: "idx_userId", type: "unique", attrs: ["userId"] },
      { key: "idx_role", type: "key", attrs: ["role"] },
    ],
  },

  // ── 10. irrigation_records
  {
    id: "irrigation_records",
    name: "Irrigation Records",
    permissions: PERM.usersRW,
    attrs: [
      { type: "string", key: "userId", size: 36, required: true },
      { type: "string", key: "farmId", size: 36, required: true },
      { type: "string", key: "farmName", size: 255, required: true },
      { type: "string", key: "userName", size: 255, required: true },
      { type: "string", key: "deviceId", size: 100, required: true },
      { type: "enum", key: "zone", required: true, elements: ["A", "B", "C"] },
      { type: "datetime", key: "startTime", required: true },
      { type: "datetime", key: "endTime", required: false },
      { type: "integer", key: "durationMinutes", required: true, min: 0 },
      { type: "float", key: "waterUsedLitres", required: true, min: 0 },
      {
        type: "enum",
        key: "triggeredBy",
        required: true,
        elements: ["manual", "schedule", "automation"],
      },
    ],
    indexes: [
      { key: "idx_userId", type: "key", attrs: ["userId"] },
      { key: "idx_farmId", type: "key", attrs: ["farmId"] },
      { key: "idx_deviceId", type: "key", attrs: ["deviceId"] },
      { key: "idx_start", type: "key", attrs: ["startTime"] },
    ],
  },
];

// ─── Attribute creation dispatcher
async function createAttribute(collId, attr) {
  const base = { key: attr.key, required: attr.required ?? false };

  switch (attr.type) {
    case "string":
      return createAttr(collId, "string", {
        ...base,
        size: attr.size ?? 255,
        ...(attr.def !== undefined ? { default: attr.def } : {}),
      });

    case "integer":
      return createAttr(collId, "integer", {
        ...base,
        ...(attr.min !== undefined ? { min: attr.min } : {}),
        ...(attr.max !== undefined ? { max: attr.max } : {}),
        ...(attr.def !== undefined ? { default: attr.def } : {}),
      });

    case "float":
      return createAttr(collId, "float", {
        ...base,
        ...(attr.min !== undefined ? { min: attr.min } : {}),
        ...(attr.max !== undefined ? { max: attr.max } : {}),
        ...(attr.def !== undefined ? { default: attr.def } : {}),
      });

    case "boolean":
      return createAttr(collId, "boolean", {
        ...base,
        ...(attr.def !== undefined ? { default: attr.def } : {}),
      });

    case "enum":
      return createAttr(collId, "enum", {
        ...base,
        elements: attr.elements,
        ...(attr.def !== undefined ? { default: attr.def } : {}),
      });

    case "datetime":
      return createAttr(collId, "datetime", {
        ...base,
        ...(attr.def !== undefined ? { default: attr.def } : {}),
      });

    default:
      throw new Error(`Unknown attribute type: ${attr.type}`);
  }
}

// ─── Main ─────
async function main() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║   Smart Irrigation — Appwrite Database Setup     ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  if (DRY_RUN) console.log("🟡 DRY-RUN mode — no changes will be made\n");

  console.log(`📡 Endpoint  : ${ENDPOINT}`);
  console.log(`🗂  Project   : ${PROJECT_ID}`);
  console.log(`🗄  Database  : ${DB_ID}\n`);

  // ── Step 1: Create / verify database ─────────────────────────────────────
  console.log("━━━ Step 1: Database ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  try {
    await api("GET", `/databases/${DB_ID}`);
    console.log(`  ♻️  Using existing database: ${DB_ID}`);
  } catch {
    await api("POST", `/databases`, {
      databaseId: DB_ID,
      name: "smart_irr_db",
    });
    console.log(`  ✅ Database created: ${DB_ID}`);
  }

  // ── Step 2: Create collections ────────────────────────────────────────────
  console.log("\n━━━ Step 2: Collections & Attributes ━━━━━━━━━━━━━━\n");

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const col of COLLECTIONS) {
    console.log(`📁 ${col.name}  (id: ${col.id})`);

    // Create collection
    try {
      await api("POST", `/databases/${DB_ID}/collections`, {
        collectionId: col.id,
        name: col.name,
        permissions: col.permissions,
        documentSecurity: false,
      });
      console.log(`   ✅ Collection created`);
      totalCreated++;
    } catch (e) {
      if (
        e.message?.includes("409") ||
        e.message?.includes("already exists") ||
        DRY_RUN
      ) {
        console.log(
          `   ♻️  Collection already exists — skipping creation, will add missing attrs`,
        );
        totalSkipped++;
      } else {
        console.error(`   ❌ Failed to create collection: ${e.message}`);
        continue;
      }
    }

    // Create attributes
    console.log(`   📝 Creating ${col.attrs.length} attributes…`);
    let attrOk = 0;
    let attrSkip = 0;
    for (const attr of col.attrs) {
      try {
        await createAttribute(col.id, attr);
        attrOk++;
        process.stdout.write(`      ✅ ${attr.key} (${attr.type})\n`);
      } catch (e) {
        if (
          e.message?.includes("409") ||
          e.message?.includes("already exists")
        ) {
          attrSkip++;
          process.stdout.write(`      ♻️  ${attr.key} already exists\n`);
        } else {
          process.stdout.write(`      ❌ ${attr.key}: ${e.message}\n`);
        }
      }
    }
    console.log(`   → ${attrOk} created, ${attrSkip} skipped`);

    // Create indexes (wait for attributes to finish building)
    if (col.indexes?.length) {
      console.log(`   🔍 Creating ${col.indexes.length} indexes…`);
      if (!DRY_RUN) await sleep(1000); // give Appwrite time to process attrs

      for (const idx of col.indexes) {
        try {
          await api(
            "POST",
            `/databases/${DB_ID}/collections/${col.id}/indexes`,
            {
              key: idx.key,
              type: idx.type,
              attributes: idx.attrs,
            },
          );
          console.log(`      ✅ Index: ${idx.key}`);
        } catch (e) {
          if (
            e.message?.includes("409") ||
            e.message?.includes("already exists")
          ) {
            console.log(`      ♻️  Index ${idx.key} already exists`);
          } else {
            console.log(`      ⚠️  Index ${idx.key}: ${e.message}`);
          }
        }
        if (!DRY_RUN) await sleep(200);
      }
    }

    console.log("");
  }

  // ── Step 3: Promote admin ─────────────────────────────────────────────────
  if (PROMOTE_ADMIN) {
    console.log("━━━ Step 3: Promote first user to admin ━━━━━━━━━━━\n");
    try {
      // List users — pick the first registered one
      const usersRes = await api("GET", `/users?limit=5`);
      const users = usersRes.users ?? [];

      if (users.length === 0) {
        console.log(
          "  ⚠️  No users found. Register on the platform first, then re-run with --promote-admin",
        );
      } else {
        // If there's only one user, promote them. Otherwise list and pick the first.
        const target = users[0];
        console.log(
          `  👤 Found user: ${target.name} (${target.email})  id: ${target.$id}`,
        );

        // Set admin label on Appwrite Auth user
        await api("PATCH", `/users/${target.$id}/labels`, {
          labels: ["admin"],
        });
        console.log(`  ✅ Label 'admin' applied to Appwrite Auth user`);

        // Create users_meta document
        const { ID } = { ID: { unique: () => `meta_${Date.now()}` } };
        await api(
          "POST",
          `/databases/${DB_ID}/collections/users_meta/documents`,
          {
            documentId: "unique()",
            data: {
              userId: target.$id,
              role: "admin",
              isActive: true,
              createdAt: new Date().toISOString(),
            },
            permissions: [],
          },
        );
        console.log(`  ✅ users_meta document created with role: admin`);
        console.log(`\n  🎉 ${target.name} is now an admin!`);
        console.log(
          `     Log in at your dashboard and you will see the Admin menu.`,
        );
      }
    } catch (e) {
      console.error(`  ❌ Failed to promote admin: ${e.message}`);
      console.log(
        `\n  💡 Tip: You can also promote manually in the Appwrite Console:`,
      );
      console.log(`     Auth → Users → [your user] → Labels → add: admin`);
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("━━━ Done ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log(`  Collections processed : ${COLLECTIONS.length}`);
  console.log(`  Created               : ${totalCreated}`);
  console.log(`  Already existed       : ${totalSkipped}`);

  if (!PROMOTE_ADMIN) {
    console.log(
      `\n💡 To also promote your first registered user to admin, run:`,
    );
    console.log(`   node scripts/setup-appwrite.mjs --promote-admin\n`);
  }

  console.log("✅ Appwrite database setup complete!\n");
  console.log("Next steps:");
  console.log(
    "  1. Check your Appwrite console → Databases → smart_irrigation_db",
  );
  console.log(
    "  2. Verify all 10 collections are visible with their attributes",
  );
  console.log("  3. Run: npm run dev");
  console.log("  4. Log in — you should see the full dashboard\n");
}

main().catch((err) => {
  console.error("\n❌ Setup failed:", err.message);
  process.exit(1);
});
