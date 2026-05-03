// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createAdminClient,
  createSessionClient,
  DB_ID,
  COLLECTIONS,
  Query,
} from "@/lib/appwrite-server";

// GET: List notifications for authenticated user
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");
    if (!session?.value)
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );

    const { account } = createSessionClient(session.value);
    const user = await account.get();

    const { databases } = createAdminClient();
    const res = await databases.listDocuments(
      DB_ID,
      COLLECTIONS.NOTIFICATIONS,
      [
        Query.equal("userId", [user.$id]),
        Query.orderDesc("$createdAt"),
        Query.limit(50),
      ],
    );

    return NextResponse.json({
      success: true,
      data: res.documents,
      total: res.total,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

// PATCH: Mark notification(s) as read
export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");
    if (!session?.value)
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );

    const { account } = createSessionClient(session.value);
    const user = await account.get();

    const { id, markAll } = await req.json();
    const { databases } = createAdminClient();

    if (markAll) {
      const res = await databases.listDocuments(
        DB_ID,
        COLLECTIONS.NOTIFICATIONS,
        [
          Query.equal("userId", [user.$id]),
          Query.equal("isRead", [false]),
          Query.limit(100),
        ],
      );
      await Promise.all(
        res.documents.map((d) =>
          databases.updateDocument(DB_ID, COLLECTIONS.NOTIFICATIONS, d.$id, {
            isRead: true,
          }),
        ),
      );
      return NextResponse.json({
        success: true,
        updated: res.documents.length,
      });
    }

    if (id) {
      await databases.updateDocument(DB_ID, COLLECTIONS.NOTIFICATIONS, id, {
        isRead: true,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Provide id or markAll:true" },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
      { status: 500 },
    );
  }
}
