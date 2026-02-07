import { NextResponse } from "next/server";
import {
  deleteTournament,
  getTournament,
  isDuplicateNameError,
  updateTournament,
  updateTournamentScoresOnly,
} from "../../../lib/tournamentStore";
import { getSessionFromRequest, requireScoreOrWrite, requireWrite } from "../../../lib/auth";

export async function GET(_request, { params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const record = await getTournament(id);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: record });
}

export async function PUT(request, { params }) {
  const guard = requireScoreOrWrite(request);
  if (guard.error) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const payload = await request.json().catch(() => ({}));
  const session = getSessionFromRequest(request);
  if (session?.username) {
    payload.updatedBy = session.username;
  }
  if (session?.role !== "admin" && session?.access === "score") {
    const scoresOnly = payload?.scores || {};
    Object.keys(payload).forEach((key) => {
      if (key !== "scores" && key !== "updatedBy") {
        delete payload[key];
      }
    });
    payload.scores = scoresOnly;
    payload.__scoresOnly = true;
  }
  try {
    const { id } = await params;
    const updated =
      session?.role !== "admin" && session?.access === "score"
        ? await updateTournamentScoresOnly(id, payload.scores, payload.updatedBy)
        : await updateTournament(id, payload);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: updated });
  } catch (error) {
    if (isDuplicateNameError(error)) {
      return NextResponse.json(
        { error: "Tournament name already exists" },
        { status: 409 }
      );
    }
    throw error;
  }
}

export async function DELETE(_request, { params }) {
  const guard = requireWrite(_request);
  if (guard.error) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const { id } = await params;
  const ok = await deleteTournament(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
