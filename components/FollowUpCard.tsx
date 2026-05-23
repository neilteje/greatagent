import { CornerDownRight } from "lucide-react";
import type { SuggestedFollowUp } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function FollowUpCard({ followUp }: { followUp: SuggestedFollowUp }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <CornerDownRight className="h-4 w-4 text-teal-100" />
        <Badge variant={followUp.priority === "high" ? "success" : "muted"}>{followUp.priority}</Badge>
      </div>
      <p className="text-sm font-medium leading-5">{followUp.question}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{followUp.rationale}</p>
    </div>
  );
}
