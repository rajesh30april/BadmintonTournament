import { useMemo, useState } from "react";
import { Card, CardContent, Input } from "../ui";

export default function ReportsSection({ fixtures, scores, teams }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const teamStats = new Map();
  const playerStats = new Map();
  const headToHead = new Map();

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

  const addHeadToHead = (t1, t2, winner) => {
    const key = [t1, t2].sort().join("__");
    if (!headToHead.has(key)) {
      headToHead.set(key, {
        key,
        t1,
        t2,
        played: 0,
        t1Wins: 0,
        t2Wins: 0,
      });
    }
    const row = headToHead.get(key);
    row.played += 1;
    if (winner === "t1") row.t1Wins += 1;
    if (winner === "t2") row.t2Wins += 1;
  };

  fixtures.forEach((fx) => {
    const matchScores = scores?.[fx.key] || {};
    Object.values(matchScores).forEach((row) => {
      const t1Score = Number(row?.t1 ?? 0) || 0;
      const t2Score = Number(row?.t2 ?? 0) || 0;
      const winner = row?.winner || "";
      const t1 = fx.t1;
      const t2 = fx.t2;
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
        addHeadToHead(t1, t2, winner);
      }

      const team1Roster = teams.find((t) => t.name === t1)?.players || [];
      const team2Roster = teams.find((t) => t.name === t2)?.players || [];
      const t1p1 = row?.t1Player1 || "";
      const t1p2 = row?.t1Player2 || "";
      const t2p1 = row?.t2Player1 || "";
      const t2p2 = row?.t2Player2 || "";

      const resolveName = (roster, rank) =>
        roster.find((p) => p.rank === rank)?.name || "";

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
  const filteredTeams = normalizedQuery
    ? teamRows.filter((row) => filterByQuery(row.team))
    : teamRows;
  const filteredHead = normalizedQuery
    ? headRows.filter(
        (row) => filterByQuery(row.t1) || filterByQuery(row.t2)
      )
    : headRows;
  const filteredPlayers = normalizedQuery
    ? playerRows.filter(
        (row) => filterByQuery(row.name) || filterByQuery(row.team)
      )
    : playerRows;

  return (
    <div className="grid gap-4">
      <div className="text-xl font-extrabold">Reports</div>

      <Card>
        <CardContent>
          <Input
            placeholder="Search teams or players"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
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
