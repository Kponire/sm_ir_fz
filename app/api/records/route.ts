import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ID } from "node-appwrite";
import {
  createAdminClient,
  createSessionClient,
  DB_ID,
  COLLECTIONS,
  Query,
} from "@/lib/appwrite-server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "irrigation" or "fertigation"

    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");
    if (!session?.value)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { account } = createSessionClient(session.value);
    const user = await account.get();
    const { databases } = createAdminClient();

    const queries = [
      Query.equal("userId", user.$id),
      Query.orderDesc("startTime"),
      Query.limit(100),
    ];
    if (type) queries.push(Query.equal("recordType", type));

    const res = await databases.listDocuments(
      DB_ID,
      COLLECTIONS.RECORDS,
      queries,
    );
    return NextResponse.json({ success: true, data: res.documents });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { databases } = createAdminClient();

    const record = await databases.createDocument(
      DB_ID,
      COLLECTIONS.RECORDS,
      ID.unique(),
      {
        ...body,
        // Ensure defaults if not provided
        recordType: body.recordType || "irrigation",
        isFertigation: body.recordType === "fertigation",
      },
    );

    return NextResponse.json({ success: true, data: record });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
