const now = () => new Date().toISOString();
const normalizeTournamentName = (name) => (name || "").trim().toLowerCase();
const dedupeByName = (items) => {
  const seen = new Set();
  return items.filter((t) => {
    const key = normalizeTournamentName(t.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

let tournaments = dedupeByName([
  {
    id: "t-001",
    name: "Friday League",
    type: "team",
    categories: [
      { key: "A", count: 1 },
      { key: "B", count: 1 },
    ],
    matchTypeConfig: {
      "A__A": 1,
      "A__B": 1,
      "B__B": 1,
    },
    teams: [
      {
        name: "Smashers",
        owner: "Arun",
        players: [
          { category: "A", rank: "A1", name: "Rajesh" },
          { category: "B", rank: "B1", name: "Vijay" },
        ],
      },
      {
        name: "Strikers",
        owner: "Meera",
        players: [
          { category: "A", rank: "A1", name: "Asha" },
          { category: "B", rank: "B1", name: "Pooja" },
        ],
      },
    ],
    fixtures: [
      { key: "Smashers vs Strikers", t1: "Smashers", t2: "Strikers" },
      { key: "Smashers vs Strikers - 2", t1: "Smashers", t2: "Strikers" },
      { key: "Smashers vs Strikers - 3", t1: "Smashers", t2: "Strikers" },
    ],
    scores: {},
    createdBy: "seed",
    updatedBy: "seed",
    createdAt: now(),
    updatedAt: now(),
  },
]);

let globalProfiles = [
  { id: "p-001", name: "Rajesh", role: "player", phone: "9000000001" },
  { id: "p-002", name: "Vijay", role: "player", phone: "9000000002" },
  { id: "p-003", name: "Asha", role: "player", phone: "9000000003" },
  { id: "p-004", name: "Pooja", role: "player", phone: "9000000004" },
  { id: "p-005", name: "Arun", role: "owner", phone: "9000000005" },
  { id: "p-006", name: "Meera", role: "owner", phone: "9000000006" },
];

let comments = [];
let matchLikes = [];
let liveMatches = [];

export function listTournaments() {
  return tournaments;
}

export function getTournament(id) {
  const record = tournaments.find((t) => t.id === id);
  if (!record) return null;
  const live = liveMatches.filter((m) => m.tournamentId === id);
  return { ...record, liveMatches: live };
}

export function getProfiles() {
  return globalProfiles;
}

export function updateProfiles(profiles) {
  globalProfiles = profiles || [];
  return globalProfiles;
}

export function createTournament(payload) {
  const id = `t-${Math.random().toString(36).slice(2, 8)}`;
  const createdBy = payload?.createdBy || payload?.updatedBy || "unknown";
  const record = {
    id,
    name: payload?.name || "Untitled Tournament",
    type: payload?.type || "team",
    categories: payload?.categories || [],
    matchTypeConfig: payload?.matchTypeConfig || {},
    teams: payload?.teams || [],
    fixtures: payload?.fixtures || [],
    scores: payload?.scores || {},
    createdBy,
    updatedBy: payload?.updatedBy || createdBy,
    createdAt: now(),
    updatedAt: now(),
  };
  tournaments = [record, ...tournaments];
  return record;
}

export function updateTournament(id, payload) {
  const idx = tournaments.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const existing = tournaments[idx];
  const updatedBy = payload?.updatedBy || existing.updatedBy || "unknown";
  const updated = {
    ...existing,
    ...payload,
    id: existing.id,
    updatedBy,
    updatedAt: now(),
  };
  tournaments = [
    ...tournaments.slice(0, idx),
    updated,
    ...tournaments.slice(idx + 1),
  ];
  return updated;
}

export function deleteTournament(id) {
  const before = tournaments.length;
  tournaments = tournaments.filter((t) => t.id !== id);
  liveMatches = liveMatches.filter((m) => m.tournamentId !== id);
  return tournaments.length !== before;
}

export function listComments(tournamentId) {
  if (!tournamentId) return [];
  return comments
    .filter((c) => c.tournamentId === tournamentId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

export function addComment(tournamentId, fixtureKey, rowId, text, author) {
  if (!tournamentId || !fixtureKey || !rowId || !text) return null;
  const comment = {
    id: `c-${Math.random().toString(36).slice(2, 8)}`,
    tournamentId,
    fixtureKey,
    rowId: String(rowId),
    text: text.trim(),
    author: author || "unknown",
    likes: 0,
    createdAt: now(),
  };
  comments = [...comments, comment];
  return comment;
}

export function likeComment(commentId) {
  if (!commentId) return null;
  const idx = comments.findIndex((c) => c.id === commentId);
  if (idx === -1) return null;
  const updated = { ...comments[idx], likes: (comments[idx].likes || 0) + 1 };
  comments = [...comments.slice(0, idx), updated, ...comments.slice(idx + 1)];
  return updated;
}

export function listMatchLikes(tournamentId) {
  if (!tournamentId) return [];
  return matchLikes.filter((m) => m.tournamentId === tournamentId);
}

export function likeMatch(tournamentId, fixtureKey, rowId) {
  if (!tournamentId || !fixtureKey || !rowId) return null;
  const idx = matchLikes.findIndex(
    (m) =>
      m.tournamentId === tournamentId &&
      m.fixtureKey === fixtureKey &&
      String(m.rowId) === String(rowId)
  );
  if (idx === -1) {
    const created = {
      id: `ml-${Math.random().toString(36).slice(2, 8)}`,
      tournamentId,
      fixtureKey,
      rowId: String(rowId),
      likes: 1,
      createdAt: now(),
      updatedAt: now(),
    };
    matchLikes = [...matchLikes, created];
    return created;
  }
  const updated = {
    ...matchLikes[idx],
    likes: (matchLikes[idx].likes || 0) + 1,
    updatedAt: now(),
  };
  matchLikes = [...matchLikes.slice(0, idx), updated, ...matchLikes.slice(idx + 1)];
  return updated;
}

export function listLiveMatches(tournamentId) {
  if (!tournamentId) return [];
  return liveMatches.filter((m) => m.tournamentId === tournamentId);
}

export function startLiveMatch(tournamentId, fixtureKey, rowId, rowLabel, rowIndex) {
  if (!tournamentId || !fixtureKey || !rowId) return null;
  const idx = liveMatches.findIndex(
    (m) =>
      m.tournamentId === tournamentId &&
      m.fixtureKey === fixtureKey &&
      String(m.rowId) === String(rowId)
  );
  const entry = {
    id: `lm-${Math.random().toString(36).slice(2, 8)}`,
    tournamentId,
    fixtureKey,
    rowId: String(rowId),
    rowLabel: rowLabel || "",
    rowIndex: Number.isFinite(rowIndex) ? rowIndex : 0,
    startedAt: now(),
  };
  if (idx === -1) {
    liveMatches = [...liveMatches, entry];
    return entry;
  }
  liveMatches = [
    ...liveMatches.slice(0, idx),
    { ...liveMatches[idx], rowLabel: entry.rowLabel, rowIndex: entry.rowIndex },
    ...liveMatches.slice(idx + 1),
  ];
  return liveMatches[idx];
}

export function stopLiveMatch(tournamentId, fixtureKey, rowId) {
  if (!tournamentId || !fixtureKey || !rowId) return false;
  const before = liveMatches.length;
  liveMatches = liveMatches.filter(
    (m) =>
      !(
        m.tournamentId === tournamentId &&
        m.fixtureKey === fixtureKey &&
        String(m.rowId) === String(rowId)
      )
  );
  return liveMatches.length !== before;
}
