import { NextResponse } from "next/server";
import {
  createTournament,
  isDuplicateNameError,
  listTournaments,
} from "../../lib/tournamentStore";
import { getSessionFromRequest, requireWrite } from "../../lib/auth";

export async function GET() {
  const data = await listTournaments();
  return NextResponse.json({ data });
}

export async function POST(request) {
  const guard = requireWrite(request);
  if (guard.error) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const payload = await request.json().catch(() => ({}));
  const session = getSessionFromRequest(request);
  if (session?.username) {
    payload.createdBy = session.username;
    payload.updatedBy = session.username;
  }
  try {
    const created = await createTournament(payload);
    return NextResponse.json({ data: created }, { status: 201 });
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
