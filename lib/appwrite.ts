// src/lib/appwrite.ts
// Client-side Appwrite SDK (used in browser / React components)

import { Client, Account, Databases, Storage } from "appwrite";

const client = new Client();

client
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://cloud.appwrite.io/v1",
  )
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "");

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { client };

// Collection IDs (from env)

export const DB_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "smart_irrigation_db";

export const COLLECTIONS = {
  FARMS: "farms",
  SENSOR_DATA: "sensor_data",
  SCHEDULES: "irrigation_schedules",
  AUTOMATION: "automation_settings",
  NOTIFICATIONS: "notifications",
  DEVICES: "devices",
  COMMANDS: "device_commands",
  LOGS: "system_logs",
  USERS_META: "users_meta",
  IRRIGATION_RECORDS: "irrigation_records",
} as const;
