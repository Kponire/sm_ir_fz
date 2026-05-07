import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  DB_ID,
  COLLECTIONS,
  Query,
} from "@/lib/appwrite-server";

export async function GET(req: NextRequest) {
  try {
    // Extract farmId from search parameters: /api/device/settings?farmId=xyz
    const { searchParams } = new URL(req.url);
    const farmId = searchParams.get("farmId");

    if (!farmId) {
      return NextResponse.json({ success: false, error: "farmId is required" }, { status: 400 });
    }

    const { databases } = createAdminClient();

    // Directly query the AUTOMATION_SETTINGS collection using the document ID (farmId)
    const result = await databases.getDocument(
      DB_ID,
      COLLECTIONS.AUTOMATION_SETTINGS,
      farmId
    );

    return NextResponse.json({ 
      success: true, 
      data: result 
    });
    
  } catch (error: any) {
    console.error("Device Sync Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch settings" 
    }, { status: 500 });
  }
}