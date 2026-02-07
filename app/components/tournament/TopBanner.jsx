export default function TopBanner({ title, titleSlot, subtitle, rightSlot }) {
  return (
    <div className="banner w-full px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Tournament
          </div>
          <div className="mt-1">
            {titleSlot ? (
              <div className="w-full sm:min-w-[260px]">{titleSlot}</div>
            ) : (
              <div className="text-lg font-extrabold text-slate-900">{title}</div>
            )}
          </div>
          {subtitle ? (
            <div className="mt-1 text-xs text-slate-600">{subtitle}</div>
          ) : null}
        </div>
        {rightSlot ? (
          <div className="flex-shrink-0 w-full sm:w-auto">{rightSlot}</div>
        ) : null}
      </div>
    </div>
  );
}
