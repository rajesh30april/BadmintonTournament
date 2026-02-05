import { cn } from "../lib/tournament";

export function Card({ className = "", children }) {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-2xl shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardContent({ className = "", children }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

export function Button({ variant = "solid", className = "", children, ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";
  const solid = "bg-blue-700 text-white hover:bg-blue-800";
  const outline = "bg-blue-700 text-white hover:bg-blue-800 border border-blue-700";
  const ghost = "bg-blue-700 text-white hover:bg-blue-800";
  const styles =
    variant === "outline" ? outline : variant === "ghost" ? ghost : solid;
  return (
    <button className={cn(base, styles, className)} {...props}>
      {children}
    </button>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "py-2 flex flex-col items-center justify-center gap-1 rounded-xl border",
        active
          ? "text-blue-700 border-blue-200 bg-blue-50"
          : "text-slate-400 border-slate-200 bg-white"
      )}
    >
      <span className="text-[11px] font-bold">{label}</span>
    </button>
  );
}
