export default function HeaderBar({ tournamentName, username, onLogout }) {
  return (
    <div className="sticky top-0 z-20 bg-blue-700 text-white">
      <div className="px-4 py-3 grid items-center gap-2 sm:grid-cols-[1fr_auto_1fr]">
        <div className="hidden sm:block text-sm font-semibold opacity-90">
          {username ? `Signed in as ${username}` : ""}
        </div>
        <div className="font-extrabold text-center">
          🏸 {tournamentName?.trim() ? tournamentName.trim() : "Badminton Tournament"}
        </div>
        <div className="hidden sm:flex justify-end gap-2">
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white hover:bg-white/25"
            >
              Logout
            </button>
          )}
        </div>
      </div>
      {username ? (
        <div className="px-4 pb-3 text-center text-xs font-semibold sm:hidden">
          Signed in as {username}
        </div>
      ) : null}
      <div className="pb-3 text-center sm:hidden space-x-2">
        {onLogout ? (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white hover:bg-white/25"
          >
            Logout
          </button>
        ) : null}
      </div>
    </div>
  );
}
