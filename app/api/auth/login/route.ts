// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite-server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      );
    }

    const { account } = createAdminClient();

    // Create email+password session
    const session = await account.createEmailPasswordSession(email, password);

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      sessionId: session.$id,
    });
    response.cookies.set("appwrite-session", session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Login failed";
    console.log(msg);
    return NextResponse.json({ success: false, error: msg }, { status: 401 });
  }
}
