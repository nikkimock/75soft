import { differenceInDays } from "date-fns";

export default function DayCounter({ startDate, completedDays }) {
  if (!startDate) return null;

  const today = new Date();
  const start = new Date(startDate);
  const dayNumber = Math.max(1, Math.min(differenceInDays(today, start) + 1, 75));
  const progress = Math.round((completedDays / 75) * 100);

  return (
    <div className="relative flex flex-col items-center py-6">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-foreground">{dayNumber}</span>
          <span className="text-xs text-muted-foreground font-medium">of 75</span>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {completedDays} perfect {completedDays === 1 ? "day" : "days"}
      </p>
    </div>
  );
}
