import { NextResponse } from "next/server";
import { likeMatch, listMatchLikes } from "../../lib/tournamentStore";
import { requireAuth } from "../../lib/auth";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tournamentId = searchParams.get("tournamentId");
  if (!tournamentId) {
    return NextResponse.json({ error: "Missing tournamentId" }, { status: 400 });
  }
  const data = await listMatchLikes(tournamentId);
  return NextResponse.json({ data });
}

export async function POST(request) {
  const guard = requireAuth(request);
  if (guard.error) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const payload = await request.json().catch(() => ({}));
  const updated = await likeMatch({
    tournamentId: payload?.tournamentId,
    fixtureKey: payload?.fixtureKey,
    rowId: payload?.rowId,
  });
  if (!updated) {
    return NextResponse.json({ error: "Invalid match" }, { status: 400 });
  }
  return NextResponse.json({ data: updated });
}
