"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  buildFixtures,
  buildMatchRows,
  buildMatchTypeOptions,
  buildPlayerSlots,
  slug,
} from "./lib/tournament";
import SetupSection from "./components/tournament/SetupSection";
import TeamsSection from "./components/tournament/TeamsSection";
import MatchesSection from "./components/tournament/MatchesSection";
import StandingsSection from "./components/tournament/StandingsSection";
import HeaderBar from "./components/tournament/HeaderBar";
import ReportsSection from "./components/tournament/ReportsSection";
import ProfilesSection from "./components/tournament/ProfilesSection";
import TopBanner from "./components/tournament/TopBanner";
import { Button, Card, CardContent, Select } from "./components/ui";

export default function Page() {
  const [tab, setTab] = useState("setup");
  const [menuOpen, setMenuOpen] = useState(false);
  const [tournamentName, setTournamentName] = useState("");
  const [tournamentType, setTournamentType] = useState("team");
  const [setupTab, setSetupTab] = useState("categories");
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [deleteTournamentId, setDeleteTournamentId] = useState("");
  const [loadingTournaments, setLoadingTournaments] = useState(false);
  const [loadingSelectedTournament, setLoadingSelectedTournament] = useState(false);
  const [savingTournament, setSavingTournament] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [loadSuccess, setLoadSuccess] = useState("");
  const [toast, setToast] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Global setup
  const [categories, setCategories] = useState([]); // {key,count}
  const [newCategoryKey, setNewCategoryKey] = useState("");
  const [newCategoryCount, setNewCategoryCount] = useState("");

  // Teams
  const [teams, setTeams] = useState([]); // {name, owner, players}
  const [newTeamName, setNewTeamName] = useState("");

  // Matches & scoring
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scores, setScores] = useState({});
  const [manualFixtures, setManualFixtures] = useState([]);
  const [newFixtureT1, setNewFixtureT1] = useState("");
  const [newFixtureT2, setNewFixtureT2] = useState("");
  const [profiles, setProfiles] = useState([]);

  const isTeamType = tournamentType === "team";

  const matchTypeOptions = useMemo(() => {
    if (isTeamType) return buildMatchTypeOptions(categories);
    return [
      {
        key: "P__P",
        label: tournamentType === "singles" ? "S" : "D",
        a: "P",
        b: "P",
      },
    ];
  }, [categories, isTeamType, tournamentType]);

  const [matchTypeConfig, setMatchTypeConfig] = useState({});

  useEffect(() => {
    if (!isTeamType) {
      setMatchTypeConfig({ P__P: 1 });
      return;
    }
    setMatchTypeConfig((prev) => {
      const next = {};
      matchTypeOptions.forEach((opt) => {
        const prevValue = prev[opt.key];
        next[opt.key] = Number.isFinite(prevValue) ? prevValue : 1;
      });
      return next;
    });
  }, [matchTypeOptions]);

  useEffect(() => {
    refreshTournaments();
    fetch("/api/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => setCurrentUser(json.user))
      .catch(() => setCurrentUser(null));
  }, []);

  useEffect(() => {
    fetch("/api/profiles", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => setProfiles(Array.isArray(json.data) ? json.data : []))
      .catch(() => setProfiles([]));
  }, []);

  useEffect(() => {
    setSetupTab(tournamentType === "team" ? "categories" : "teams");
  }, [selectedTournamentId, tournamentType]);

  useEffect(() => {
    if (!loadSuccess && !loadError) return;
    const type = loadError ? "error" : "success";
    const message = loadError || loadSuccess;
    setToast({ type, message });
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [loadSuccess, loadError]);

  const categoryKeysSorted = useMemo(() => {
    const keys = categories.map((c) => slug(c.key));
    return Array.from(new Set(keys)).sort();
  }, [categories]);

  const categoriesByKey = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[slug(c.key)] = c;
    });
    return map;
  }, [categories]);

  const fixtures = useMemo(
    () => (isTeamType ? buildFixtures(teams) : manualFixtures),
    [isTeamType, manualFixtures, teams]
  );

  const matchRows = useMemo(
    () => buildMatchRows(matchTypeOptions, matchTypeConfig),
    [matchTypeOptions, matchTypeConfig]
  );

  const totalPlayers = useMemo(
    () => teams.reduce((acc, t) => acc + (t.players?.length || 0), 0),
    [teams]
  );

  const addCategory = () => {
    const key = slug(newCategoryKey);
    const count = Number(newCategoryCount);
    if (!key || !Number.isFinite(count) || count <= 0) return;
    if (categories.some((c) => slug(c.key) === key)) return;
    setCategories((p) => [...p, { key, count }]);
    setNewCategoryKey("");
    setNewCategoryCount("");
  };

  const updateCategoryCount = (key, count) => {
    setCategories((p) =>
      p.map((c) => (slug(c.key) !== key ? c : { ...c, count }))
    );
  };

  const removeCategory = (key) => {
    setCategories((p) => p.filter((c) => slug(c.key) !== key));
  };

  const addTeam = () => {
    const name = newTeamName.trim();
    if (!name) return;
    if (teams.some((t) => t.name.toLowerCase() === name.toLowerCase())) return;
    const players = isTeamType
      ? buildPlayerSlots(categories)
      : [
          { category: "P", rank: "P1", name: "" },
          ...(tournamentType === "singles"
            ? []
            : [{ category: "P", rank: "P2", name: "" }]),
        ];
    setTeams((p) => [
      ...p,
      { name, owner: "", players },
    ]);
    setNewTeamName("");
  };

  const updateOwner = (teamName, owner) => {
    setTeams((p) => p.map((t) => (t.name !== teamName ? t : { ...t, owner })));
  };

  const updatePlayerName = (teamName, rank, name) => {
    setTeams((p) =>
      p.map((t) => {
        if (t.name !== teamName) return t;
        return {
          ...t,
          players: (t.players || []).map((pl) =>
            pl.rank !== rank ? pl : { ...pl, name }
          ),
        };
      })
    );
  };

  const applySetupToExistingTeams = () => {
    if (!isTeamType) return;
    setTeams((p) =>
      p.map((t) => {
        const newSlots = buildPlayerSlots(categories);
        const old = new Map((t.players || []).map((pl) => [pl.rank, pl.name]));
        return {
          ...t,
          players: newSlots.map((pl) => ({ ...pl, name: old.get(pl.rank) || "" })),
        };
      })
    );
  };

  const handleTypeChange = (next) => {
    if (next === tournamentType) return;
    setTournamentType(next);
    setSelectedMatch(null);
    setScores({});
    setManualFixtures([]);
    setNewFixtureT1("");
    setNewFixtureT2("");
    setTeams((prev) =>
      prev.map((t) => {
        if (next === "team") {
          return { ...t, players: buildPlayerSlots(categories) };
        }
        const players = [
          { category: "P", rank: "P1", name: "" },
          ...(next === "singles" ? [] : [{ category: "P", rank: "P2", name: "" }]),
        ];
        return { ...t, players };
      })
    );
  };

  const upsertScore = (matchKey, matchNo, field, value) => {
    setScores((prev) => ({
      ...prev,
      [matchKey]: {
        ...(prev[matchKey] || {}),
        [matchNo]: { ...(prev[matchKey]?.[matchNo] || {}), [field]: value },
      },
    }));
  };

  const standings = useMemo(() => {
    const map = new Map();
    teams.forEach((t) =>
      map.set(t.name, { team: t.name, owner: t.owner, points: 0 })
    );
    for (const fx of fixtures) {
      const ms = scores[fx.key] || {};
      for (const no in ms) {
        const row = ms[no];
        if (!row?.winner) continue;
        if (row.winner === "t1") map.get(fx.t1).points += 1;
        else if (row.winner === "t2") map.get(fx.t2).points += 1;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.points - a.points);
  }, [fixtures, scores, teams]);

  const refreshTournaments = async () => {
    setLoadingTournaments(true);
    setLoadError("");
    setLoadSuccess("");
    try {
      const res = await fetch("/api/tournaments", { cache: "no-store" });
      const json = await res.json();
      setTournaments(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setLoadError("Failed to load tournaments.");
    } finally {
      setLoadingTournaments(false);
    }
  };

  const loadTournament = async (id) => {
    if (!id) {
      setLoadError("Select a tournament to load.");
      return;
    }
    setLoadingSelectedTournament(true);
    setLoadError("");
    setLoadSuccess("");
    try {
      const res = await fetch(`/api/tournaments/${id}`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Not found");
      }
      const json = await res.json();
      const record = json.data;
      if (!record) {
        throw new Error("Not found");
      }
      setTournamentName(record.name || "");
      setTournamentType(record.type || "team");
      setCategories(Array.isArray(record.categories) ? record.categories : []);
      setMatchTypeConfig(record.matchTypeConfig || {});
      setTeams(Array.isArray(record.teams) ? record.teams : []);
      setScores(record.scores || {});
      setManualFixtures(Array.isArray(record.fixtures) ? record.fixtures : []);
      setSelectedMatch(null);
      setTab("setup");
      setLoadSuccess("Tournament loaded.");
    } catch (err) {
      setLoadError("Failed to load selected tournament.");
    } finally {
      setLoadingSelectedTournament(false);
    }
  };

  const selectedTournament =
    tournaments.find((t) => t.id === selectedTournamentId) || null;
  const isScorer =
    currentUser?.role !== "admin" && currentUser?.access === "score";
  const canUpdate =
    Boolean(selectedTournamentId) &&
    (currentUser?.role === "admin" ||
      currentUser?.access === "write" ||
      currentUser?.access === "score");
  const canSave = canUpdate && (!isScorer || tab === "matches");
  const canEditStructure =
    currentUser?.role === "admin" || currentUser?.access === "write";
  const tabs = ["setup", "profiles", "matches", "standings", "reports"];
  const tabIndex = Math.max(0, tabs.indexOf(tab));
  const canGoBack = tabIndex > 0;
  const canGoNext = tabIndex < tabs.length - 1;
  const goBack = () => {
    if (!canGoBack) return;
    setTab(tabs[tabIndex - 1]);
  };
  const goNext = () => {
    if (!canGoNext) return;
    setTab(tabs[tabIndex + 1]);
  };

  const saveNewTournament = async () => {
    setSavingTournament(true);
    setLoadError("");
    setLoadSuccess("");
    try {
      const fixturesPayload = isTeamType ? buildFixtures(teams) : manualFixtures;
      const payload = {
        name: tournamentName || "Untitled Tournament",
        type: tournamentType,
        categories,
        matchTypeConfig,
        teams,
        scores,
        fixtures: fixturesPayload,
      };
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to save tournament.");
      }
      const created = json.data;
      if (created?.id) {
        setSelectedTournamentId(created.id);
      }
      await refreshTournaments();
    } catch (err) {
      setLoadError(err.message || "Failed to save tournament.");
    } finally {
      setSavingTournament(false);
    }
  };

  const addNewTournament = async () => {
    if (currentUser?.role !== "admin" && currentUser?.access !== "write") {
      setLoadError("Read-only access");
      return;
    }
    setSavingTournament(true);
    setLoadError("");
    setLoadSuccess("");
    try {
      const payload = {
        name: tournamentName || "Untitled Tournament",
        type: tournamentType,
        categories: [],
        matchTypeConfig: {},
        teams: [],
        scores: {},
        fixtures: [],
      };
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to add tournament.");
      }
      const created = json.data;
      if (created?.id) {
        setSelectedTournamentId(created.id);
      }
      setCategories([]);
      setMatchTypeConfig({});
      setTeams([]);
      setScores({});
      setManualFixtures([]);
      setSelectedMatch(null);
      await refreshTournaments();
      setLoadSuccess("Tournament added.");
    } catch (err) {
      setLoadError(err.message || "Failed to add tournament.");
    } finally {
      setSavingTournament(false);
    }
  };

  const updateTournament = async () => {
    if (!selectedTournamentId) return;
    setSavingTournament(true);
    setLoadError("");
    setLoadSuccess("");
    try {
      const fixturesPayload = isTeamType ? buildFixtures(teams) : manualFixtures;
      const payload =
        currentUser?.role !== "admin" && currentUser?.access === "score"
          ? { scores, updatedBy: currentUser?.username || null }
          : {
              name: tournamentName || "Untitled Tournament",
              type: tournamentType,
              categories,
              matchTypeConfig,
              teams,
              scores,
              fixtures: fixturesPayload,
              updatedBy: currentUser?.username || null,
            };
      const res = await fetch(`/api/tournaments/${selectedTournamentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to update tournament.");
      }
      await refreshTournaments();
      setLoadSuccess("Tournament updated.");
    } catch (err) {
      setLoadError(err.message || "Failed to update tournament.");
    } finally {
      setSavingTournament(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const deleteSelectedTournament = async () => {
    if (!deleteTournamentId) return;
    setLoadError("");
    setLoadSuccess("");
    try {
      const res = await fetch(`/api/tournaments/${deleteTournamentId}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to delete tournament.");
      }
      if (deleteTournamentId === selectedTournamentId) {
        setSelectedTournamentId("");
      }
      setDeleteTournamentId("");
      setTournamentName("");
      setTournamentType("team");
      setCategories([]);
      setMatchTypeConfig({});
      setTeams([]);
      setScores({});
      setManualFixtures([]);
      setSelectedMatch(null);
      await refreshTournaments();
      setLoadSuccess("Tournament deleted.");
    } catch (err) {
      setLoadError(err.message || "Failed to delete tournament.");
    }
  };

  const saveProfiles = async () => {
    if (!selectedTournamentId) return;
    setSavingTournament(true);
    setLoadError("");
    setLoadSuccess("");
    try {
      const res = await fetch(`/api/profiles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profiles }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to save profiles.");
      }
      setProfiles(Array.isArray(json.data) ? json.data : profiles);
      setLoadSuccess("Profiles saved.");
    } catch (err) {
      setLoadError(err.message || "Failed to save profiles.");
    } finally {
      setSavingTournament(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <HeaderBar
        tournamentName={tournamentName}
        username={currentUser?.username}
        onLogout={handleLogout}
        onMenu={() => setMenuOpen(true)}
      />
      {toast ? (
        <div className="fixed right-4 bottom-20 z-50">
          <div
            className={`rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.type === "error"
                ? "bg-rose-600 text-white"
                : "bg-emerald-600 text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
      <div
        className={`fixed inset-0 z-30 bg-slate-900/30 transition-opacity ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
      />
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 bg-white shadow-xl transition-transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-extrabold">Menu</div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="text-sm font-semibold text-slate-500"
          >
            Close
          </button>
        </div>
        <nav className="p-3 grid gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setMenuOpen(false);
              }}
              className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold ${
                tab === t
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "bg-white border-slate-200 text-slate-700"
              }`}
            >
              {t === "setup"
                ? "Setup"
                : t === "profiles"
                ? "Profiles"
                : t === "matches"
                ? "Scores"
                : t === "standings"
                ? "Standing"
                : "Reports"}
            </button>
          ))}
        </nav>
      </aside>

      <div className="px-3 sm:px-4 pb-24 grid gap-4 max-w-6xl mx-auto w-full">
        <TopBanner
          title="Badminton Tournament"
          titleSlot={
            <Select
              value={selectedTournamentId}
              onChange={(e) => setSelectedTournamentId(e.target.value)}
            >
              <option value="">Select tournament</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name || t.id}
                </option>
              ))}
            </Select>
          }
          rightSlot={
            <Button
              variant="outline"
              onClick={() => loadTournament(selectedTournamentId)}
              disabled={!selectedTournamentId}
              className="w-full sm:w-auto"
            >
              Load
            </Button>
          }
        />
        {tab === "setup" && (
          <SetupSection
            tournamentName={tournamentName}
            setTournamentName={setTournamentName}
            tournamentType={tournamentType}
            setTournamentType={handleTypeChange}
            configTab={setupTab}
            setConfigTab={setSetupTab}
            tournaments={tournaments}
            selectedTournamentId={selectedTournamentId}
            deleteTournamentId={deleteTournamentId}
            setDeleteTournamentId={setDeleteTournamentId}
            selectedTournament={selectedTournament}
            currentUser={currentUser}
            loadingTournaments={loadingTournaments}
            loadingSelectedTournament={loadingSelectedTournament}
            savingTournament={savingTournament}
            loadError={loadError}
            loadSuccess={loadSuccess}
            onRefreshTournaments={refreshTournaments}
            onLoadTournament={() => loadTournament(selectedTournamentId)}
            onDeleteTournament={deleteSelectedTournament}
            onAddTournament={addNewTournament}
            categories={categories}
            categoriesByKey={categoriesByKey}
            categoryKeysSorted={categoryKeysSorted}
            newCategoryKey={newCategoryKey}
            setNewCategoryKey={setNewCategoryKey}
            newCategoryCount={newCategoryCount}
            setNewCategoryCount={setNewCategoryCount}
            matchTypeOptions={matchTypeOptions}
            matchTypeConfig={matchTypeConfig}
            setMatchTypeConfig={setMatchTypeConfig}
            teams={teams}
            addCategory={addCategory}
            updateCategoryCount={updateCategoryCount}
            removeCategory={removeCategory}
            applySetupToExistingTeams={applySetupToExistingTeams}
          />
        )}

        {tab === "profiles" && (
            <ProfilesSection
              profiles={profiles}
              setProfiles={setProfiles}
              onSave={saveProfiles}
              saving={savingTournament}
              canSave={currentUser?.role === "admin" || currentUser?.access === "write"}
              hasTournament={true}
              readOnly={
                currentUser?.role !== "admin" && currentUser?.access !== "write"
              }
            />
        )}

        {tab === "setup" && setupTab === "teams" && (
          <TeamsSection
            teams={teams}
            categoryKeysSorted={categoryKeysSorted}
            updateOwner={updateOwner}
            updatePlayerName={updatePlayerName}
            tournamentType={tournamentType}
            newTeamName={newTeamName}
            setNewTeamName={setNewTeamName}
            addTeam={addTeam}
            totalPlayers={totalPlayers}
            categories={categories}
            profiles={profiles}
            readOnly={
              currentUser?.role !== "admin" && currentUser?.access !== "write"
            }
          />
        )}

        {tab === "matches" && (
          <div className="grid gap-3">
            {!isTeamType ? (
              <Card>
                <CardContent className="grid gap-3">
                  <div className="text-sm font-bold text-slate-700">
                    Add Match (history allowed)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={newFixtureT1}
                      onChange={(e) => setNewFixtureT1(e.target.value)}
                      disabled={!canEditStructure}
                    >
                      <option value="">Team A</option>
                      {teams.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </Select>
                    <Select
                      value={newFixtureT2}
                      onChange={(e) => setNewFixtureT2(e.target.value)}
                      disabled={!canEditStructure}
                    >
                      <option value="">Team B</option>
                      {teams.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Button
                    onClick={() => {
                      if (!newFixtureT1 || !newFixtureT2) return;
                      if (newFixtureT1 === newFixtureT2) return;
                      const samePairCount = manualFixtures.filter(
                        (f) =>
                          (f.t1 === newFixtureT1 && f.t2 === newFixtureT2) ||
                          (f.t1 === newFixtureT2 && f.t2 === newFixtureT1)
                      ).length;
                      const suffix = samePairCount + 1;
                      const key =
                        suffix === 1
                          ? `${newFixtureT1} vs ${newFixtureT2}`
                          : `${newFixtureT1} vs ${newFixtureT2} (${suffix})`;
                      setManualFixtures((prev) => [
                        ...prev,
                        { key, t1: newFixtureT1, t2: newFixtureT2 },
                      ]);
                      setNewFixtureT1("");
                      setNewFixtureT2("");
                    }}
                    disabled={
                      !canEditStructure ||
                      !newFixtureT1 ||
                      !newFixtureT2 ||
                      newFixtureT1 === newFixtureT2
                    }
                  >
                    + Add Match
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            <MatchesSection
              fixtures={fixtures}
              selectedMatch={selectedMatch}
              onSelectMatch={(key) => {
                setSelectedMatch(key);
              }}
              teams={teams}
              matchTypeOptions={matchTypeOptions}
              matchTypeConfig={matchTypeConfig}
              matchRows={matchRows}
              scores={scores}
              upsertScore={upsertScore}
              playerSlots={tournamentType === "singles" ? 1 : 2}
              readOnly={
                currentUser?.role !== "admin" &&
                currentUser?.access !== "write" &&
                currentUser?.access !== "score"
              }
            />
          </div>
        )}

        {tab === "standings" && <StandingsSection standings={standings} />}

        {tab === "reports" && (
          <ReportsSection fixtures={fixtures} scores={scores} teams={teams} />
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-50/95 px-3 sm:px-4 py-3 border-t border-slate-200">
        <div className="max-w-6xl mx-auto w-full grid gap-2">
          <div className="grid grid-cols-1 items-center gap-2 mb-2">
            <button
              type="button"
              onClick={updateTournament}
              disabled={!canSave || savingTournament}
              className="w-full rounded-2xl bg-slate-900 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingTournament ? "Saving..." : "Save"}
            </button>
          </div>
          <div className="grid grid-cols-2 items-center gap-2">
            <button
              type="button"
              onClick={goBack}
              disabled={!canGoBack}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
