export default function HeaderBar({ tournamentName, username, onLogout, onMenu }) {
  return (
    <div className="sticky top-0 z-20 bg-blue-700 text-white">
      <div className="px-4 py-2 flex items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="rounded-full bg-blue-900 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-950"
          aria-label="Open menu"
        >
          ☰
        </button>
        <div className="flex-1 min-w-0 font-extrabold text-base sm:text-lg truncate">
          🏸 {tournamentName?.trim() ? tournamentName.trim() : "Badminton Tournament"}
        </div>
        <div className="text-xs font-semibold opacity-90">
          {username || ""}
        </div>
        {onLogout ? (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-blue-900 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-950"
          >
            Logout
          </button>
        ) : null}
      </div>
    </div>
  );
}
