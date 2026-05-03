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

    const existing = await databases.listDocuments(DB_ID, COLLECTIONS.FARMS, [
      Query.equal("userId", [user.$id]),
      Query.limit(1),
    ]);

    let farm;

    if (existing.total > 0) {
      farm = await databases.updateDocument(
        DB_ID,
        COLLECTIONS.FARMS,
        existing.documents[0].$id,
        body,
      );
    } else {
      farm = await databases.createDocument(
        DB_ID,
        COLLECTIONS.FARMS,
        ID.unique(),
        {
          userId: user.$id,
          ...body,
          createdAt: new Date().toISOString(),
        },
      );
    }

    return NextResponse.json({ success: true, farm });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
