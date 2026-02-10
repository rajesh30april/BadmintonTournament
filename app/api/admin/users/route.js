import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/auth";
import { listUsers, updateUserAccess } from "../../../lib/mockUsers";
import { prisma } from "../../../lib/db";

export async function GET(request) {
  const guard = requireAdmin(request);
  if (guard.error) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  if (process.env.USE_MOCK_DB === "true") {
    return NextResponse.json({ users: listUsers() });
  }
  const users = await prisma.userAccount.findMany({
    select: {
      id: true,
      username: true,
      role: true,
      access: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ users });
}

export async function PUT(request) {
  const guard = requireAdmin(request);
  if (guard.error) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const payload = await request.json().catch(() => ({}));
  const username = String(payload?.username || "").trim();
  const access = String(payload?.access || "").trim();
  if (!username || !["read", "write", "score", "comment"].includes(access)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (process.env.USE_MOCK_DB === "true") {
    const updated = updateUserAccess(username, access);
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({
      user: { username: updated.username, access: updated.access, role: updated.role },
    });
  }
  const updated = await prisma.userAccount.findUnique({ where: { username } });
  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (updated.role === "admin") {
    return NextResponse.json({ error: "Cannot change admin access" }, { status: 400 });
  }
  const saved = await prisma.userAccount.update({
    where: { username },
    data: { access },
    select: { username: true, access: true, role: true },
  });
  return NextResponse.json({ user: saved });
}
