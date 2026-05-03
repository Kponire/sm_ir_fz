// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionClient } from "@/lib/appwrite-server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");

    if (session?.value) {
      try {
        const { account } = createSessionClient(session.value);
        await account.deleteSession("current");
      } catch {
        // session might already be expired — that's fine
      }
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("appwrite-session");
    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 },
    );
  }
}
