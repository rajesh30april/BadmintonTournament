import { Card, CardContent, Input } from "../ui";

export default function TeamsSection({
  teams,
  categoryKeysSorted,
  updateOwner,
  updatePlayerName,
  readOnly = false,
}) {
  return (
    <div className="grid gap-3">
      <div className="text-xl font-extrabold">Teams</div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="text-sm text-slate-600">
            No teams yet. Go to Setup.
          </CardContent>
        </Card>
      ) : (
        teams.map((t) => (
          <Card key={t.name}>
            <CardContent className="grid gap-3">
              <div className="flex items-center justify-between">
                <div className="text-lg font-extrabold">{t.name}</div>
                <span className="text-xs font-bold text-slate-500">
                  {t.players?.length || 0} players
                </span>
              </div>

              <div>
                <div className="text-sm font-bold text-slate-600 mb-1">Owner</div>
                <Input
                  value={t.owner || ""}
                  onChange={(e) => updateOwner(t.name, e.target.value)}
                  placeholder="Owner name"
                  disabled={readOnly}
                />
              </div>

              {categoryKeysSorted.map((k) => {
                const players = (t.players || []).filter((p) => p.category === k);
                return (
                  <div key={k} className="border rounded-2xl overflow-hidden bg-white">
                    <div className="px-3 py-2 bg-slate-50 border-b text-sm font-extrabold">
                      {k} Category{" "}
                      <span className="text-slate-500 font-bold">({players.length})</span>
                    </div>
                    <div className="p-3 grid gap-2">
                      {players.map((p) => (
                        <div key={p.rank} className="grid grid-cols-3 gap-2 items-center">
                          <div className="text-sm font-extrabold">{p.rank}</div>
                          <div className="col-span-2">
                            <Input
                              value={p.name || ""}
                              onChange={(e) =>
                                updatePlayerName(t.name, p.rank, e.target.value)
                              }
                              placeholder="Player name"
                              disabled={readOnly}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
