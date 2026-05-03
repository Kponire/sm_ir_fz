// src/app/api/devices/register/route.ts
// POST: Called by ESP8266 on first boot to register itself
// Subsequent boots just use sensor upload to update last-seen

import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  DB_ID,
  COLLECTIONS,
  ID,
  Query,
} from "@/lib/appwrite-server";

export async function POST(req: NextRequest) {
  try {
    const deviceSecret = req.headers.get("x-device-secret");
    if (deviceSecret !== process.env.ESP_DEVICE_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { deviceId, firmwareVersion, wifiName, signalStrength } =
      await req.json();

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: "deviceId is required" },
        { status: 400 },
      );
    }

    const { databases } = createAdminClient();

    // Check if device exists already
    const existing = await databases.listDocuments(DB_ID, COLLECTIONS.DEVICES, [
      Query.equal("deviceId", [deviceId]),
      Query.limit(1),
    ]);

    if (existing.documents.length > 0) {
      // Update heartbeat
      const doc = await databases.updateDocument(
        DB_ID,
        COLLECTIONS.DEVICES,
        existing.documents[0].$id,
        {
          firmwareVersion:
            firmwareVersion || existing.documents[0].firmwareVersion,
          wifiName: wifiName || existing.documents[0].wifiName,
          signalStrength:
            signalStrength || existing.documents[0].signalStrength,
          connectionStatus: "online",
          lastSeenAt: new Date().toISOString(),
        },
      );
      return NextResponse.json({
        success: true,
        deviceDbId: doc.$id,
        isNew: false,
      });
    }

    // Register new device
    const doc = await databases.createDocument(
      DB_ID,
      COLLECTIONS.DEVICES,
      ID.unique(),
      {
        deviceId,
        name: `Smart Irrigation ${deviceId}`,
        firmwareVersion: firmwareVersion || "v1.0.0",
        wifiName: wifiName || "",
        signalStrength: signalStrength || "",
        connectionStatus: "online",
        lastSeenAt: new Date().toISOString(),
        userId: "", // will be assigned by admin
        farmId: null,
      },
    );

    // Log registration
    try {
      await databases.createDocument(DB_ID, COLLECTIONS.LOGS, ID.unique(), {
        deviceId,
        eventType: "device_connected",
        description: `New device registered. Firmware: ${firmwareVersion}. WiFi: ${wifiName}`,
      });
    } catch {
      /* non-critical */
    }

    return NextResponse.json({
      success: true,
      deviceDbId: doc.$id,
      isNew: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
