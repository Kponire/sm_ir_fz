// src/app/api/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createSessionClient,
  createAdminClient,
  DB_ID,
  COLLECTIONS,
  Query,
} from "@/lib/appwrite-server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");

    if (!session?.value) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { account } = createSessionClient(session.value);
    const user = await account.get();

    const { databases } = createAdminClient();

    const metaRes = await databases.listDocuments(
      DB_ID,
      COLLECTIONS.USERS_META,
      [Query.equal("userId", [user.$id]), Query.limit(1)],
    );

    const farmRes = await databases.listDocuments(DB_ID, COLLECTIONS.FARMS, [
      Query.equal("userId", [user.$id]),
      Query.limit(1),
    ]);

    return NextResponse.json({
      success: true,
      user,
      meta: metaRes.documents[0] ?? null,
      farm: farmRes.documents[0] ?? null,
    });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");

    if (!session?.value)
      return NextResponse.json({ success: false }, { status: 401 });

    const { name, phone } = await req.json();

    const { account } = createSessionClient(session.value);
    const user = await account.get();

    const { users, databases } = createAdminClient();

    await users.updateName(user.$id, name);

    const metaRes = await databases.listDocuments(
      DB_ID,
      COLLECTIONS.USERS_META,
      [Query.equal("userId", [user.$id])],
    );

    if (metaRes.total > 0) {
      await databases.updateDocument(
        DB_ID,
        COLLECTIONS.USERS_META,
        metaRes.documents[0].$id,
        { phone },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
