import { NextResponse } from "next/server";
import { buildSessionCookie } from "../../lib/auth";
import { createUser, verifyUser } from "../../lib/mockUsers";
import { prisma } from "../../lib/db";
import { hashPassword, verifyPassword } from "../../lib/password";

export async function POST(request) {
  const payload = await request.json().catch(() => ({}));
  const username = String(payload?.username || "").trim();
  const password = String(payload?.password || "").trim();

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  const useMock = process.env.USE_MOCK_DB === "true";
  let user = null;

  if (useMock) {
    user = verifyUser(username, password);
    if (!user) {
      if (username.toLowerCase() === "rajesh") {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      user = createUser(username, password);
    }
  } else {
    const existing = await prisma.userAccount.findUnique({
      where: { username },
    });
    if (!existing) {
      if (username.toLowerCase() === "rajesh") {
        const created = await prisma.userAccount.create({
          data: {
            username,
            passwordHash: hashPassword(password),
            role: "admin",
            access: "write",
            lastLoginAt: new Date(),
          },
        });
        user = created;
      } else {
        const created = await prisma.userAccount.create({
          data: {
            username,
            passwordHash: hashPassword(password),
            role: "user",
            access: "read",
            lastLoginAt: new Date(),
          },
        });
        user = created;
      }
    } else {
      const ok = verifyPassword(password, existing.passwordHash);
      if (!ok) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      user = await prisma.userAccount.update({
        where: { username },
        data: { lastLoginAt: new Date() },
      });
    }
  }

  const token = buildSessionCookie(user);
  if (!token) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
  const response = NextResponse.json({ ok: true, user: { username: user.username, role: user.role, access: user.access } });
  response.cookies.set({
    name: "session",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
