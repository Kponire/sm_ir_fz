import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createSessionClient,
  createAdminClient,
  DB_ID,
  COLLECTIONS,
  ID,
  Query,
} from "@/lib/appwrite-server";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");

    if (!session?.value)
      return NextResponse.json({ success: false }, { status: 401 });

    const body = await req.json();
    const { account } = createSessionClient(session.value);
    const user = await account.get();
    const { databases } = createAdminClient();

    const existing = await databases.listDocuments(
      DB_ID,
      COLLECTIONS.AUTOMATION_SETTINGS,
      [Query.equal("userId", [user.$id]), Query.limit(1)],
    );

    let settings;

    const payload = {
      userId: user.$id,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    if (existing.total > 0) {
      settings = await databases.updateDocument(
        DB_ID,
        COLLECTIONS.AUTOMATION_SETTINGS,
        existing.documents[0].$id,
        payload,
      );
    } else {
      settings = await databases.createDocument(
        DB_ID,
        COLLECTIONS.AUTOMATION_SETTINGS,
        ID.unique(),
        {
          ...payload,
          createdAt: new Date().toISOString(),
        },
      );
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// Add this to your existing route.ts
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");

    if (!session?.value)
      return NextResponse.json({ success: false }, { status: 401 });

    const { account } = createSessionClient(session.value);
    const user = await account.get();
    const { databases } = createAdminClient();

    const metaRes = await databases.listDocuments(
      DB_ID,
      COLLECTIONS.USERS_META,
      [Query.equal("userId", [user.$id])],
    );

    const result = await databases.listDocuments(
      DB_ID,
      COLLECTIONS.AUTOMATION_SETTINGS,
      [Query.equal("$id", [metaRes.documents[0].farmId]), Query.limit(1)],
    );

    if (result.total === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: result.documents[0] });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
