import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.DATABASE_URL || "";
  const hasUrl = Boolean(url);
  const userMatch = url.match(/user=([^;]+)/i);
  const user = userMatch ? userMatch[1] : "";
  return NextResponse.json({
    hasUrl,
    user,
    length: url.length,
  });
}
