import { NextResponse } from "next/server";
import { requireAuth } from "../../lib/auth";

export async function GET(request) {
  const guard = requireAuth(request);
  if (guard.error) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  return NextResponse.json({ user: guard.session });
}
