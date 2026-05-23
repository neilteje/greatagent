import { AlertTriangle, Lightbulb } from "lucide-react";
import type { AgentAlert } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function AgentAlertCard({ alert }: { alert: AgentAlert }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-amber-300/10 text-amber-100">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold">{alert.title}</h4>
            <Badge variant={alert.severity === "high" ? "warning" : "muted"}>{alert.severity}</Badge>
          </div>
          <p className="mt-2 text-sm leading-5 text-muted-foreground">{alert.reason}</p>
          <div className="mt-3 rounded-md border border-teal-300/15 bg-teal-300/8 p-3 text-sm text-teal-50">
            <Lightbulb className="mr-2 inline h-4 w-4" />
            {alert.suggestedQuestion}
          </div>
        </div>
      </div>
    </Card>
  );
}
