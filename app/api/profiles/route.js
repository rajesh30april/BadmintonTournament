import { NextResponse } from "next/server";
import { getProfiles, replaceProfiles } from "../../lib/tournamentStore";
import { getSessionFromRequest, requireWrite } from "../../lib/auth";

export async function GET(_request) {
  const profiles = await getProfiles();
  return NextResponse.json({ data: profiles });
}

export async function PUT(request) {
  const guard = requireWrite(request);
  if (guard.error) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const payload = await request.json().catch(() => ({}));
  const list = Array.isArray(payload?.profiles) ? payload.profiles : [];
  const session = getSessionFromRequest(request);
  if (!session?.username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const updated = await replaceProfiles(list);
  return NextResponse.json({ data: updated });
}
