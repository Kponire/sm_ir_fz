// src/app/api/sensors/reading/route.ts
// POST: Called by ESP32 to upload sensor readings
// GET:  Called by dashboard to fetch latest reading

import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  DB_ID,
  COLLECTIONS,
  ID,
} from "@/lib/appwrite-server";

// ─── ESP32 → Server: Upload reading

export async function POST(req: NextRequest) {
  try {
    // Verify device secret header
    const deviceSecret = req.headers.get("x-device-secret");
    if (deviceSecret !== process.env.ESP_DEVICE_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      deviceId,
      soilMoisture1,
      soilMoisture2,
      temperature,
      humidity,
      rainDetected,
      flowRate,
      waterUsedToday,
      tankLevel,
      pumpOn,
      systemStatus,
    } = body;

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: "deviceId is required" },
        { status: 400 },
      );
    }

    const { databases } = createAdminClient();

    // Store sensor reading
    const doc = await databases.createDocument(
      DB_ID,
      COLLECTIONS.SENSOR_DATA,
      ID.unique(),
      {
        deviceId,
        soilMoisture1: Number(soilMoisture1),
        soilMoisture2: Number(soilMoisture2),
        temperature: Number(temperature),
        humidity: Number(humidity),
        rainDetected: Boolean(rainDetected),
        flowRate: Number(flowRate),
        waterUsedToday: Number(waterUsedToday),
        tankLevel: Number(tankLevel),
        pumpOn: Boolean(pumpOn),
        systemStatus: systemStatus || "online",
      },
    );

    // Update device last-seen
    try {
      const { Query } = await import("@/lib/appwrite-server");
      const devRes = await databases.listDocuments(DB_ID, COLLECTIONS.DEVICES, [
        Query.equal("deviceId", [deviceId]),
        Query.limit(1),
      ]);
      if (devRes.documents.length > 0) {
        await databases.updateDocument(
          DB_ID,
          COLLECTIONS.DEVICES,
          devRes.documents[0].$id,
          {
            connectionStatus: "online",
            lastSeenAt: new Date().toISOString(),
          },
        );
      }
    } catch {
      /* non-critical */
    }

    // Auto-generate low-tank notification
    if (Boolean(tankLevel) === false) {
      try {
        const { Query } = await import("@/lib/appwrite-server");
        const devRes = await databases.listDocuments(
          DB_ID,
          COLLECTIONS.DEVICES,
          [Query.equal("deviceId", [deviceId])],
        );
        if (devRes.documents.length > 0) {
          await databases.createDocument(
            DB_ID,
            COLLECTIONS.NOTIFICATIONS,
            ID.unique(),
            {
              userId: devRes.documents[0].userId,
              type: "critical",
              title: "Low Water Tank Alert",
              body: `Tank level is at ${tankLevel}. Refill required immediately.`,
              read: false,
            },
          );
        }
      } catch {
        /* non-critical */
      }
    }

    return NextResponse.json({ success: true, id: doc.$id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to store reading";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId");
    const days = parseInt(searchParams.get("days") || "1", 10);

    const { databases, Query } = await import("@/lib/appwrite-server").then(
      async (m) => {
        const client = createAdminClient();
        return { databases: client.databases, Query: m.Query };
      },
    );

    const filters = [];
    if (deviceId) filters.push(Query.equal("deviceId", [deviceId]));

    if (days > 1) {
      const since = new Date();
      since.setDate(since.getDate() - days);
      filters.push(Query.greaterThan("$createdAt", since.toISOString()));
      filters.push(Query.orderAsc("$createdAt"));
      filters.push(Query.limit(500));
    } else {
      filters.push(Query.orderDesc("$createdAt"));
      filters.push(Query.limit(1));
    }

    const res = await databases.listDocuments(
      DB_ID,
      COLLECTIONS.SENSOR_DATA,
      filters,
    );

    return NextResponse.json({
      success: true,
      data: days > 1 ? res.documents : (res.documents[0] ?? null),
      total: res.total,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch readings";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
