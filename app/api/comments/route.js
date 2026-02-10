import { NextResponse } from "next/server";
import { addComment, listComments } from "../../lib/tournamentStore";
import { getSessionFromRequest, requireCommentAccess } from "../../lib/auth";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tournamentId = searchParams.get("tournamentId");
  if (!tournamentId) {
    return NextResponse.json({ error: "Missing tournamentId" }, { status: 400 });
  }
  const data = await listComments(tournamentId);
  return NextResponse.json({ data });
}

export async function POST(request) {
  const guard = requireCommentAccess(request);
  if (guard.error) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const payload = await request.json().catch(() => ({}));
  const session = getSessionFromRequest(request);
  const created = await addComment({
    tournamentId: payload?.tournamentId,
    fixtureKey: payload?.fixtureKey,
    rowId: payload?.rowId,
    text: payload?.text,
    author: session?.username || payload?.author || "unknown",
  });
  if (!created) {
    return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
  }
  return NextResponse.json({ data: created });
}
