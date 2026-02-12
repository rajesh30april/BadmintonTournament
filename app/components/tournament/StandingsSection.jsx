import { Card, CardContent } from "../ui";

export default function StandingsSection({
  standings,
  showOwner = true,
  liveMatchView = null,
  canStopLive = false,
  onStopLive = () => {},
}) {
  const columns = showOwner ? "grid-cols-3" : "grid-cols-2";
  return (
    <div className="grid gap-3">
      <div className="text-xl font-extrabold">Standings</div>

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
              {canStopLive ? (
                <button
                  type="button"
                  onClick={onStopLive}
                  className="rounded-full border border-slate-300 bg-white px-4 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Stop
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
    </div>
  );
}
