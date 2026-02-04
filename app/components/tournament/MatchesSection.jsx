import { useEffect, useState } from "react";
import { Card, CardContent, Input, Select } from "../ui";
import { cn } from "../../lib/tournament";

export default function MatchesSection({
  fixtures,
  selectedMatch,
  onSelectMatch,
  teams,
  matchTypeOptions = [],
  matchTypeConfig = {},
  matchRows = [],
  scores = {},
  upsertScore = () => {},
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const teamByName = new Map((teams || []).map((team) => [team.name, team]));
  const teamLookup = new Map(
    (teams || []).map((team) => {
      const players = team.players || [];
      const playerText = players
        .map((p) =>
          [p.rank, p.name, p.category].filter(Boolean).join(" ")
        )
        .join(" ");
      const searchText = [team.name, team.owner, playerText]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return [team.name, searchText];
    })
  );
  const getPlayerName = (teamName, rank) => {
    if (!rank) return "";
    const team = teamByName.get(teamName);
    const player = team?.players?.find((p) => p.rank === rank);
    return player?.name || "";
  };
  const scoreSearchText = (fixtureKey, t1, t2) => {
    const rowScores = scores?.[fixtureKey] || {};
    const values = Object.values(rowScores);
    if (!values.length) return "";
    const parts = [];
    values.forEach((row) => {
      const t1p1 = row?.t1Player1 || "";
      const t1p2 = row?.t1Player2 || "";
      const t2p1 = row?.t2Player1 || "";
      const t2p2 = row?.t2Player2 || "";
      parts.push(
        t1p1,
        getPlayerName(t1, t1p1),
        t1p2,
        getPlayerName(t1, t1p2),
        t2p1,
        getPlayerName(t2, t2p1),
        t2p2,
        getPlayerName(t2, t2p2)
      );
    });
    return parts.filter(Boolean).join(" ").toLowerCase();
  };
  const uniqueFixtures = (() => {
    const seen = new Set();
    return fixtures.filter((m) => {
      if (seen.has(m.key)) return false;
      seen.add(m.key);
      return true;
    });
  })();

  const filteredFixtures = normalizedQuery
    ? uniqueFixtures.filter((m) => {
        const key = m.key.toLowerCase();
        if (key.includes(normalizedQuery)) return true;
        const t1Players = teamLookup.get(m.t1) || "";
        const t2Players = teamLookup.get(m.t2) || "";
        const scorePlayers = scoreSearchText(m.key, m.t1, m.t2);
        return (
          t1Players.includes(normalizedQuery) ||
          t2Players.includes(normalizedQuery) ||
          scorePlayers.includes(normalizedQuery)
        );
      })
    : uniqueFixtures;

  useEffect(() => {
    if (!selectedMatch) return;
    const stillVisible = filteredFixtures.some((m) => m.key === selectedMatch);
    if (!stillVisible) {
      onSelectMatch("");
    }
  }, [filteredFixtures, selectedMatch, onSelectMatch]);

  const missingData = selectedMatch
    ? matchRows.some((row) => {
        const rowScore = scores[selectedMatch]?.[row.id] || {};
        const p1 = rowScore.t1Player1 || "";
        const p2 = rowScore.t1Player2 || "";
        const p3 = rowScore.t2Player1 || "";
        const p4 = rowScore.t2Player2 || "";
        const t1 = rowScore.t1 ?? "";
        const t2 = rowScore.t2 ?? "";
        const w = rowScore.winner || "";
        return !p1 || !p2 || !p3 || !p4 || t1 === "" || t2 === "" || !w;
      })
    : false;

  return (
    <div className="grid gap-3">
      <Card>
        <CardContent className="p-0">
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xl font-extrabold">Matches</div>
              <div className="text-sm text-slate-500">Round-robin fixtures</div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <Input
              placeholder="Search matches, teams, or players"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {fixtures.length === 0 ? (
            <div className="px-4 pb-4 text-sm text-slate-600">
              Add at least 2 teams in Setup.
            </div>
          ) : filteredFixtures.length === 0 ? (
            <div className="px-4 pb-4 text-sm text-slate-600">
              No matches found.
            </div>
          ) : (
            <div className="border-t">
              {filteredFixtures.map((m) => (
                <button
                  key={m.key}
                  className={cn(
                    "w-full px-4 py-3 flex items-center justify-between text-left border-b bg-white",
                    selectedMatch === m.key ? "bg-blue-50" : ""
                  )}
                  onClick={() => onSelectMatch(m.key)}
                >
                  <div className="font-bold">{m.key}</div>
                  <div className="text-slate-400 text-sm">›</div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedMatch ? (
        <Card>
          <CardContent className="grid gap-3">
            <div className="text-sm text-slate-600">
              Configured types:{" "}
              <b>
                {matchTypeOptions.length
                  ? matchTypeOptions
                      .filter((opt) => (matchTypeConfig?.[opt.key] || 0) > 0)
                      .map((opt) => `${opt.label}×${matchTypeConfig[opt.key]}`)
                      .join(", ") || "(none)"
                  : "(add categories)"}
              </b>
            </div>

            {(() => {
              const fx = fixtures.find((f) => f.key === selectedMatch);
              const t1 = fx?.t1 || "Team 1";
              const t2 = fx?.t2 || "Team 2";
              const team1 = teams.find((t) => t.name === t1);
              const team2 = teams.find((t) => t.name === t2);

              return (
                <div className="grid gap-3">
                  {matchRows.length === 0 ? (
                    <div className="text-sm text-slate-600">
                      No match rows configured. Set counts in Setup.
                    </div>
                  ) : null}
                  {matchRows.map((row) => {
                    const [cat1, cat2] = row.categories;
                    const sameCat = cat1 === cat2;
                    const team1Cat1 = (team1?.players || []).filter(
                      (p) => p.category === cat1
                    );
                    const team1Cat2 = (team1?.players || []).filter(
                      (p) => p.category === cat2
                    );
                    const team2Cat1 = (team2?.players || []).filter(
                      (p) => p.category === cat1
                    );
                    const team2Cat2 = (team2?.players || []).filter(
                      (p) => p.category === cat2
                    );
                    const t1p1 = scores[selectedMatch]?.[row.id]?.t1Player1 || "";
                    const t1p2 = scores[selectedMatch]?.[row.id]?.t1Player2 || "";
                    const t2p1 = scores[selectedMatch]?.[row.id]?.t2Player1 || "";
                    const t2p2 = scores[selectedMatch]?.[row.id]?.t2Player2 || "";
                    const team1Opts1 = team1Cat1.map((p) => ({
                      value: p.rank,
                      label: `${p.rank}${p.name ? ` - ${p.name}` : ""}`,
                    }));
                    const team1Opts2 = team1Cat2.map((p) => ({
                      value: p.rank,
                      label: `${p.rank}${p.name ? ` - ${p.name}` : ""}`,
                    }));
                    const team2Opts1 = team2Cat1.map((p) => ({
                      value: p.rank,
                      label: `${p.rank}${p.name ? ` - ${p.name}` : ""}`,
                    }));
                    const team2Opts2 = team2Cat2.map((p) => ({
                      value: p.rank,
                      label: `${p.rank}${p.name ? ` - ${p.name}` : ""}`,
                    }));
                    return (
                      <div
                        key={row.id}
                        className="border rounded-2xl bg-white overflow-hidden"
                      >
                        <div className="px-3 py-2 font-extrabold border-b">
                          Match {row.id}
                        </div>
                        <div className="p-3 grid gap-2">
                          <div>
                            <div className="text-xs font-bold text-slate-600 mb-1">
                              Type
                            </div>
                            <Select value={row.label} disabled>
                              <option value={row.label}>{row.label}</option>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-2">
                              <div className="text-xs font-bold text-slate-600 mb-1">
                                {t1} Players
                              </div>
                              <Select
                                value={t1p1}
                                onChange={(e) =>
                                  upsertScore(
                                    selectedMatch,
                                    row.id,
                                    "t1Player1",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">
                                  Select {cat1} Player
                                </option>
                                {team1Opts1.map((p) => (
                                  <option key={p.value} value={p.value}>
                                    {p.label}
                                  </option>
                                ))}
                              </Select>
                              <Select
                                value={t1p2}
                                onChange={(e) =>
                                  upsertScore(
                                    selectedMatch,
                                    row.id,
                                    "t1Player2",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">
                                  Select {sameCat ? cat1 : cat2} Player
                                </option>
                                {(sameCat ? team1Opts1 : team1Opts2)
                                  .filter((p) => (sameCat ? p.value !== t1p1 : true))
                                  .map((p) => (
                                    <option key={p.value} value={p.value}>
                                      {p.label}
                                    </option>
                                  ))}
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <div className="text-xs font-bold text-slate-600 mb-1">
                                {t2} Players
                              </div>
                              <Select
                                value={t2p1}
                                onChange={(e) =>
                                  upsertScore(
                                    selectedMatch,
                                    row.id,
                                    "t2Player1",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">
                                  Select {cat1} Player
                                </option>
                                {team2Opts1.map((p) => (
                                  <option key={p.value} value={p.value}>
                                    {p.label}
                                  </option>
                                ))}
                              </Select>
                              <Select
                                value={t2p2}
                                onChange={(e) =>
                                  upsertScore(
                                    selectedMatch,
                                    row.id,
                                    "t2Player2",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">
                                  Select {sameCat ? cat1 : cat2} Player
                                </option>
                                {(sameCat ? team2Opts1 : team2Opts2)
                                  .filter((p) => (sameCat ? p.value !== t2p1 : true))
                                  .map((p) => (
                                    <option key={p.value} value={p.value}>
                                      {p.label}
                                    </option>
                                  ))}
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs font-bold text-slate-600 mb-1">
                                {t1} Score
                              </div>
                              <Input
                                type="number"
                                value={scores[selectedMatch]?.[row.id]?.t1 ?? ""}
                                onChange={(e) =>
                                  upsertScore(selectedMatch, row.id, "t1", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-600 mb-1">
                                {t2} Score
                              </div>
                              <Input
                                type="number"
                                value={scores[selectedMatch]?.[row.id]?.t2 ?? ""}
                                onChange={(e) =>
                                  upsertScore(selectedMatch, row.id, "t2", e.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-bold text-slate-600 mb-1">
                              Winner
                            </div>
                            <Select
                              value={scores[selectedMatch]?.[row.id]?.winner || ""}
                              onChange={(e) =>
                                upsertScore(selectedMatch, row.id, "winner", e.target.value)
                              }
                            >
                              <option value="">Select Winner</option>
                              <option value="t1">{t1}</option>
                              <option value="t2">{t2}</option>
                            </Select>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {missingData ? (
                    <div className="text-xs text-amber-600">
                      Select players, enter scores, and choose a winner before saving.
                    </div>
                  ) : null}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-sm text-slate-600">Select a match above.</CardContent>
        </Card>
      )}
    </div>
  );
}
