"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
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

export default function Page() {
  const [tab, setTab] = useState("setup");
  const [menuOpen, setMenuOpen] = useState(false);
  const [tournamentName, setTournamentName] = useState("");
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [loadingTournaments, setLoadingTournaments] = useState(false);
  const [loadingSelectedTournament, setLoadingSelectedTournament] = useState(false);
  const [savingTournament, setSavingTournament] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [loadSuccess, setLoadSuccess] = useState("");
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

  const matchTypeOptions = useMemo(
    () => buildMatchTypeOptions(categories),
    [categories]
  );

  const [matchTypeConfig, setMatchTypeConfig] = useState({});

  useEffect(() => {
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

  const fixtures = useMemo(() => {
    const list = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        list.push({
          key: `${teams[i].name} vs ${teams[j].name}`,
          t1: teams[i].name,
          t2: teams[j].name,
        });
      }
    }
    return list;
  }, [teams]);

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
    setTeams((p) => [
      ...p,
      { name, owner: "", players: buildPlayerSlots(categories) },
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
      setCategories(Array.isArray(record.categories) ? record.categories : []);
      setMatchTypeConfig(record.matchTypeConfig || {});
      setTeams(Array.isArray(record.teams) ? record.teams : []);
      setScores(record.scores || {});
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
  const canUpdate =
    Boolean(selectedTournamentId) &&
    (currentUser?.role === "admin" || currentUser?.access === "write");
  const tabs = ["setup", "teams", "matches", "standings", "reports"];
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
      const payload = {
        name: tournamentName || "Untitled Tournament",
        categories,
        matchTypeConfig,
        teams,
        scores,
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

  const updateTournament = async () => {
    if (!selectedTournamentId) return;
    setSavingTournament(true);
    setLoadError("");
    setLoadSuccess("");
    try {
      const payload = {
        name: tournamentName || "Untitled Tournament",
        categories,
        matchTypeConfig,
        teams,
        scores,
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

  return (
    <div className="min-h-screen bg-slate-50">
      <HeaderBar
        tournamentName={tournamentName}
        username={currentUser?.username}
        onLogout={handleLogout}
        onMenu={() => setMenuOpen(true)}
      />
      <div className="sticky top-[54px] z-20 bg-slate-50/95 px-4 py-3 border-b border-slate-200">
        <div className="grid grid-cols-1 items-center">
          <button
            type="button"
            onClick={updateTournament}
            disabled={!canUpdate || savingTournament}
            className="w-full rounded-2xl bg-slate-900 px-8 py-3 text-base font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingTournament ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

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
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-slate-200 text-slate-700"
              }`}
            >
              {t === "setup"
                ? "Setup"
                : t === "teams"
                ? "Teams"
                : t === "matches"
                ? "Matches"
                : t === "standings"
                ? "Standing"
                : "Reports"}
            </button>
          ))}
        </nav>
      </aside>

      <div className="p-4 grid gap-4 pb-20">
        {tab === "setup" && (
          <SetupSection
            tournamentName={tournamentName}
            setTournamentName={setTournamentName}
            tournaments={tournaments}
            selectedTournamentId={selectedTournamentId}
            setSelectedTournamentId={setSelectedTournamentId}
            selectedTournament={selectedTournament}
            currentUser={currentUser}
            loadingTournaments={loadingTournaments}
            loadingSelectedTournament={loadingSelectedTournament}
            savingTournament={savingTournament}
            loadError={loadError}
            loadSuccess={loadSuccess}
            onRefreshTournaments={refreshTournaments}
            onLoadTournament={() => loadTournament(selectedTournamentId)}
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
            totalPlayers={totalPlayers}
            newTeamName={newTeamName}
            setNewTeamName={setNewTeamName}
            addCategory={addCategory}
            updateCategoryCount={updateCategoryCount}
            removeCategory={removeCategory}
            applySetupToExistingTeams={applySetupToExistingTeams}
            addTeam={addTeam}
          />
        )}

        {tab === "teams" && (
          <TeamsSection
            teams={teams}
            categoryKeysSorted={categoryKeysSorted}
            updateOwner={updateOwner}
            updatePlayerName={updatePlayerName}
          />
        )}

        {tab === "matches" && (
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
          />
        )}

        {tab === "standings" && <StandingsSection standings={standings} />}

        {tab === "reports" && (
          <ReportsSection fixtures={fixtures} scores={scores} teams={teams} />
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-50/95 px-4 py-3 border-t border-slate-200">
        <div className="grid grid-cols-2 items-center gap-2">
          <button
            type="button"
            onClick={goBack}
            disabled={!canGoBack}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next →
          </button>
        </div>
      </div>

    </div>
  );
}
