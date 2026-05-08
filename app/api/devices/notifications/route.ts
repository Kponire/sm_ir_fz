import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  DB_ID,
  COLLECTIONS,
  Query,
  ID,
} from "@/lib/appwrite-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, body: content, type, farmId } = body;

    if (!farmId || !title || !content || !type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { databases } = createAdminClient();

    // 1. Find the user associated with this farmId
    // We look in AUTOMATION_SETTINGS where the document ID is the farmId
    const farmSettings = await databases.getDocument(
      DB_ID,
      COLLECTIONS.AUTOMATION_SETTINGS,
      farmId,
    );

    if (!farmSettings) {
      return NextResponse.json(
        { success: false, error: "Farm owner not found" },
        { status: 404 },
      );
    }

    // 2. Create the notification for that specific user
    const notification = await databases.createDocument(
      DB_ID,
      COLLECTIONS.NOTIFICATIONS,
      ID.unique(),
      {
        userId: farmSettings.userId, // Map the device to the owner
        farmId: farmId,
        type: type,
        title: title,
        body: content,
        read: false,
      },
    );

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (err: any) {
    console.error("Device Notification Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
