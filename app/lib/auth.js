import { decodeSession, encodeSession } from "./session";

export function getSessionFromRequest(request) {
  const token = request.cookies.get("session")?.value;
  return decodeSession(token);
}

export function buildSessionCookie(user) {
  const token = encodeSession({
    username: user.username,
    role: user.role,
    access: user.access,
  });
  return token;
}

export function requireAuth(request) {
  const session = getSessionFromRequest(request);
  if (!session?.username) {
    return { error: "Unauthorized", status: 401 };
  }
  return { session };
}

export function requireAdmin(request) {
  const { session, error, status } = requireAuth(request);
  if (error) return { error, status };
  if (session.role !== "admin") {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

export function requireWrite(request) {
  const { session, error, status } = requireAuth(request);
  if (error) return { error, status };
  if (session.role !== "admin" && session.access !== "write") {
    return { error: "Read-only access", status: 403 };
  }
  return { session };
}
