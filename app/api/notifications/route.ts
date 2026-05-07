// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createAdminClient,
  createSessionClient,
  DB_ID,
  COLLECTIONS,
  Query,
  ID,
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
          Query.equal("read", [false]),
          Query.limit(100),
        ],
      );
      await Promise.all(
        res.documents.map((d) =>
          databases.updateDocument(DB_ID, COLLECTIONS.NOTIFICATIONS, d.$id, {
            read: true,
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
        read: true,
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

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");

    // Check authentication
    if (!session?.value)
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );

    const { account } = createSessionClient(session.value);
    const user = await account.get();

    // Parse payload
    const body = await req.json();
    const { title, body: content, type, farmId } = body;

    // Validation
    if (!title || !content || !type) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, body, or type",
        },
        { status: 400 },
      );
    }

    const { databases } = createAdminClient();

    // Create the document based on your schema
    const notification = await databases.createDocument(
      DB_ID,
      COLLECTIONS.NOTIFICATIONS,
      ID.unique(),
      {
        userId: user.$id,
        farmId: farmId || null,
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
    console.error("Notification Creation Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create notification" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");

    if (!session?.value) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 },
      );
    }

    const { databases } = createAdminClient();

    await databases.deleteDocument(DB_ID, COLLECTIONS.NOTIFICATIONS, id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete notification" },
      { status: 500 },
    );
  }
}
