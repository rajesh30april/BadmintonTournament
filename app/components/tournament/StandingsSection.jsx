import { Card, CardContent } from "../ui";

export default function StandingsSection({ standings, showOwner = true }) {
  const columns = showOwner ? "grid-cols-3" : "grid-cols-2";
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
    </div>
  );
}
