// src/app/api/logs/route.ts
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

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");
    if (!session?.value)
      return NextResponse.json({ success: false }, { status: 401 });

    const { account } = createSessionClient(session.value);
    const user = await account.get();
    const isAdmin = user.labels?.includes("admin");

    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const { databases } = createAdminClient();
    const filters: ReturnType<typeof Query.limit>[] = [
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ];

    if (!isAdmin && !deviceId) {
      // Regular user: only see their own device logs
      const farmRes = await databases.listDocuments(DB_ID, COLLECTIONS.FARMS, [
        Query.equal("userId", [user.$id]),
      ]);
      if (farmRes.documents.length > 0) {
        filters.push(Query.equal("deviceId", [farmRes.documents[0].deviceId]));
      }
    }

    if (deviceId) filters.push(Query.equal("deviceId", [deviceId]));

    const res = await databases.listDocuments(DB_ID, COLLECTIONS.LOGS, filters);
    return NextResponse.json({
      success: true,
      data: res.documents,
      total: res.total,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch logs" },
      { status: 500 },
    );
  }
}

// DELETE: Clear all logs (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");
    if (!session?.value)
      return NextResponse.json({ success: false }, { status: 401 });

    const { account } = createSessionClient(session.value);
    const user = await account.get();
    if (!user.labels?.includes("admin"))
      return NextResponse.json(
        { success: false, error: "Admin only" },
        { status: 403 },
      );

    const { databases } = createAdminClient();
    const res = await databases.listDocuments(DB_ID, COLLECTIONS.LOGS, [
      Query.limit(100),
    ]);
    await Promise.all(
      res.documents.map((d) =>
        databases.deleteDocument(DB_ID, COLLECTIONS.LOGS, d.$id),
      ),
    );

    return NextResponse.json({ success: true, deleted: res.documents.length });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to clear logs" },
      { status: 500 },
    );
  }
}
