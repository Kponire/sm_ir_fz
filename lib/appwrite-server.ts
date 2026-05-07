// src/lib/appwrite-server.ts
// Server-side Appwrite SDK (API routes only — has admin privileges)
// NEVER import this file in client components

import {
  Client,
  Account,
  Databases,
  Storage,
  Users,
  Query,
  ID,
} from "node-appwrite";

export function createAdminClient() {
  const client = new Client()
    .setEndpoint(
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ??
        "https://fra.cloud.appwrite.io/v1",
    )
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "")
    .setKey(process.env.NEXT_PUBLIC_APPWRITE_API_KEY ?? "");

  return {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
    users: new Users(client),
  };
}

// Session-based client (for verifying user sessions in API routes)
export function createSessionClient(sessionToken: string) {
  const client = new Client()
    .setEndpoint(
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ??
        "https://cloud.appwrite.io/v1",
    )
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "")
    .setSession(sessionToken);

  return {
    account: new Account(client),
    databases: new Databases(client),
  };
}

export const DB_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "smart_irrigation_db";

export const COLLECTIONS = {
  FARMS: process.env.APPWRITE_COLLECTION_FARMS ?? "farms",
  SENSOR_DATA: process.env.APPWRITE_COLLECTION_SENSOR_DATA ?? "sensor_data",
  SCHEDULES:
    process.env.APPWRITE_COLLECTION_SCHEDULES ?? "irrigation_schedules",
  RECORDS:
    process.env.APPWRITE_COLLECTION_RECORDS ?? "irrigation_records",
  AUTOMATION_SETTINGS:
    process.env.APPWRITE_COLLECTION_AUTOMATION ?? "automation_settings",
  NOTIFICATIONS:
    process.env.APPWRITE_COLLECTION_NOTIFICATIONS ?? "notifications",
  DEVICES: process.env.APPWRITE_COLLECTION_DEVICES ?? "devices",
  COMMANDS: process.env.APPWRITE_COLLECTION_COMMANDS ?? "device_commands",
  LOGS: process.env.APPWRITE_COLLECTION_LOGS ?? "system_logs",
  USERS_META: process.env.APPWRITE_COLLECTION_USERS_META ?? "users_meta",
  IRRIGATION_RECORDS: "irrigation_records",
} as const;

export { Query, ID };
