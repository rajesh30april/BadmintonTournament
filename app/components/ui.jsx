import { cn } from "../lib/tournament";

export function Card({ className = "", children }) {
  return (
    <div
      className={cn(
        "card",
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
    "btn disabled:opacity-50 disabled:cursor-not-allowed";
  const solid = "btn-primary";
  const outline = "btn-outline";
  const ghost = "btn-ghost";
  const styles = variant === "outline" ? outline : variant === "ghost" ? ghost : solid;
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
        "input-base",
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
        "input-base",
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
        "py-2 flex flex-col items-center justify-center gap-1 rounded-xl border text-xs font-semibold transition",
        active
          ? "text-slate-900 border-slate-300 bg-white shadow-sm"
          : "text-slate-500 border-slate-200 bg-white"
      )}
    >
      <span className="text-[11px] font-bold">{label}</span>
    </button>
  );
}
