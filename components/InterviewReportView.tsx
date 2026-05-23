import { ArrowRight, FileText, Target, Wand2 } from "lucide-react";
import { InsightCard } from "@/components/InsightCard";
import { QualityScorePanel } from "@/components/QualityScorePanel";
import { TranscriptStream } from "@/components/TranscriptStream";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Interview } from "@/lib/types";

export function InterviewReportView({ interview }: { interview: Interview }) {
  const report = interview.report;
  if (!report) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">No report has been generated for this interview yet.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge>{interview.segment}</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">{interview.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{report.executiveSummary}</p>
        </div>
        <div className="rounded-lg border border-teal-300/20 bg-teal-300/10 px-5 py-4 text-right">
          <div className="text-xs uppercase text-teal-100">Quality score</div>
          <div className="text-4xl font-semibold">{report.qualityScore}</div>
        </div>
      </div>

      <QualityScorePanel score={report.qualityScore} breakdown={report.qualityBreakdown} />

      <div className="grid gap-4 lg:grid-cols-3">
        <ReportList title="Top insights" icon={Target} items={report.topInsights} />
        <ReportList title="Missed follow-ups" icon={ArrowRight} items={report.missedFollowUps} />
        <ReportList title="Product actions" icon={Wand2} items={report.recommendedProductActions} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Evidence board</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {interview.insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <TranscriptStream chunks={interview.transcript} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReportList title="User quotes" icon={FileText} items={report.userQuotes} />
        <ReportList title="Best next questions" icon={ArrowRight} items={report.bestNextQuestions} />
      </div>
    </div>
  );
}

function ReportList({ title, items, icon: Icon }: { title: string; items: string[]; icon: typeof FileText }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-teal-100" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.length ? items.map((item) => (
            <div key={item} className="rounded-md border border-white/10 bg-white/5 p-3 text-sm leading-5 text-slate-200">
              {item}
            </div>
          )) : <p className="text-sm text-muted-foreground">No items detected.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
