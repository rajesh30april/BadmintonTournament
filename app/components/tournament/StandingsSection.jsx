import { useState } from "react";
import { Card, CardContent, Input } from "../ui";

export default function StandingsSection({
  standings,
  showOwner = true,
  liveMatchView = null,
  onOpenMatch = null,
  comments = [],
  onAddComment = () => {},
  onLikeComment = () => {},
  onLikeStandings = () => {},
  standingsLikeCount = 0,
  canComment = false,
  canLike = false,
}) {
  const columns = showOwner ? "grid-cols-3" : "grid-cols-2";
  const [draft, setDraft] = useState("");
  const standingsComments = (comments || []).filter(
    (c) => c.fixtureKey === "standings" && String(c.rowId) === "common"
  );
  const commentCount = standingsComments.length;

  const submitComment = () => {
    const text = draft.trim();
    if (!text) return;
    onAddComment({ fixtureKey: "standings", rowId: "common", text });
    setDraft("");
  };
  return (
    <div className="grid gap-3">
      <div className="text-xl font-extrabold">Standings</div>

      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-3 bg-blue-700 text-white font-extrabold">
            Points Table
          </div>

          <div className="bg-white">
            <div className={`grid ${columns} px-4 py-2 text-sm font-extrabold border-b`}>
              <div>Team</div>
              {showOwner ? <div>Owner</div> : null}
              <div className="text-right">Points</div>
            </div>

            {standings.length === 0 ? (
              <div className="px-4 py-4 text-sm text-slate-600">No results yet.</div>
            ) : (
              standings.map((r) => (
                <div key={r.team} className={`grid ${columns} px-4 py-3 text-sm border-b`}>
                  <div className="text-blue-700 font-extrabold">{r.team}</div>
                  {showOwner ? <div className="text-slate-700">{r.owner || "—"}</div> : null}
                  <div className="text-right font-extrabold">{r.points}</div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {liveMatchView ? (
        <Card>
          <CardContent className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  Live Match
                </div>
                <div className="text-base font-extrabold text-slate-900">
                  {liveMatchView.teamsLabel}
                </div>
              </div>
              {onOpenMatch ? (
                <button
                  type="button"
                  onClick={onOpenMatch}
                  className="rounded-full border border-slate-300 bg-white px-4 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Open
                </button>
              ) : null}
            </div>
            <div className="text-xs text-slate-500">
              {liveMatchView.rowLabel} • {liveMatchView.status}
            </div>
            <div className="grid gap-1 text-xs text-slate-600">
              <div>
                <span className="font-semibold">{liveMatchView.t1}:</span>{" "}
                {liveMatchView.t1Players || "—"}
              </div>
              <div>
                <span className="font-semibold">{liveMatchView.t2}:</span>{" "}
                {liveMatchView.t2Players || "—"}
              </div>
            </div>
            <div className="text-sm font-bold text-slate-800">
              {liveMatchView.scoreText}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="grid gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-extrabold">Standings Feed</div>
            <button
              type="button"
              onClick={onLikeStandings}
              disabled={!canLike}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M10 18a1 1 0 0 1-.7-.29l-6.4-6.3a4.3 4.3 0 0 1 0-6.1 4.34 4.34 0 0 1 6.1 0l1 1 1-1a4.34 4.34 0 0 1 6.1 0 4.3 4.3 0 0 1 0 6.1l-6.4 6.3A1 1 0 0 1 10 18z"
                />
              </svg>
              <span>{standingsLikeCount}</span>
            </button>
          </div>

          {canComment ? (
            <div className="grid gap-2">
              <Input
                placeholder="Add a comment about standings..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button type="button" onClick={submitComment} className="btn btn-outline">
                Post
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              Comments are read-only for your role.
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-500">
            {commentCount} comments
          </div>

          {commentCount ? (
            <div className="grid gap-2">
              {standingsComments.map((c) => (
                <div
                  key={c.id}
                  className="text-xs text-slate-600 flex items-center justify-between gap-2"
                >
                  <span>
                    <span className="font-semibold">{c.author}</span>: {c.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => onLikeComment(c.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                    disabled={!canLike}
                  >
                    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M10 18a1 1 0 0 1-.7-.29l-6.4-6.3a4.3 4.3 0 0 1 0-6.1 4.34 4.34 0 0 1 6.1 0l1 1 1-1a4.34 4.34 0 0 1 6.1 0 4.3 4.3 0 0 1 0 6.1l-6.4 6.3A1 1 0 0 1 10 18z"
                      />
                    </svg>
                    <span>{c.likes || 0}</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500">No comments yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
