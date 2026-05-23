import { cn } from "@/lib/utils";

export function SentimentTimeline({ values }: { values: number[] }) {
  const safe = values.length ? values : [0.05, -0.1, -0.22, 0.18];
  return (
    <div className="flex h-16 items-end gap-1 rounded-md border border-white/10 bg-white/5 p-2">
      {safe.slice(-18).map((value, index) => {
        const height = 20 + Math.abs(value) * 34;
        return (
          <div
            key={`${value}-${index}`}
            className={cn("flex-1 rounded-sm", value >= 0 ? "bg-teal-300/70" : "bg-rose-300/70")}
            style={{ height }}
            title={`${Math.round(value * 100)} sentiment`}
          />
        );
      })}
    </div>
  );
}
