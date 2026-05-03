// src/app/api/commands/execute/route.ts
// POST: Dashboard issues a command (start/stop pump, activate zone)
// Called by user from Irrigation Control page

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createAdminClient,
  createSessionClient,
  DB_ID,
  COLLECTIONS,
  ID,
  Query,
} from "@/lib/appwrite-server";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user session
    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");

    if (!session?.value) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    const { account } = createSessionClient(session.value);
    const user = await account.get();

    const { command, zone, duration, deviceId: reqDeviceId } = await req.json();

    if (!["start", "stop"].includes(command)) {
      return NextResponse.json(
        { success: false, error: "Invalid command" },
        { status: 400 },
      );
    }

    const { databases } = createAdminClient();

    // Resolve deviceId — use provided or look up from user's farm
    let deviceId = reqDeviceId;
    if (!deviceId) {
      const farmRes = await databases.listDocuments(DB_ID, COLLECTIONS.FARMS, [
        Query.equal("userId", [user.$id]),
        Query.limit(1),
      ]);
      if (farmRes.documents.length === 0) {
        return NextResponse.json(
          { success: false, error: "No farm registered for this user" },
          { status: 404 },
        );
      }
      deviceId = farmRes.documents[0].deviceId;
    }

    // Create command document
    const cmd = await databases.createDocument(
      DB_ID,
      COLLECTIONS.COMMANDS,
      ID.unique(),
      {
        deviceId,
        farmId: null,
        issuedBy: user.$id,
        command,
        zone: zone || null,
        duration: duration ? Number(duration) : null,
        status: "pending",
        issuedAt: new Date().toISOString(),
      },
    );

    // Log the action
    try {
      await databases.createDocument(DB_ID, COLLECTIONS.LOGS, ID.unique(), {
        deviceId,
        userId: user.$id,
        eventType:
          command === "start" ? "irrigation_started" : "irrigation_stopped",
        description: `${command === "start" ? "Irrigation started" : "Irrigation stopped"}${zone ? ` on Zone ${zone}` : ""}. Triggered by: ${user.name}`,
      });
    } catch {
      /* non-critical */
    }

    return NextResponse.json({ success: true, commandId: cmd.$id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Command failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
