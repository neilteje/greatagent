import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  progress
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  progress?: number;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-muted-foreground">{label}</p>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-md bg-white/8 text-teal-100">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{detail}</p>
        {typeof progress === "number" ? <Progress value={progress} className="mt-4" /> : null}
      </CardContent>
    </Card>
  );
}
