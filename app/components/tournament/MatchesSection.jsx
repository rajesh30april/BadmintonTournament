import { useEffect, useState } from "react";
import { Card, CardContent, Input, Select } from "../ui";

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
  playerSlots = 2,
  tournamentType = "team",
  comments = [],
  matchLikes = [],
  onAddComment = () => {},
  onLikeComment = () => {},
  onLikeMatch = () => {},
  canComment = false,
  currentUser = null,
  readOnly = false,
}) {
  const [query, setQuery] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});
  const [selectedFixtureKey, setSelectedFixtureKey] = useState("");
  const [selectedRowId, setSelectedRowId] = useState("");
  const canLike = Boolean(currentUser?.username);
  const normalizedQuery = query.trim().toLowerCase();
  const safeFixtures = Array.isArray(fixtures) ? fixtures : [];
  const safeMatchRows = Array.isArray(matchRows) ? matchRows : [];
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
        ...(playerSlots === 2 ? [t1p2, getPlayerName(t1, t1p2)] : []),
        t2p1,
        getPlayerName(t2, t2p1),
        ...(playerSlots === 2 ? [t2p2, getPlayerName(t2, t2p2)] : [])
      );
    });
    return parts.filter(Boolean).join(" ").toLowerCase();
  };
  const pairKey = (t1, t2) => [t1, t2].sort().join(" vs ");
  const pairMap = (() => {
    const map = new Map();
    safeFixtures.forEach((fx) => {
      const key = pairKey(fx.t1, fx.t2);
      if (!map.has(key)) {
        map.set(key, { key, label: `${fx.t1} vs ${fx.t2}`, fixtures: [] });
      }
      map.get(key).fixtures.push(fx);
    });
    return map;
  })();
  const pairOptions = Array.from(pairMap.values());
  const fixtureLabel = (fx, idx) => {
    if (fx?.date) return `Match ${idx + 1} • ${fx.date}`;
    return `Match ${idx + 1}`;
  };

  const filteredPairs = normalizedQuery
    ? pairOptions.filter((pair) => {
        const label = pair.label.toLowerCase();
        if (label.includes(normalizedQuery)) return true;
        return pair.fixtures.some((fx) => {
          const t1Players = teamLookup.get(fx.t1) || "";
          const t2Players = teamLookup.get(fx.t2) || "";
          const scorePlayers = scoreSearchText(fx.key, fx.t1, fx.t2);
          return (
            t1Players.includes(normalizedQuery) ||
            t2Players.includes(normalizedQuery) ||
            scorePlayers.includes(normalizedQuery)
          );
        });
      })
    : pairOptions;

  useEffect(() => {
    if (!selectedMatch) return;
    const stillVisible = filteredPairs.some((m) => m.key === selectedMatch);
    if (!stillVisible) {
      onSelectMatch("");
    }
  }, [filteredPairs, selectedMatch, onSelectMatch]);

  const rowMatchesQuery = (row, t1, t2, fixtureKey) => {
    if (!normalizedQuery) return true;
    const rowScore = scores?.[fixtureKey]?.[row.id] || {};
    const t1p1 = rowScore.t1Player1 || "";
    const t1p2 = rowScore.t1Player2 || "";
    const t2p1 = rowScore.t2Player1 || "";
    const t2p2 = rowScore.t2Player2 || "";
    const t1Name1 = getPlayerName(t1, t1p1);
    const t1Name2 = getPlayerName(t1, t1p2);
    const t2Name1 = getPlayerName(t2, t2p1);
    const t2Name2 = getPlayerName(t2, t2p2);
    const parts = [
      t1,
      t2,
      t1p1,
      t1Name1,
      ...(playerSlots === 2 ? [t1p2, t1Name2] : []),
      t2p1,
      t2Name1,
      ...(playerSlots === 2 ? [t2p2, t2Name2] : []),
      rowScore.t1 ?? "",
      rowScore.t2 ?? "",
    ]
      .map((value) => String(value || "").toLowerCase())
      .filter(Boolean);
    return parts.some((value) => value.includes(normalizedQuery));
  };

  const selectedFixtures = selectedMatch
    ? pairMap.get(selectedMatch)?.fixtures || []
    : [];
  useEffect(() => {
    if (!selectedFixtures.length) {
      setSelectedFixtureKey("");
      return;
    }
    const stillValid = selectedFixtures.some((fx) => fx.key === selectedFixtureKey);
    if (!stillValid) {
      setSelectedFixtureKey(selectedFixtures[0]?.key || "");
    }
  }, [selectedFixtures, selectedFixtureKey]);
  const selectedFixture =
    selectedFixtures.find((fx) => fx.key === selectedFixtureKey) ||
    selectedFixtures[0] ||
    null;
  const visibleRowsForFixture = selectedFixture
    ? safeMatchRows.filter((row) =>
        rowMatchesQuery(row, selectedFixture.t1, selectedFixture.t2, selectedFixture.key)
      )
    : [];
  useEffect(() => {
    if (!visibleRowsForFixture.length) {
      setSelectedRowId("");
      return;
    }
    const stillValid = visibleRowsForFixture.some(
      (row) => String(row.id) === String(selectedRowId)
    );
    if (!stillValid) {
      setSelectedRowId(String(visibleRowsForFixture[0]?.id || ""));
    }
  }, [visibleRowsForFixture, selectedRowId]);
  const missingData =
    selectedMatch && selectedFixture
      ? safeMatchRows.some((row) => {
          const rowScore = scores?.[selectedFixture.key]?.[row.id] || {};
          const p1 = rowScore.t1Player1 || "";
          const p2 = rowScore.t1Player2 || "";
          const p3 = rowScore.t2Player1 || "";
          const p4 = rowScore.t2Player2 || "";
          const t1 = rowScore.t1 ?? "";
          const t2 = rowScore.t2 ?? "";
          const w = rowScore.winner || "";
          const missingPlayers =
            playerSlots === 1 ? !p1 || !p3 : !p1 || !p2 || !p3 || !p4;
          return missingPlayers || t1 === "" || t2 === "" || !w;
        })
      : false;

  useEffect(() => {
    if (tournamentType !== "doubles" || !selectedFixture) return;
    const fx = selectedFixture;
    const team1 = teamByName.get(fx.t1);
    const team2 = teamByName.get(fx.t2);
    const t1Players = team1?.players || [];
    const t2Players = team2?.players || [];
    const t1p1 = t1Players[0]?.rank || "";
    const t1p2 = t1Players[1]?.rank || "";
    const t2p1 = t2Players[0]?.rank || "";
    const t2p2 = t2Players[1]?.rank || "";
    safeMatchRows.forEach((row) => {
      const rowScore = scores?.[fx.key]?.[row.id] || {};
      if (
        rowScore.t1Player1 ||
        rowScore.t1Player2 ||
        rowScore.t2Player1 ||
        rowScore.t2Player2
      ) {
        return;
      }
      if (t1p1) upsertScore(fx.key, row.id, "t1Player1", t1p1);
      if (t1p2) upsertScore(fx.key, row.id, "t1Player2", t1p2);
      if (t2p1) upsertScore(fx.key, row.id, "t2Player1", t2p1);
      if (t2p2) upsertScore(fx.key, row.id, "t2Player2", t2p2);
    });
  }, [tournamentType, selectedFixture, safeMatchRows, scores, upsertScore, teamByName]);

  const commentsFor = (fixtureKey, rowId) =>
    comments.filter(
      (c) => c.fixtureKey === fixtureKey && String(c.rowId) === String(rowId)
    );
  const likeFor = (fixtureKey, rowId) =>
    matchLikes.find(
      (m) => m.fixtureKey === fixtureKey && String(m.rowId) === String(rowId)
    );

  const updateDraft = (fixtureKey, rowId, value) => {
    const key = `${fixtureKey}__${rowId}`;
    setCommentDrafts((prev) => ({ ...prev, [key]: value }));
  };

  const submitComment = (fixtureKey, rowId) => {
    const key = `${fixtureKey}__${rowId}`;
    const text = (commentDrafts[key] || "").trim();
    if (!text) return;
    onAddComment({ fixtureKey, rowId, text });
    setCommentDrafts((prev) => ({ ...prev, [key]: "" }));
  };

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

          {safeFixtures.length === 0 ? (
            <div className="px-4 pb-4 text-sm text-slate-600">
              Add at least 2 teams in Setup.
            </div>
          ) : filteredPairs.length === 0 ? (
            <div className="px-4 pb-4 text-sm text-slate-600">
              No matches found.
            </div>
          ) : (
            <div className="px-4 pb-4 grid gap-2">
              <Select
                value={selectedMatch}
                onChange={(e) => onSelectMatch(e.target.value)}
              >
                <option value="">Choose teams</option>
                {filteredPairs.map((pair) => (
                  <option key={pair.key} value={pair.key}>
                    {pair.label}
                  </option>
                ))}
              </Select>
              {selectedMatch && selectedFixtures.length > 1 ? (
                <Select
                  value={selectedFixtureKey}
                  onChange={(e) => setSelectedFixtureKey(e.target.value)}
                >
                  {selectedFixtures.map((fx, idx) => (
                    <option key={fx.key} value={fx.key}>
                      {fixtureLabel(fx, idx)}
                    </option>
                  ))}
                </Select>
              ) : selectedMatch && selectedFixtures.length === 1 ? (
                <div className="text-xs text-slate-500">
                  {fixtureLabel(selectedFixtures[0], 0)}
                </div>
              ) : null}
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
              if (!selectedFixture) return null;
              const fx = selectedFixture;
              const t1 = fx.t1 || "Team 1";
              const t2 = fx.t2 || "Team 2";
              const team1 = teams.find((t) => t.name === t1);
              const team2 = teams.find((t) => t.name === t2);
              const visibleRows = visibleRowsForFixture;
              const selectedRow =
                visibleRows.find((row) => String(row.id) === String(selectedRowId)) ||
                visibleRows[0] ||
                null;
              return (
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <div className="text-sm font-extrabold">
                      {fixtureLabel(
                        fx,
                        Math.max(
                          0,
                          selectedFixtures.findIndex((f) => f.key === fx.key)
                        )
                      )}
                    </div>
                    {safeMatchRows.length === 0 ? (
                      <div className="text-sm text-slate-600">
                        No match rows configured. Set counts in Setup.
                      </div>
                    ) : visibleRows.length === 0 ? (
                      <div className="text-sm text-slate-600">
                        No matches found for "{query}".
                      </div>
                    ) : null}
                    {visibleRows.length > 1 ? (
                      <Select
                        value={selectedRowId}
                        onChange={(e) => setSelectedRowId(e.target.value)}
                      >
                        {visibleRows.map((row) => (
                          <option key={row.id} value={row.id}>
                            {row.label}
                          </option>
                        ))}
                      </Select>
                    ) : null}
                    {selectedRow ? (() => {
                      const row = selectedRow;
                      const commentList = commentsFor(fx.key, row.id);
                      const commentCount = commentList.length;
                      const likeEntry = likeFor(fx.key, row.id);
                      const matchLikeCount = likeEntry?.likes || 0;
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
                          const t1p1 =
                            scores[fx.key]?.[row.id]?.t1Player1 || "";
                          const t1p2 =
                            scores[fx.key]?.[row.id]?.t1Player2 || "";
                          const t2p1 =
                            scores[fx.key]?.[row.id]?.t2Player1 || "";
                          const t2p2 =
                            scores[fx.key]?.[row.id]?.t2Player2 || "";
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
                                {(() => {
                                  const typeRows = safeMatchRows.filter(
                                    (r) => r.label === row.label
                                  );
                                  const typeIndex =
                                    typeRows.findIndex((r) => r.id === row.id) + 1;
                                  if (typeRows.length > 1) {
                                    return `${row.label} · Match ${typeIndex} of ${typeRows.length}`;
                                  }
                                  return `${row.label} Match`;
                                })()}
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

                                <div
                                  className={`grid ${
                                    playerSlots === 1 ? "grid-cols-1" : "grid-cols-2"
                                  } gap-2`}
                                >
                                  <div className="grid gap-2">
                                    <div className="text-xs font-bold text-slate-600 mb-1">
                                      {t1} Players
                                    </div>
                                    {tournamentType === "doubles" ? (
                                      <div className="grid gap-2">
                                        <Input
                                          value={team1Opts1[0]?.label || ""}
                                          readOnly
                                        />
                                        {playerSlots === 2 ? (
                                          <Input
                                            value={team1Opts1[1]?.label || ""}
                                            readOnly
                                          />
                                        ) : null}
                                      </div>
                                    ) : (
                                      <>
                                        <Select
                                          value={t1p1}
                                          onChange={(e) =>
                                            upsertScore(
                                              fx.key,
                                              row.id,
                                              "t1Player1",
                                              e.target.value
                                            )
                                          }
                                          disabled={readOnly}
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
                                        {playerSlots === 2 ? (
                                          <Select
                                            value={t1p2}
                                            onChange={(e) =>
                                              upsertScore(
                                                fx.key,
                                                row.id,
                                                "t1Player2",
                                                e.target.value
                                              )
                                            }
                                            disabled={readOnly}
                                          >
                                            <option value="">
                                              Select {sameCat ? cat1 : cat2} Player
                                            </option>
                                            {(sameCat ? team1Opts1 : team1Opts2)
                                              .filter((p) =>
                                                sameCat ? p.value !== t1p1 : true
                                              )
                                              .map((p) => (
                                                <option key={p.value} value={p.value}>
                                                  {p.label}
                                                </option>
                                              ))}
                                          </Select>
                                        ) : null}
                                      </>
                                    )}
                                  </div>
                                  <div className="grid gap-2">
                                    <div className="text-xs font-bold text-slate-600 mb-1">
                                      {t2} Players
                                    </div>
                                    {tournamentType === "doubles" ? (
                                      <div className="grid gap-2">
                                        <Input
                                          value={team2Opts1[0]?.label || ""}
                                          readOnly
                                        />
                                        {playerSlots === 2 ? (
                                          <Input
                                            value={team2Opts1[1]?.label || ""}
                                            readOnly
                                          />
                                        ) : null}
                                      </div>
                                    ) : (
                                      <>
                                        <Select
                                          value={t2p1}
                                          onChange={(e) =>
                                            upsertScore(
                                              fx.key,
                                              row.id,
                                              "t2Player1",
                                              e.target.value
                                            )
                                          }
                                          disabled={readOnly}
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
                                        {playerSlots === 2 ? (
                                          <Select
                                            value={t2p2}
                                            onChange={(e) =>
                                              upsertScore(
                                                fx.key,
                                                row.id,
                                                "t2Player2",
                                                e.target.value
                                              )
                                            }
                                            disabled={readOnly}
                                          >
                                            <option value="">
                                              Select {sameCat ? cat1 : cat2} Player
                                            </option>
                                            {(sameCat ? team2Opts1 : team2Opts2)
                                              .filter((p) =>
                                                sameCat ? p.value !== t2p1 : true
                                              )
                                              .map((p) => (
                                                <option key={p.value} value={p.value}>
                                                  {p.label}
                                                </option>
                                              ))}
                                          </Select>
                                        ) : null}
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <div className="text-xs font-bold text-slate-600 mb-1">
                                      {t1} Score
                                    </div>
                                    <Input
                                      type="number"
                                      value={scores[fx.key]?.[row.id]?.t1 ?? ""}
                                      onChange={(e) =>
                                        upsertScore(
                                          fx.key,
                                          row.id,
                                          "t1",
                                          e.target.value
                                        )
                                      }
                                      disabled={readOnly}
                                    />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-600 mb-1">
                                      {t2} Score
                                    </div>
                                    <Input
                                      type="number"
                                      value={scores[fx.key]?.[row.id]?.t2 ?? ""}
                                      onChange={(e) =>
                                        upsertScore(
                                          fx.key,
                                          row.id,
                                          "t2",
                                          e.target.value
                                        )
                                      }
                                      disabled={readOnly}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <div className="text-xs font-bold text-slate-600 mb-1">
                                    Winner
                                  </div>
                                  <Select
                                    value={scores[fx.key]?.[row.id]?.winner || ""}
                                    onChange={(e) =>
                                      upsertScore(
                                        fx.key,
                                        row.id,
                                        "winner",
                                        e.target.value
                                      )
                                    }
                                    disabled={readOnly}
                                  >
                                    <option value="">Select Winner</option>
                                    <option value="t1">{t1}</option>
                                    <option value="t2">{t2}</option>
                                  </Select>
                                </div>

                                <div className="border-t pt-2">
                                  <div className="text-xs font-bold text-slate-600 mb-1">
                                    Comments ({commentCount})
                                  </div>
                                  <div className="mt-2 grid gap-2">
                                    {canComment ? (
                                      <Input
                                        placeholder="Add a comment..."
                                        value={
                                          commentDrafts[`${fx.key}__${row.id}`] || ""
                                        }
                                        onChange={(e) =>
                                          updateDraft(
                                            fx.key,
                                            row.id,
                                            e.target.value
                                          )
                                        }
                                      />
                                    ) : (
                                      <div className="text-xs text-slate-500">
                                        Comments are read-only for your role.
                                      </div>
                                    )}
                                    <div className="flex flex-wrap items-center gap-2">
                                      {canComment ? (
                                        <button
                                          type="button"
                                          onClick={() => submitComment(fx.key, row.id)}
                                          className="btn btn-outline"
                                        >
                                          Post
                                        </button>
                                      ) : null}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          onLikeMatch({
                                            fixtureKey: fx.key,
                                            rowId: row.id,
                                          })
                                        }
                                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                                        disabled={!canLike}
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
                                        <span>{matchLikeCount}</span>
                                      </button>
                                      <span className="text-xs text-slate-500">
                                        {commentCount} comments
                                      </span>
                                    </div>
                                  </div>
                                  {commentCount ? (
                                    <div className="mt-3 grid gap-2">
                                      {commentList.map((c) => (
                                        <div
                                          key={c.id}
                                          className="text-xs text-slate-600 flex items-center justify-between gap-2"
                                        >
                                          <span>
                                            <span className="font-semibold">
                                              {c.author}
                                            </span>
                                            : {c.text}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => onLikeComment(c.id)}
                                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                                            disabled={!canLike}
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
                                            <span>{c.likes || 0}</span>
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="mt-2 text-xs text-slate-500">
                                      No comments yet.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                    })() : null}
                  </div>
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
