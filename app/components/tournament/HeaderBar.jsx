export default function HeaderBar({ tournamentName, username, onLogout, onMenu }) {
  return (
    <div className="sticky top-0 z-20 backdrop-blur bg-[rgba(11,27,58,0.92)] text-white border-b border-white/10">
      <div className="px-4 py-2.5 flex items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
          aria-label="Open menu"
        >
          ☰
        </button>
        <div className="flex-1 min-w-0" />
        <div className="text-xs font-semibold opacity-90">{username || ""}</div>
        {onLogout ? (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20 transition"
          >
            Logout
          </button>
        ) : null}
      </div>
    </div>
  );
}
