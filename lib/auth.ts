// src/lib/auth.ts
import { account } from "./appwrite";
import type { AuthUser } from "@/types";
import { ID } from "appwrite";

/*export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const user = await account.get();
    const role = user.labels?.includes("admin") ? "admin" : "user";
    return {
      $id: user.$id,
      name: user.name,
      email: user.email,
      role,
      labels: user.labels,
      $createdAt: user.$createdAt,
    };
  } catch {
    return null;
  }
}*/

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch("/api/auth/me", {
      cache: "no-store", // Ensure we get fresh data
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch (error) {
    console.error("Auth check failed:", error);
    return null;
  }
}

export async function logout(): Promise<void> {
  // Call an API route to delete the cookie on the server
  await fetch("/api/auth/logout", { method: "POST" });

  // Also clear it on the client just in case
  // document.cookie="appwrite-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
}

/*export async function logout(): Promise<void> {
  await account.deleteSession("current");
}*/

export async function loginWithEmail(email: string, password: string) {
  return account.createEmailPasswordSession(email, password);
}

export async function loginWithGoogle() {
  return account.createOAuth2Session(
    "google" as never,
    `${baseUrl}/api/auth/oauth/callback`,
    `${baseUrl}/login?error=oauth_failed`,
  );
}

export async function sendPasswordRecovery(email: string) {
  return account.createRecovery(email, `${baseUrl}/reset-password`);
}

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
) {
  return account.create(ID.unique(), email, password, name);
}
