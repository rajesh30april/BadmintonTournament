import { NextResponse } from "next/server";

export function GET() {
  const useMock = process.env.USE_MOCK_DB === "true";
  return NextResponse.json({
    ok: true,
    dbMode: useMock ? "mock" : "azure-sql",
    time: new Date().toISOString(),
  });
}
