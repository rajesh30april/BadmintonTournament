import { Card, CardContent } from "../ui";
import { cn } from "../../lib/tournament";

export default function MatchesSection({ fixtures, selectedMatch, onSelectMatch }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xl font-extrabold">Matches</div>
            <div className="text-sm text-slate-500">Round-robin fixtures</div>
          </div>
        </div>

        {fixtures.length === 0 ? (
          <div className="px-4 pb-4 text-sm text-slate-600">
            Add at least 2 teams in Setup.
          </div>
        ) : (
          <div className="border-t">
            {fixtures.map((m) => (
              <button
                key={m.key}
                className={cn(
                  "w-full px-4 py-3 flex items-center justify-between text-left border-b bg-white",
                  selectedMatch === m.key ? "bg-blue-50" : ""
                )}
                onClick={() => onSelectMatch(m.key)}
              >
                <div className="font-bold">{m.key}</div>
                <div className="text-slate-400 text-sm">›</div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
