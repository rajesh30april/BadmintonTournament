import { NextResponse } from "next/server";
import { likeComment } from "../../../lib/tournamentStore";
import { requireAuth } from "../../../lib/auth";

export async function POST(request) {
  const guard = requireAuth(request);
  if (guard.error) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const payload = await request.json().catch(() => ({}));
  const updated = await likeComment({ commentId: payload?.commentId });
  if (!updated) {
    return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
  }
  return NextResponse.json({ data: updated });
}
