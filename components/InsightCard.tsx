import { Quote } from "lucide-react";
import type { ExtractedInsight } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function InsightCard({ insight }: { insight: ExtractedInsight }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge>{insight.type.replace("_", " ")}</Badge>
        {insight.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="muted">{tag}</Badge>
        ))}
      </div>
      <h4 className="text-sm font-semibold">{insight.title}</h4>
      <p className="mt-2 text-sm leading-5 text-muted-foreground">{insight.summary}</p>
      {insight.quote ? (
        <p className="mt-3 rounded-md bg-black/20 p-3 text-sm leading-5 text-slate-200">
          <Quote className="mr-2 inline h-3.5 w-3.5 text-teal-100" />
          {insight.quote}
        </p>
      ) : null}
      <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3 text-xs text-muted-foreground">
        <Progress value={insight.confidence} />
        <span>{insight.confidence}% confidence</span>
      </div>
    </div>
  );
}
