import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, Input, Select } from "../ui";

export default function ReportsSection({
  fixtures = [],
  scores = {},
  teams,
  matchRows = [],
}) {
  const [query, setQuery] = useState("");
  const [selectedTeams, setSelectedTeams] = useState([]);
  const normalizedQuery = query.trim().toLowerCase();
  const teamStats = new Map();
  const playerStats = new Map();
  const headToHead = new Map();
  const rowMeta = useMemo(() => {
    const map = new Map();
    (matchRows || []).forEach((row) => {
      map.set(String(row.id), {
        typeLabel: row.typeLabel || row.label || "",
        catA: row.catA || row.categories?.[0] || "",
        catB: row.catB || row.categories?.[1] || "",
      });
    });
    return map;
  }, [matchRows]);
  const teamOptions = useMemo(
    () =>
      (teams || [])
        .map((t) => t.name)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [teams]
  );
  useEffect(() => {
    if (!selectedTeams.length) return;
    const valid = new Set(teamOptions);
    const next = selectedTeams.filter((t) => valid.has(t));
    if (next.length !== selectedTeams.length) {
      setSelectedTeams(next);
    }
  }, [teamOptions, selectedTeams]);

  const getTeam = (name) => {
    if (!teamStats.has(name)) {
      teamStats.set(name, {
        team: name,
        played: 0,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      });
    }
    return teamStats.get(name);
  };

  const getPlayer = (key, team, name) => {
    if (!playerStats.has(key)) {
      playerStats.set(key, {
        key,
        team,
        name,
        played: 0,
        wins: 0,
        losses: 0,
        pointsFor: 0,
      });
    }
    return playerStats.get(key);
  };

  const addHeadToHead = (t1, t2, winner, categoryKey, typeLabel, detail) => {
    const [teamA, teamB] = [t1, t2].sort();
    const key = [teamA, teamB].join("__");
    if (!headToHead.has(key)) {
      headToHead.set(key, {
        key,
        t1: teamA,
        t2: teamB,
        played: 0,
        t1Wins: 0,
        t2Wins: 0,
        byCategory: {},
        matches: [],
      });
    }
    const row = headToHead.get(key);
    row.played += 1;
    const winnerTeam = winner === "t1" ? t1 : winner === "t2" ? t2 : "";
    const normalizedWinner =
      winnerTeam === row.t1 ? "t1" : winnerTeam === row.t2 ? "t2" : "";
    if (normalizedWinner === "t1") row.t1Wins += 1;
    if (normalizedWinner === "t2") row.t2Wins += 1;
    const cat = categoryKey || typeLabel || "Other";
    if (!row.byCategory[cat]) {
      row.byCategory[cat] = { played: 0, t1Wins: 0, t2Wins: 0 };
    }
    row.byCategory[cat].played += 1;
    if (normalizedWinner === "t1") row.byCategory[cat].t1Wins += 1;
    if (normalizedWinner === "t2") row.byCategory[cat].t2Wins += 1;
    if (detail) {
      const normalizedDetail = { ...detail };
      if (detail.t1 !== row.t1) {
        normalizedDetail.t1 = row.t1;
        normalizedDetail.t2 = row.t2;
        normalizedDetail.t1Players = detail.t2Players;
        normalizedDetail.t2Players = detail.t1Players;
        normalizedDetail.t1Score = detail.t2Score;
        normalizedDetail.t2Score = detail.t1Score;
        normalizedDetail.winner =
          detail.winner === row.t1
            ? row.t1
            : detail.winner === row.t2
              ? row.t2
              : "";
      }
      normalizedDetail.scoreText = `${normalizedDetail.t1Score}:${normalizedDetail.t2Score}`;
      normalizedDetail.resultText = normalizedDetail.winner
        ? `${normalizedDetail.winner} won`
        : normalizedDetail.t1Score || normalizedDetail.t2Score
          ? "Draw"
          : "No result";
      row.matches.push(normalizedDetail);
    }
  };

  const resolveCategoryFromRow = (row) => {
    if (!row || !teams?.length) return "";
    for (const team of teams) {
      for (const player of team.players || []) {
        if (player.rank === row.t1Player1) return player.category || "";
        if (player.rank === row.t1Player2) return player.category || "";
        if (player.rank === row.t2Player1) return player.category || "";
        if (player.rank === row.t2Player2) return player.category || "";
      }
    }
    return "";
  };

  const getCategoryFromRank = (rank) => {
    if (!rank) return "";
    const match = String(rank).match(/^[A-Za-z]+/);
    return match ? match[0].toUpperCase() : "";
  };

  fixtures.forEach((fx) => {
    const matchScores = scores?.[fx.key] || {};
    Object.entries(matchScores).forEach(([rowId, row]) => {
      const t1Score = Number(row?.t1 ?? 0) || 0;
      const t2Score = Number(row?.t2 ?? 0) || 0;
      const winner = row?.winner || "";
      const t1 = fx.t1;
      const t2 = fx.t2;
      const meta = rowMeta.get(String(rowId));
      const metaCategory =
        meta?.catA && meta?.catB ? `${meta.catA}${meta.catB}` : "";
      const category =
        metaCategory ||
        resolveCategoryFromRow(row) ||
        getCategoryFromRank(row?.t1Player1) ||
        getCategoryFromRank(row?.t1Player2) ||
        getCategoryFromRank(row?.t2Player1) ||
        getCategoryFromRank(row?.t2Player2) ||
        "";
      const team1 = getTeam(t1);
      const team2 = getTeam(t2);

      team1.pointsFor += t1Score;
      team1.pointsAgainst += t2Score;
      team2.pointsFor += t2Score;
      team2.pointsAgainst += t1Score;

      if (winner) {
        team1.played += 1;
        team2.played += 1;
        if (winner === "t1") {
          team1.wins += 1;
          team2.losses += 1;
        } else if (winner === "t2") {
          team2.wins += 1;
          team1.losses += 1;
        }
      }

      const team1Roster = teams.find((t) => t.name === t1)?.players || [];
      const team2Roster = teams.find((t) => t.name === t2)?.players || [];
      const t1p1 = row?.t1Player1 || "";
      const t1p2 = row?.t1Player2 || "";
      const t2p1 = row?.t2Player1 || "";
      const t2p2 = row?.t2Player2 || "";

      const resolveName = (roster, rank) =>
        roster.find((p) => p.rank === rank)?.name || "";
      const resolvePlayerLabel = (roster, rank) => {
        if (!rank) return "";
        const name = resolveName(roster, rank);
        return name ? `${rank} - ${name}` : rank;
      };

      const registerPlayer = (teamName, rank, score, won) => {
        if (!rank) return;
        const name = resolveName(
          teamName === t1 ? team1Roster : team2Roster,
          rank
        );
        const key = `${teamName}:${rank}`;
        const player = getPlayer(key, teamName, name || rank);
        player.played += 1;
        player.pointsFor += score;
        if (won) player.wins += 1;
        else if (winner) player.losses += 1;
      };

      registerPlayer(t1, t1p1, t1Score, winner === "t1");
      registerPlayer(t1, t1p2, t1Score, winner === "t1");
      registerPlayer(t2, t2p1, t2Score, winner === "t2");
      registerPlayer(t2, t2p2, t2Score, winner === "t2");

      if (winner) {
        const detail = {
          id: `${fx.key}:${rowId}`,
          categoryLabel: meta?.typeLabel || category || "Match",
          t1,
          t2,
          t1Players: [t1p1, t1p2]
            .filter(Boolean)
            .map((rank) => resolvePlayerLabel(team1Roster, rank)),
          t2Players: [t2p1, t2p2]
            .filter(Boolean)
            .map((rank) => resolvePlayerLabel(team2Roster, rank)),
          t1Score,
          t2Score,
          winner: winner === "t1" ? t1 : winner === "t2" ? t2 : "",
        };
        addHeadToHead(t1, t2, winner, category, meta?.typeLabel, detail);
      }
    });
  });

  const teamRows = useMemo(
    () =>
      Array.from(teamStats.values()).sort(
        (a, b) => b.wins - a.wins || b.pointsFor - a.pointsFor
      ),
    [teamStats]
  );
  const playerRows = useMemo(
    () =>
      Array.from(playerStats.values()).sort(
        (a, b) => b.wins - a.wins || b.pointsFor - a.pointsFor
      ),
    [playerStats]
  );
  const headRows = useMemo(
    () => Array.from(headToHead.values()).sort((a, b) => b.played - a.played),
    [headToHead]
  );

  const filterByQuery = (text) =>
    !normalizedQuery || text.toLowerCase().includes(normalizedQuery);
  const hasTeamFilter = selectedTeams.length > 0;
  const selectedSet = new Set(selectedTeams);
  const filteredTeamsBase = hasTeamFilter
    ? teamRows.filter((row) => selectedSet.has(row.team))
    : teamRows;
  const filteredHeadBase = hasTeamFilter
    ? headRows.filter((row) => {
        if (selectedTeams.length === 1) {
          return row.t1 === selectedTeams[0] || row.t2 === selectedTeams[0];
        }
        return selectedSet.has(row.t1) && selectedSet.has(row.t2);
      })
    : headRows;
  const filteredPlayersBase = hasTeamFilter
    ? playerRows.filter((row) => selectedSet.has(row.team))
    : playerRows;
  const filteredTeams = normalizedQuery
    ? filteredTeamsBase.filter((row) => filterByQuery(row.team))
    : filteredTeamsBase;
  const filteredHead = normalizedQuery
    ? filteredHeadBase.filter(
        (row) => filterByQuery(row.t1) || filterByQuery(row.t2)
      )
    : filteredHeadBase;
  const filteredPlayers = normalizedQuery
    ? filteredPlayersBase.filter(
        (row) => filterByQuery(row.name) || filterByQuery(row.team)
      )
    : filteredPlayersBase;

  return (
    <div className="grid gap-4">
      <div className="text-xl font-extrabold">Reports</div>

      <Card>
        <CardContent>
          <div className="grid gap-3">
            <div className="text-xs font-semibold text-slate-600">
              Filter by teams
            </div>
            <Select
              multiple
              size={Math.min(6, Math.max(3, teamOptions.length || 3))}
              value={selectedTeams}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions).map(
                  (opt) => opt.value
                );
                setSelectedTeams(values);
              }}
              className="min-h-[110px]"
            >
              {teamOptions.length ? (
                teamOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))
              ) : (
                <option disabled value="">
                  No teams yet
                </option>
              )}
            </Select>
            <Input
              placeholder="Search teams or players"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <details className="rounded-2xl border border-slate-200 bg-white p-4" open>
        <summary className="cursor-pointer text-sm font-extrabold text-slate-900">
          Team Totals
        </summary>
        <div className="mt-3">
          {filteredTeams.length ? (
            <div className="grid gap-2">
              {filteredTeams.map((row) => (
                <div
                  key={row.team}
                  className="grid grid-cols-[1fr_auto] gap-2 border rounded-xl px-3 py-2"
                >
                  <div>
                    <div className="font-bold">{row.team}</div>
                    <div className="text-xs text-slate-500">
                      Played {row.played} • W {row.wins} • L {row.losses}
                    </div>
                  </div>
                  <div className="text-right text-xs font-semibold text-slate-700">
                    {row.pointsFor}:{row.pointsAgainst}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">No scores yet.</div>
          )}
        </div>
      </details>

      <details className="rounded-2xl border border-slate-200 bg-white p-4" open>
        <summary className="cursor-pointer text-sm font-extrabold text-slate-900">
          Team vs Team
        </summary>
        <div className="mt-3">
          {filteredHead.length ? (
            <div className="grid gap-2">
              {filteredHead.map((row) => (
                <details
                  key={row.key}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                >
                  <summary className="cursor-pointer font-semibold">
                    {row.t1} vs {row.t2}
                  </summary>
                  <div className="mt-2 text-xs text-slate-600">
                    Played {row.played} • {row.t1} {row.t1Wins} - {row.t2Wins}{" "}
                    {row.t2}
                  </div>
                  {row.byCategory && Object.keys(row.byCategory).length ? (
                    <div className="mt-2 grid gap-1 text-[11px] text-slate-600">
                      {Object.entries(row.byCategory).map(([cat, stats]) => (
                        <div key={cat} className="flex items-center justify-between">
                          <span className="font-semibold">{cat}</span>
                          <span>
                            {row.t1} {stats.t1Wins} - {stats.t2Wins} {row.t2} •{" "}
                            {stats.played} played
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {row.matches && row.matches.length ? (
                    <div className="mt-3 grid gap-2">
                      {row.matches.map((match) => (
                        <div
                          key={match.id}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold">
                              {match.categoryLabel}
                            </span>
                            <span className="font-bold">{match.scoreText}</span>
                          </div>
                          <div className="mt-1 grid gap-1 text-[11px] text-slate-600">
                            <div>
                              <span className="font-semibold">{row.t1}:</span>{" "}
                              {match.t1Players?.length
                                ? match.t1Players.join(", ")
                                : "—"}
                            </div>
                            <div>
                              <span className="font-semibold">{row.t2}:</span>{" "}
                              {match.t2Players?.length
                                ? match.t2Players.join(", ")
                                : "—"}
                            </div>
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">
                            {match.resultText}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </details>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">No head-to-head data yet.</div>
          )}
        </div>
      </details>

      <details className="rounded-2xl border border-slate-200 bg-white p-4" open>
        <summary className="cursor-pointer text-sm font-extrabold text-slate-900">
          Player Matches
        </summary>
        <div className="mt-3">
          {filteredPlayers.length ? (
            <div className="grid gap-2">
              {filteredPlayers.map((row) => (
                <div
                  key={row.key}
                  className="grid grid-cols-[1fr_auto] gap-2 border rounded-xl px-3 py-2"
                >
                  <div>
                    <div className="font-semibold">{row.name}</div>
                    <div className="text-xs text-slate-500">{row.team}</div>
                  </div>
                  <div className="text-xs text-slate-600 text-right">
                    Played {row.played} • W {row.wins} • L {row.losses} •{" "}
                    {row.pointsFor}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">
              Select players in Score to populate this report.
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
