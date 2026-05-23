import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Bot, LineChart, MessageSquareText, Radio, Search, Target } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { SeedDataButton } from "@/components/SeedDataButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { listInterviews } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const interviews = await listInterviews();
  const recent = interviews.slice(0, 4);
  const allInsights = interviews.flatMap((item) => item.insights);
  const avgQuality = Math.round(interviews.reduce((sum, item) => sum + (item.qualityScore ?? 0), 0) / Math.max(1, interviews.length));
  const topPain = allInsights
    .filter((item) => item.type === "pain_point" || item.type === "objection")
    .sort((a, b) => b.urgency - a.urgency)
    .slice(0, 4);
  const features: Array<[string, string, LucideIcon]> = [
    ["Realtime moderator", "Flags vague answers, missed follow-ups, contradictions, emotional cues, and leading questions.", MessageSquareText],
    ["Research quality critic", "Scores neutrality, follow-up depth, specificity, evidence quality, talk-time, and insight density.", Target],
    ["Semantic memory", "Search interview evidence by meaning, not filenames or exact keywords.", Search]
  ];

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] p-6 shadow-glow lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.16),transparent_36%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge>AI-native research platform</Badge>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal lg:text-5xl">
              great agent turns live interviews into evidence, critique, and searchable memory.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
              A realtime moderator agent detects weak research moments, recommends better follow-ups, scores interview quality, and stores semantic insights.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="lg">
              <Link href="/interview">
                <Radio className="h-4 w-4" />
                Start Live Interview
              </Link>
            </Button>
            <SeedDataButton />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Research quality" value={`${avgQuality}`} detail="Average critic score across recent interviews" icon={Target} progress={avgQuality} />
        <MetricCard label="Insights captured" value={`${allInsights.length}`} detail="Pain points, objections, requests, and buying signals" icon={Bot} progress={Math.min(100, allInsights.length * 9)} />
        <MetricCard label="High urgency" value={`${allInsights.filter((item) => item.urgency >= 75).length}`} detail="Moments worth immediate product follow-up" icon={LineChart} progress={78} />
        <MetricCard label="Memory ready" value="128d" detail="Local vectors with OpenAI embedding upgrade path" icon={Search} progress={91} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent interviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.map((interview) => (
              <Link key={interview.id} href={`/review/${interview.id}`} className="block rounded-md border border-white/10 bg-white/5 p-4 transition hover:border-teal-300/20 hover:bg-white/8">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{interview.title}</h3>
                      <Badge variant="muted">{interview.segment}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{interview.customer} · {formatDate(interview.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Quality</span>
                        <span>{interview.qualityScore ?? 0}</span>
                      </div>
                      <Progress value={interview.qualityScore ?? 0} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top pain points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPain.map((item) => (
              <div key={item.id} className="rounded-md border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Badge variant="warning">{item.type.replace("_", " ")}</Badge>
                  <span className="text-xs text-muted-foreground">Urgency {item.urgency}</span>
                </div>
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">{item.quote}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {features.map(([title, copy, Icon]) => (
          <Card key={title}>
            <CardContent className="p-5">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-md bg-white/8 text-teal-100">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
