// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionClient } from "@/lib/appwrite-server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");

    if (!session?.value) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    const { account } = createSessionClient(session.value);
    const user = await account.get();

    return NextResponse.json({
      success: true,
      user: {
        $id: user.$id,
        name: user.name,
        email: user.email,
        labels: user.labels,
        role: user.labels?.includes("admin") ? "admin" : "user",
        $createdAt: user.$createdAt,
      },
    });
  } catch (err: any) {
    console.log("Auth Me Error:", err);
    return NextResponse.json(
      { success: false, error: "Session invalid" },
      { status: 401 },
    );
  }
}
