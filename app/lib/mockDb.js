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

export function listTournaments() {
  return tournaments;
}

export function getTournament(id) {
  return tournaments.find((t) => t.id === id) || null;
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
  return tournaments.length !== before;
}
