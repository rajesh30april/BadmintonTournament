import { NextResponse } from "next/server";
import { listTournaments as listMock } from "../../lib/mockDb";
import { createTournament } from "../../lib/tournamentStore";
import { requireAdmin, getSessionFromRequest } from "../../lib/auth";

export async function POST(request) {
  if (process.env.USE_MOCK_DB === "true") {
    return NextResponse.json(
      { error: "Seed is only for real DB mode." },
      { status: 400 }
    );
  }

  const guard = requireAdmin(request);
  if (guard.error) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const mock = listMock();
  if (!mock.length) {
    return NextResponse.json({ error: "No mock tournament data." }, { status: 400 });
  }

  const session = getSessionFromRequest(request);
  const payload = {
    ...mock[0],
    createdBy: session?.username || "seed",
    updatedBy: session?.username || "seed",
  };

  const created = await createTournament(payload);
  return NextResponse.json({ data: created });
}
