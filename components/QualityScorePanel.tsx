import type { QualityScoreBreakdown } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

const labels: Array<[keyof QualityScoreBreakdown, string]> = [
  ["questionNeutrality", "Neutrality"],
  ["followUpDepth", "Follow-up depth"],
  ["answerSpecificity", "Specificity"],
  ["evidenceQuality", "Evidence quality"],
  ["concreteExamples", "Concrete examples"],
  ["emotionalCueCapture", "Emotional cues"],
  ["userTalkTimeRatio", "User talk-time"],
  ["insightDensity", "Insight density"]
];

export function QualityScorePanel({ score, breakdown }: { score: number; breakdown: QualityScoreBreakdown }) {
  const points = labels.map(([key], index) => {
    const angle = (Math.PI * 2 * index) / labels.length - Math.PI / 2;
    const radius = (Math.max(0, Math.min(100, breakdown[key])) / 100) * 72;
    return `${100 + Math.cos(angle) * radius},${100 + Math.sin(angle) * radius}`;
  }).join(" ");

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <div className="rounded-md border border-white/10 bg-white/5 p-4">
        <div className="text-xs uppercase text-muted-foreground">Interview quality</div>
        <div className="mt-3 text-5xl font-semibold">{score}</div>
        <p className="mt-2 text-sm text-muted-foreground">Research critic score based on question quality and evidence density.</p>
        <svg viewBox="0 0 200 200" className="mt-4 h-48 w-full">
          {[0.25, 0.5, 0.75, 1].map((ring) => (
            <circle key={ring} cx="100" cy="100" r={72 * ring} fill="none" stroke="rgba(255,255,255,0.09)" />
          ))}
          {labels.map(([, label], index) => {
            const angle = (Math.PI * 2 * index) / labels.length - Math.PI / 2;
            return (
              <g key={label}>
                <line x1="100" y1="100" x2={100 + Math.cos(angle) * 78} y2={100 + Math.sin(angle) * 78} stroke="rgba(255,255,255,0.08)" />
              </g>
            );
          })}
          <polygon points={points} fill="rgba(45,212,191,0.24)" stroke="rgb(94,234,212)" strokeWidth="2" />
        </svg>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {labels.map(([key, label]) => (
          <div key={key} className="rounded-md border border-white/10 bg-white/5 p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>{label}</span>
              <span className="text-muted-foreground">{breakdown[key]}</span>
            </div>
            <Progress value={breakdown[key]} />
          </div>
        ))}
      </div>
    </div>
  );
}
