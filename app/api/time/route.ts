import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();

    // Format in WAT (Africa/Lagos)
    const formatter = new Intl.DateTimeFormat("en-NG", {
      timeZone: "Africa/Lagos",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(now);

    // Convert parts to object
    const data: Record<string, string> = {};
    parts.forEach(({ type, value }) => {
      if (type !== "literal") data[type] = value;
    });

    return NextResponse.json({
      success: true,
      timezone: "WAT (Africa/Lagos)",
      iso: now.toISOString(),
      timestamp: now.getTime(),

      // Structured values
      year: data.year,
      month: data.month,
      day: data.day,
      weekday: data.weekday,
      hour: data.hour,
      minute: data.minute,
      second: data.second,

      // Full formatted string
      formatted: formatter.format(now),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to get time" },
      { status: 500 },
    );
  }
}
