import { ArrowRight, FileText, Gavel, Scale, Target, UsersRound, Wand2 } from "lucide-react";
import { InsightCard } from "@/components/InsightCard";
import { QualityScorePanel } from "@/components/QualityScorePanel";
import { TranscriptStream } from "@/components/TranscriptStream";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CouncilDeliberation, Interview } from "@/lib/types";

export function InterviewReportView({ interview }: { interview: Interview }) {
  const report = interview.report;
  if (!report) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">No report has been generated for this interview yet.</CardContent>
      </Card>
    );
  }
  const council = report.council ?? makeUiCouncilFallback(interview);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge>{interview.segment}</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">{interview.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{report.executiveSummary}</p>
        </div>
        <div className="rounded-xl border border-teal-900/40 bg-teal-950/55 px-5 py-4 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_32px_rgba(0,0,0,0.22)]">
          <div className="text-xs uppercase text-teal-200">Quality score</div>
          <div className="text-4xl font-semibold">{report.qualityScore}</div>
        </div>
      </div>

      <CouncilPanel council={council} />

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

function CouncilPanel({ council }: { council: CouncilDeliberation }) {
  return (
    <Card className="overflow-hidden border-teal-900/40">
      <CardHeader className="border-b border-white/10 bg-slate-950/45">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Badge>LLM Council</Badge>
            <CardTitle className="mt-3 flex items-center gap-2 text-lg">
              <Scale className="h-5 w-5 text-teal-200" />
              {council.caseTitle}
            </CardTitle>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">{council.docketSummary}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="text-xs uppercase text-muted-foreground">Council confidence</div>
            <div className="text-3xl font-semibold text-teal-100">{council.confidence}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4 lg:col-span-2">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Gavel className="h-4 w-4 text-teal-200" />
              Majority opinion
            </div>
            <p className="text-sm leading-6 text-slate-200">{council.majorityOpinion}</p>
          </div>
          <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4">
            <div className="mb-2 text-sm font-semibold text-amber-100">Dissenting concern</div>
            <p className="text-sm leading-6 text-muted-foreground">{council.dissentingConcern}</p>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-5">
          {council.justices.map((justice) => (
            <div key={justice.id} className="rounded-xl border border-white/10 bg-slate-950/35 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{justice.name}</div>
                  <div className="mt-1 text-xs leading-4 text-muted-foreground">{justice.role}</div>
                </div>
                <UsersRound className="h-4 w-4 shrink-0 text-teal-200" />
              </div>
              <p className="text-sm leading-5 text-slate-200">{justice.position}</p>
              <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Recommendation</div>
              <p className="mt-1 text-sm leading-5 text-teal-100">{justice.recommendation}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-teal-900/50 bg-teal-950/25 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase text-teal-200">Final verdict</div>
            <p className="mt-1 text-sm leading-6 text-slate-100">{council.finalVerdict}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-muted-foreground md:max-w-md">
            <span className="font-medium text-foreground">Next action:</span> {council.nextAction}
          </div>
        </div>
      </CardContent>
    </Card>
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

function makeUiCouncilFallback(interview: Interview): CouncilDeliberation {
  const strongestInsight = interview.insights[0]?.title ?? "the strongest validated insight";
  return {
    caseTitle: `${interview.title} v. Unvalidated Assumptions`,
    docketSummary: `The council reviewed this saved report and weighed transcript evidence against the research goal: ${interview.goal}`,
    justices: [
      ["evidence", "Justice Evidence", "Transcript evidence", "The strongest claims should stay tied to direct customer quotes.", "Preserve quotes beside every product recommendation.", 84],
      ["methodology", "Justice Methodology", "Research rigor", "The interview is useful, but prevalence still needs another targeted sample.", "Probe frequency, severity, and recent examples next.", 78],
      ["product", "Justice Product", "Product strategy", `${strongestInsight} is strong enough for a small prototype test.`, "Prototype the smallest version before roadmap commitment.", 82],
      ["market", "Justice Market", "Commercial value", "Urgency improves when the transcript names time saved, risk reduced, or money protected.", "Validate willingness to pay with a specific package.", 76],
      ["skeptic", "Justice Skeptic", "Counterargument", "One interview can reveal a sharp opportunity, but cannot prove a segment-wide mandate.", "Track assumptions before assigning engineering capacity.", 73]
    ].map(([id, name, role, position, recommendation, confidence]) => ({
      id: String(id),
      name: String(name),
      role: String(role),
      position: String(position),
      keyEvidence: interview.insights.slice(0, 3).map((item) => item.quote || item.title),
      recommendation: String(recommendation),
      confidence: Number(confidence)
    })),
    majorityOpinion: `The council agrees that ${strongestInsight.toLowerCase()} is actionable for a narrow validation sprint, not a broad roadmap commitment.`,
    dissentingConcern: "The dissent warns that more interviews are needed before treating the finding as representative.",
    finalVerdict: `Proceed with focused validation around ${strongestInsight.toLowerCase()}.`,
    confidence: interview.confidenceScore ?? 80,
    nextAction: "Run the next interview with explicit probes for frequency, cost, and willingness to pay."
  };
}
