"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sora, Playfair_Display } from "next/font/google";

const sora = Sora({ subsets: ["latin"], weight: ["400", "600", "700"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Login failed");
      }
      router.push(callbackUrl);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#f6f2ff,transparent_45%),linear-gradient(140deg,#e7f4ff,white_55%,#fff2e6)]">
      <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-amber-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-indigo-200/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/50 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-up space-y-6">
            <p
              className={`${sora.className} inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 shadow-sm`}
            >
              court ready
            </p>
            <h1
              className={`${playfair.className} text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl`}
            >
              Sign in to manage your next badminton tournament.
            </h1>
            <p className={`${sora.className} max-w-xl text-lg text-slate-600`}>
              Login is required. By default, users have read-only access unless the
              admin grants write access.
            </p>
            <div className="flex flex-wrap gap-3">
              <span
                className={`${sora.className} rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm`}
              >
                lightning setup
              </span>
              <span
                className={`${sora.className} rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm`}
              >
                live scoring
              </span>
              <span
                className={`${sora.className} rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm`}
              >
                standings auto-sync
              </span>
            </div>
          </div>

          <div className="animate-fade-up">
            <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="space-y-2">
                <h2 className={`${playfair.className} text-2xl text-slate-900`}>
                  Welcome back
                </h2>
                <p className={`${sora.className} text-sm text-slate-500`}>
                  Use your username and password to continue.
                </p>
              </div>

              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className={`${sora.className} text-xs font-semibold text-slate-600`}>
                    Username
                  </label>
                  <input
                    className={`${sora.className} w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm`}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="rajesh"
                  />
                </div>
                <div className="space-y-2">
                  <label className={`${sora.className} text-xs font-semibold text-slate-600`}>
                    Password
                  </label>
                  <input
                    type="password"
                    className={`${sora.className} w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="admin"
                  />
                </div>
                {error && (
                  <div className={`${sora.className} text-sm text-rose-500`}>
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`${sora.className} flex w-full items-center justify-center rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <p className={`${sora.className} mt-6 text-xs text-slate-500`}>
                Admin can manage user access in the admin panel.
              </p>
            </div>

            <div
              className={`${sora.className} animate-fade-in mt-6 text-center text-xs text-slate-400`}
            >
              Default admin: rajesh / admin
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-sm text-slate-500">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
