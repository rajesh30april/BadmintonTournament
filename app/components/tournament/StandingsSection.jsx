import { Card, CardContent } from "../ui";

export default function StandingsSection({ standings }) {
  return (
    <div className="grid gap-3">
      <div className="text-xl font-extrabold">Standings</div>

      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-3 bg-blue-700 text-white font-extrabold">
            Points Table
          </div>

          <div className="bg-white">
            <div className="grid grid-cols-3 px-4 py-2 text-sm font-extrabold border-b">
              <div>Team</div>
              <div>Owner</div>
              <div className="text-right">Points</div>
            </div>

            {standings.length === 0 ? (
              <div className="px-4 py-4 text-sm text-slate-600">No results yet.</div>
            ) : (
              standings.map((r) => (
                <div key={r.team} className="grid grid-cols-3 px-4 py-3 text-sm border-b">
                  <div className="text-blue-700 font-extrabold">{r.team}</div>
                  <div className="text-slate-700">{r.owner || "—"}</div>
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
