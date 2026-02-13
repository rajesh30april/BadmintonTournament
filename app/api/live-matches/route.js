import { NextResponse } from "next/server";
import {
  listLiveMatches,
  startLiveMatch,
  stopLiveMatch,
} from "../../lib/tournamentStore";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tournamentId = searchParams.get("tournamentId");
  if (!tournamentId) {
    return NextResponse.json({ error: "Missing tournamentId" }, { status: 400 });
  }
  const data = await listLiveMatches(tournamentId);
  return NextResponse.json({ data });
}

export async function POST(request) {
  const payload = await request.json().catch(() => ({}));
  const { tournamentId, fixtureKey, rowId, rowLabel, rowIndex } = payload || {};
  if (!tournamentId || !fixtureKey || !rowId) {
    return NextResponse.json(
      { error: "Missing tournamentId, fixtureKey, or rowId" },
      { status: 400 }
    );
  }
  await startLiveMatch(
    tournamentId,
    fixtureKey,
    rowId,
    rowLabel,
    rowIndex
  );
  const data = await listLiveMatches(tournamentId);
  return NextResponse.json({ data });
}

export async function DELETE(request) {
  const payload = await request.json().catch(() => ({}));
  const { tournamentId, fixtureKey, rowId } = payload || {};
  if (!tournamentId || !fixtureKey || !rowId) {
    return NextResponse.json(
      { error: "Missing tournamentId, fixtureKey, or rowId" },
      { status: 400 }
    );
  }
  await stopLiveMatch(tournamentId, fixtureKey, rowId);
  const data = await listLiveMatches(tournamentId);
  return NextResponse.json({ data });
}
