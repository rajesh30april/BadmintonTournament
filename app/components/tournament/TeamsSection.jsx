import { Button, Card, CardContent, Input, Select } from "../ui";

export default function TeamsSection({
  teams,
  categoryKeysSorted,
  updateOwner,
  updatePlayerName,
  tournamentType = "team",
  newTeamName,
  setNewTeamName,
  addTeam,
  totalPlayers = 0,
  categories = [],
  profiles = [],
  readOnly = false,
  showTitle = true,
}) {
  const showCategories = categoryKeysSorted.length > 0;
  const playersLabel = tournamentType === "singles" ? "Players" : "Teams";
  const addLabel = tournamentType === "singles" ? "Add Player" : "Add Team";
  const ownerOptions = profiles.filter(
    (p) => p.role === "owner" || p.role === "both"
  );
  const playerOptions = profiles.filter(
    (p) => p.role === "player" || p.role === "both"
  );
  return (
    <div className="grid gap-3">
      {showTitle ? (
        <div>
          <div className="text-xl font-extrabold">
            {tournamentType === "team" ? "Teams" : playersLabel}
          </div>
          <div className="text-xs text-slate-500">
            {teams.length} teams • {totalPlayers} players
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-extrabold mb-2">{addLabel}</div>
        <div className="flex gap-2">
          <Input
            placeholder={
              tournamentType === "team" && !categories.length
                ? "Add categories first"
                : "Team name"
            }
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            disabled={(tournamentType === "team" && !categories.length) || readOnly}
          />
          <Button
            onClick={addTeam}
            disabled={(tournamentType === "team" && !categories.length) || readOnly}
          >
            + Add
          </Button>
        </div>
      </div>

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

              {tournamentType === "team" ? (
                <div>
                  <div className="text-sm font-bold text-slate-600 mb-1">Owner</div>
                  <Select
                    value={t.owner || ""}
                    onChange={(e) => updateOwner(t.name, e.target.value)}
                    disabled={readOnly || ownerOptions.length === 0}
                  >
                    <option value="">
                      {ownerOptions.length ? "Select owner" : "Add owner profiles first"}
                    </option>
                    {ownerOptions.map((p) => (
                      <option key={p.id || p.name} value={p.name}>
                        {p.name}
                        {p.phone ? ` • ${p.phone}` : ""}
                      </option>
                    ))}
                  </Select>
                </div>
              ) : null}

              {showCategories ? (
                categoryKeysSorted.map((k) => {
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
                              <Select
                                value={p.name || ""}
                                onChange={(e) =>
                                  updatePlayerName(t.name, p.rank, e.target.value)
                                }
                                disabled={readOnly || playerOptions.length === 0}
                              >
                                <option value="">
                                  {playerOptions.length
                                    ? "Select player"
                                    : "Add player profiles first"}
                                </option>
                                {playerOptions.map((pl) => (
                                  <option key={pl.id || pl.name} value={pl.name}>
                                    {pl.name}
                                    {pl.phone ? ` • ${pl.phone}` : ""}
                                  </option>
                                ))}
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="border rounded-2xl overflow-hidden bg-white">
                  <div className="px-3 py-2 bg-slate-50 border-b text-sm font-extrabold">
                    Players{" "}
                    <span className="text-slate-500 font-bold">
                      ({t.players?.length || 0})
                    </span>
                  </div>
                  <div className="p-3 grid gap-2">
                    {(t.players || []).map((p) => (
                      <div key={p.rank} className="grid grid-cols-3 gap-2 items-center">
                        <div className="text-sm font-extrabold">{p.rank}</div>
                        <div className="col-span-2">
                          <Select
                            value={p.name || ""}
                            onChange={(e) =>
                              updatePlayerName(t.name, p.rank, e.target.value)
                            }
                            disabled={readOnly || playerOptions.length === 0}
                          >
                            <option value="">
                              {playerOptions.length
                                ? "Select player"
                                : "Add player profiles first"}
                            </option>
                            {playerOptions.map((pl) => (
                              <option key={pl.id || pl.name} value={pl.name}>
                                {pl.name}
                                {pl.phone ? ` • ${pl.phone}` : ""}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        ))
     )}
    </div>
  );
}
