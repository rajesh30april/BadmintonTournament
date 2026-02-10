import {
  createTournament as createMock,
  deleteTournament as deleteMock,
  getTournament as getMock,
  getProfiles as getProfilesMock,
  listComments as listCommentsMock,
  listTournaments as listMock,
  addComment as addCommentMock,
  updateTournament as updateMock,
  updateProfiles as updateProfilesMock,
} from "./mockDb";
import { buildFixtures, buildMatchRows, buildMatchTypeOptions, slug } from "./tournament";

const useMock = () => process.env.USE_MOCK_DB === "true";
const DUPLICATE_NAME_CODE = "DUPLICATE_TOURNAMENT_NAME";

class DuplicateTournamentNameError extends Error {
  constructor(name) {
    super(`Tournament name already exists: ${name}`);
    this.name = "DuplicateTournamentNameError";
    this.code = DUPLICATE_NAME_CODE;
    this.tournamentName = name;
  }
}

export function isDuplicateNameError(error) {
  return error?.code === DUPLICATE_NAME_CODE;
}

const getPrisma = async () => {
  const mod = await import("./db");
  return mod.ensurePrisma ? mod.ensurePrisma() : mod.prisma;
};

export async function listTournaments() {
  if (useMock()) return listMock();
  const prisma = await getPrisma();
  const items = await prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      type: true,
      createdBy: true,
      updatedBy: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return items;
}

export async function getTournament(id) {
  if (!id) return null;
  if (useMock()) {
    const found = getMock(id);
    if (found) return found;
    const list = listMock();
    return list.find((t) => t.id === id) || null;
  }
  const prisma = await getPrisma();
  const record = await prisma.tournament.findUnique({
    where: { id },
    include: {
      categories: true,
      matchTypes: true,
      fixtures: true,
      teams: { include: { players: true } },
      results: true,
    },
  });
  if (!record) return null;
  const scores = buildScores(record.results);
  return {
    id: record.id,
    name: record.name,
    type: record.type || "team",
    createdBy: record.createdBy || null,
    updatedBy: record.updatedBy || null,
    categories: record.categories.map((c) => ({ key: c.key, count: c.count })),
    matchTypeConfig: record.matchTypes.reduce((acc, mt) => {
      acc[mt.typeKey] = mt.count;
      return acc;
    }, {}),
    teams: record.teams.map((t) => ({
      name: t.name,
      owner: t.owner || "",
      players: t.players.map((p) => ({
        category: p.category,
        rank: p.rank,
        name: p.name || "",
      })),
    })),
    fixtures: record.fixtures.map((f) => ({
      key: f.key,
      t1: f.t1,
      t2: f.t2,
    })),
    scores,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function getProfiles() {
  if (useMock()) return getProfilesMock();
  const prisma = await getPrisma();
  const rows = await prisma.profile.findMany({ orderBy: { name: "asc" } });
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    role: p.role,
    phone: p.phone || "",
  }));
}

export async function replaceProfiles(profiles) {
  if (useMock()) return updateProfilesMock(profiles);
  const prisma = await getPrisma();
  await prisma.$transaction(async (tx) => {
    await tx.profile.deleteMany({});
    const data = (profiles || [])
      .map((p) => ({
        name: p.name,
        role: p.role || "player",
        phone: p.phone || null,
      }))
      .filter((p) => p.name);
    if (data.length) {
      await tx.profile.createMany({ data });
    }
  });
  return getProfiles();
}

export async function listComments(tournamentId) {
  if (!tournamentId) return [];
  if (useMock()) return listCommentsMock(tournamentId);
  const prisma = await getPrisma();
  return prisma.comment.findMany({
    where: { tournamentId },
    orderBy: { createdAt: "asc" },
  });
}

export async function addComment({ tournamentId, fixtureKey, rowId, text, author }) {
  if (!tournamentId || !fixtureKey || !rowId || !text) return null;
  if (useMock()) return addCommentMock(tournamentId, fixtureKey, rowId, text, author);
  const prisma = await getPrisma();
  return prisma.comment.create({
    data: {
      tournamentId,
      fixtureKey,
      rowId: String(rowId),
      text: String(text).trim(),
      author: author || "unknown",
    },
  });
}

export async function likeComment({ commentId }) {
  if (!commentId) return null;
  if (useMock()) return likeCommentMock(commentId);
  const prisma = await getPrisma();
  return prisma.comment.update({
    where: { id: commentId },
    data: { likes: { increment: 1 } },
  });
}

