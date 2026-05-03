// src/app/api/commands/pending/route.ts
// GET: ESP8266 polls this endpoint every 2 seconds for pending commands
// PATCH: ESP8266 marks a command as executed or failed

import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  DB_ID,
  COLLECTIONS,
  Query,
} from "@/lib/appwrite-server";

// ─── ESP8266 polls for pending commands

export async function GET(req: NextRequest) {
  try {
    const deviceSecret = req.headers.get("x-device-secret");
    if (deviceSecret !== process.env.ESP_DEVICE_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: "deviceId is required" },
        { status: 400 },
      );
    }

    const { databases } = createAdminClient();

    const res = await databases.listDocuments(DB_ID, COLLECTIONS.COMMANDS, [
      Query.equal("deviceId", [deviceId]),
      Query.equal("status", ["pending"]),
      Query.orderAsc("issuedAt"),
      Query.limit(5),
    ]);

    return NextResponse.json({
      success: true,
      commands: res.documents.map((d) => ({
        id: d.$id,
        command: d.command,
        zone: d.zone,
        duration: d.duration,
        issuedAt: d.issuedAt,
      })),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Poll failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// ─── ESP8266 marks command result

export async function PATCH(req: NextRequest) {
  try {
    const deviceSecret = req.headers.get("x-device-secret");
    if (deviceSecret !== process.env.ESP_DEVICE_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { commandId, status, errorMsg } = await req.json();

    if (!commandId || !["executed", "failed"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "commandId and status are required" },
        { status: 400 },
      );
    }

    const { databases } = createAdminClient();

    await databases.updateDocument(DB_ID, COLLECTIONS.COMMANDS, commandId, {
      status,
      executedAt: new Date().toISOString(),
      ...(errorMsg ? { errorMsg } : {}),
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
