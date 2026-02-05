"use client";

import { useEffect, useState } from "react";
import { Sora, Playfair_Display } from "next/font/google";

const sora = Sora({ subsets: ["latin"], weight: ["400", "600", "700"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to load users");
      }
      const json = await res.json();
      setUsers(Array.isArray(json.users) ? json.users : []);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateAccess = async (username, access) => {
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, access }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || "Failed to update access");
      return;
    }
    await loadUsers();
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`${playfair.className} text-3xl text-slate-900`}>
              Admin Access
            </h1>
            <p className={`${sora.className} text-sm text-slate-500`}>
              Set read/write/score access for users. Admin always has write access.
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className={`${sora.className} rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800`}
          >
            Log out
          </button>
        </div>

        {error && <div className={`${sora.className} text-sm text-rose-600`}>{error}</div>}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className={`${sora.className} grid grid-cols-3 gap-2 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500`}>
            <div>User</div>
            <div>Role</div>
            <div>Access</div>
          </div>
          {loading ? (
            <div className={`${sora.className} px-4 py-6 text-sm text-slate-500`}>
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className={`${sora.className} px-4 py-6 text-sm text-slate-500`}>
              No users yet.
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className={`${sora.className} grid grid-cols-3 gap-2 border-t px-4 py-3 text-sm text-slate-700`}
              >
                <div>{user.username}</div>
                <div className="capitalize">{user.role}</div>
                <div>
                  {user.role === "admin" ? (
                    <span className="text-emerald-600">write (fixed)</span>
                  ) : (
                    <select
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
                      value={user.access}
                      onChange={(e) => updateAccess(user.username, e.target.value)}
                    >
                      <option value="read">read</option>
                      <option value="score">score</option>
                      <option value="write">write</option>
                    </select>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className={`${sora.className} text-xs text-slate-400`}>
          Note: users may need to sign in again to refresh their access level.
        </div>
      </div>
    </div>
  );
}