export async function listMatchLikes(tournamentId) {
  if (!tournamentId) return [];
  if (useMock()) return listMatchLikesMock(tournamentId);
  const prisma = await getPrisma();
  return prisma.matchLike.findMany({
    where: { tournamentId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function likeMatch({ tournamentId, fixtureKey, rowId }) {
  if (!tournamentId || !fixtureKey || !rowId) return null;
  if (useMock()) return likeMatchMock(tournamentId, fixtureKey, rowId);
  const prisma = await getPrisma();
  return prisma.matchLike.upsert({
    where: {
      tournamentId_fixtureKey_rowId: {
        tournamentId,
        fixtureKey,
        rowId: String(rowId),
      },
    },
    update: { likes: { increment: 1 } },
    create: {
      tournamentId,
      fixtureKey,
      rowId: String(rowId),
      likes: 1,
    },
  });
}

export async function createTournament(payload) {
  const data = normalizePayload(payload);
  if (await isDuplicateName(data.name)) {
    throw new DuplicateTournamentNameError(data.name);
  }
  if (useMock()) return createMock(data);
  const prisma = await getPrisma();
  const created = await prisma.$transaction(async (tx) => {
    const tournament = await tx.tournament.create({
      data: {
        name: data.name,
        type: data.type || "team",
        createdBy: data.createdBy || null,
        updatedBy: data.updatedBy || data.createdBy || null,
      },
    });
    await insertRelated(tx, tournament.id, data);
    return tournament;
  });
  return getTournament(created.id);
}

export async function updateTournament(id, payload) {
  if (!id) return null;
  const scoresOnly =
    payload?.__scoresOnly === true ||
    (payload &&
      Object.keys(payload).every(
        (key) => key === "scores" || key === "updatedBy" || key === "__scoresOnly"
      )) ||
    (payload?.scores &&
      !payload?.name &&
      !payload?.type &&
      !payload?.teams &&
      !payload?.categories &&
      !payload?.matchTypeConfig &&
      !payload?.fixtures);
  if (scoresOnly) {
    return updateTournamentScoresOnly(id, payload?.scores, payload?.updatedBy);
  }
  const data = normalizePayload(payload);
  if (useMock()) {
    const existing = getMock(id);
    if (!existing) return null;
    if (await isDuplicateName(data.name, id)) {
      throw new DuplicateTournamentNameError(data.name);
    }
    return updateMock(id, data);
  }
  const prisma = await getPrisma();
  const existing = await prisma.tournament.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return null;
  if (await isDuplicateName(data.name, id, prisma)) {
    throw new DuplicateTournamentNameError(data.name);
  }
  const updated = await prisma.$transaction(async (tx) => {
    await tx.matchResult.deleteMany({ where: { tournamentId: id } });
    await tx.matchRow.deleteMany({ where: { tournamentId: id } });
    await tx.fixture.deleteMany({ where: { tournamentId: id } });
    await tx.player.deleteMany({
      where: { team: { tournamentId: id } },
    });
    await tx.team.deleteMany({ where: { tournamentId: id } });
    await tx.category.deleteMany({ where: { tournamentId: id } });
    await tx.matchTypeConfig.deleteMany({ where: { tournamentId: id } });
    await tx.tournament.update({
      where: { id },
      data: { name: data.name, type: data.type || "team", updatedBy: data.updatedBy || null },
    });
    await insertRelated(tx, id, data);
    return true;
  });
  if (!updated) return null;
  return getTournament(id);
}

export async function updateTournamentScoresOnly(id, scores, updatedBy) {
  if (!id) return null;
  if (useMock()) {
    return updateMock(id, {
      scores: scores || {},
      updatedBy: updatedBy || null,
    });
  }
  const prisma = await getPrisma();
  const existing = await prisma.tournament.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return null;
  await prisma.$transaction(async (tx) => {
    await tx.matchResult.deleteMany({ where: { tournamentId: id } });
    const results = buildResultsFromScores(id, scores || {});
    if (results.length) {
      await tx.matchResult.createMany({ data: results });
    }
    await tx.tournament.update({
      where: { id },
      data: { updatedBy: updatedBy || null },
    });
  });
  return getTournament(id);
}

export async function deleteTournament(id) {
  if (!id) return false;
  if (useMock()) return deleteMock(id);
  const prisma = await getPrisma();
  const deleted = await prisma.tournament
    .delete({ where: { id } })
    .catch(() => null);
  return Boolean(deleted);
}

function normalizePayload(payload) {
  return {
    name: payload?.name || "Untitled Tournament",
    type: payload?.type || "team",
    categories: Array.isArray(payload?.categories) ? payload.categories : [],
    matchTypeConfig: payload?.matchTypeConfig || {},
    teams: Array.isArray(payload?.teams) ? payload.teams : [],
    fixtures: Array.isArray(payload?.fixtures) ? payload.fixtures : [],
    scores: payload?.scores || {},
    createdBy: payload?.createdBy || null,
    updatedBy: payload?.updatedBy || null,
  };
}

function normalizeTournamentName(name) {
  return (name || "").trim().toLowerCase();
}

async function isDuplicateName(name, excludeId, prismaOverride) {
  const target = normalizeTournamentName(name);
  if (!target) return false;
  if (useMock()) {
    return listMock().some(
      (t) => t.id !== excludeId && normalizeTournamentName(t.name) === target
    );
  }
  const prisma = prismaOverride || (await getPrisma());
  const existing = await prisma.tournament.findMany({
    select: { id: true, name: true },
  });
  return existing.some(
    (t) => t.id !== excludeId && normalizeTournamentName(t.name) === target
  );
}

async function insertRelated(tx, tournamentId, data) {
  const categories = data.categories.map((c) => ({
    tournamentId,
    key: slug(c.key),
    count: Number(c.count || 0),
  }));
  if (categories.length) {
    await tx.category.createMany({ data: categories });
  }

  const matchTypes = Object.entries(data.matchTypeConfig).map(([typeKey, count]) => ({
    tournamentId,
    typeKey,
    count: Number(count || 0),
  }));
  if (matchTypes.length) {
    await tx.matchTypeConfig.createMany({ data: matchTypes });
  }

  const teamIdByName = new Map();
  for (const t of data.teams) {
    const team = await tx.team.create({
      data: {
        tournamentId,
        name: t.name,
        owner: t.owner || "",
      },
    });
    teamIdByName.set(t.name, team.id);
    const players = (t.players || []).map((p) => ({
      teamId: team.id,
      category: p.category,
      rank: p.rank,
      name: p.name || "",
    }));
    if (players.length) {
      await tx.player.createMany({ data: players });
    }
  }

  const fixtures = data.fixtures.length ? data.fixtures : buildFixtures(data.teams);
  if (fixtures.length) {
    await tx.fixture.createMany({
      data: fixtures.map((f) => ({
        tournamentId,
        key: f.key,
        t1: f.t1,
        t2: f.t2,
      })),
    });
  }

  const matchTypeOptions =
    data.type === "team" ? buildMatchTypeOptions(data.categories) : [];
  const matchRows =
    data.type === "team"
      ? buildMatchRows(matchTypeOptions, data.matchTypeConfig).map((row) => ({
          tournamentId,
          rowNo: row.id,
          typeKey: row.typeKey,
          typeLabel: row.label,
          catA: row.categories[0],
          catB: row.categories[1],
        }))
      : [
          {
            tournamentId,
            rowNo: 1,
            typeKey: "P__P",
            typeLabel: data.type === "singles" ? "S" : "D",
            catA: "P",
            catB: "P",
          },
        ];
  if (matchRows.length) {
    await tx.matchRow.createMany({ data: matchRows });
  }

  const results = buildResultsFromScores(tournamentId, data.scores);
  if (results.length) {
    await tx.matchResult.createMany({ data: results });
  }
}

function buildResultsFromScores(tournamentId, scores) {
  const results = [];
  if (!scores || typeof scores !== "object") return results;
  for (const fixtureKey of Object.keys(scores)) {
    const rows = scores[fixtureKey] || {};
    for (const rowNo of Object.keys(rows)) {
      const row = rows[rowNo] || {};
      results.push({
        tournamentId,
        fixtureKey,
        rowNo: Number(rowNo),
        t1Player1: row.t1Player1 || null,
        t1Player2: row.t1Player2 || null,
        t2Player1: row.t2Player1 || null,
        t2Player2: row.t2Player2 || null,
        t1Score: row.t1 === "" ? null : Number(row.t1),
        t2Score: row.t2 === "" ? null : Number(row.t2),
        winner: row.winner || null,
      });
    }
  }
  return results;
}

function buildScores(results) {
  const scores = {};
  for (const r of results || []) {
    if (!scores[r.fixtureKey]) scores[r.fixtureKey] = {};
    scores[r.fixtureKey][r.rowNo] = {
      t1Player1: r.t1Player1 || "",
      t1Player2: r.t1Player2 || "",
      t2Player1: r.t2Player1 || "",
      t2Player2: r.t2Player2 || "",
      t1: r.t1Score ?? "",
      t2: r.t2Score ?? "",
      winner: r.winner || "",
    };
  }
  return scores;
}
