// src/app/api/users/route.ts
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

// Verify admin role
async function requireAdmin(sessionToken: string) {
  const { account } = createSessionClient(sessionToken);
  const user = await account.get();
  if (!user.labels?.includes("admin")) throw new Error("Admin role required");
  return user;
}

// GET: List all users (admin only)
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");
    if (!session?.value)
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    await requireAdmin(session.value);

    const { users } = createAdminClient();
    const res = await users.list();

    return NextResponse.json({
      success: true,
      data: res.users,
      total: res.total,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ success: false, error: msg }, { status: 403 });
  }
}

// POST: Create new user (admin only)
/*export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");
    if (!session?.value)
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    await requireAdmin(session.value);

    const { name, email, password, role } = await req.json();

    const { users, databases } = createAdminClient();

    // Create Appwrite user
    const newUser = await users.create(
      ID.unique(),
      email,
      undefined,
      password,
      name,
    );

    // Apply role label
    if (role === "admin") {
      await users.updateLabels(newUser.$id, ["admin"]);
    }

    // Create users_meta record
    await databases.createDocument(DB_ID, COLLECTIONS.USERS_META, ID.unique(), {
      userId: newUser.$id,
      role: role || "user",
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, userId: newUser.$id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create user";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
} */

// POST: Self registration OR admin create
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, email, password, role, phone } = body;

    const { users, databases } = createAdminClient();

    // Create Appwrite user
    const newUser = await users.create(
      ID.unique(),
      email,
      undefined,
      password,
      name,
    );

    const userRole = role || "user";

    // Apply admin label only if admin
    if (userRole === "admin") {
      await users.updateLabels(newUser.$id, ["admin"]);
    }

    // Create users_meta record
    await databases.createDocument(DB_ID, COLLECTIONS.USERS_META, ID.unique(), {
      userId: newUser.$id,
      role: userRole,
      phone: phone || null,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      userId: newUser.$id,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create user";

    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// DELETE: Delete a user (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");
    if (!session?.value)
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    await requireAdmin(session.value);

    const { userId } = await req.json();
    const { users } = createAdminClient();
    await users.delete(userId);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete user";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
