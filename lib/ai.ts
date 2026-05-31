import type { AnalyzerResponse, CouncilDeliberation, CouncilJustice, Interview, InterviewReport, TranscriptChunk } from "@/lib/types";
import { fallbackAnalysis } from "@/lib/demo-data";
import { getOpenAI } from "@/lib/openai";
import { localHashEmbedding } from "@/lib/vector";

const analyzerPrompt =
  "You are an expert user research moderator. Your job is to help the interviewer run a better customer interview in real time. Detect vague answers, missed follow-ups, contradictions, emotional cues, buying signals, feature requests, pain points, and leading questions. Return concise, actionable JSON only.";

const councilJustices = [
  {
    id: "evidence",
    name: "Justice Evidence",
    role: "Transcript evidence and quote reliability",
    stance: "Separate proved customer evidence from attractive but unsupported interpretation."
  },
  {
    id: "methodology",
    name: "Justice Methodology",
    role: "Research quality and interview rigor",
    stance: "Identify bias, weak follow-ups, and missing specificity before accepting conclusions."
  },
  {
    id: "product",
    name: "Justice Product",
    role: "Product strategy and prioritization",
    stance: "Translate validated pain into concrete product bets with clear risk."
  },
  {
    id: "market",
    name: "Justice Market",
    role: "Buying signals and commercial value",
    stance: "Pressure-test urgency, willingness to pay, and segment-level importance."
  },
  {
    id: "skeptic",
    name: "Justice Skeptic",
    role: "Adversarial counterargument",
    stance: "Find the strongest reason the team should not overreact to this interview."
  }
] as const;

export function safeJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}

export async function analyzeChunk(input: {
  transcriptChunk: TranscriptChunk;
  fullTranscript: TranscriptChunk[];
  currentInterviewGoal: string;
  previousInsights: unknown[];
}): Promise<AnalyzerResponse> {
  const fallback = fallbackAnalysis({
    chunk: input.transcriptChunk,
    fullTranscript: input.fullTranscript,
    goal: input.currentInterviewGoal
  });
  const openai = getOpenAI();
  if (!openai) return fallback;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        { role: "system", content: analyzerPrompt },
        {
          role: "user",
          content: JSON.stringify({
            schema: {
              suggestedFollowUps: [{ id: "string", question: "string", rationale: "string", priority: "low|medium|high" }],
              alerts: [{ id: "string", type: "vague_answer|missed_follow_up|contradiction|leading_question|emotional_cue|buying_signal|pain_point|feature_request", title: "string", reason: "string", suggestedQuestion: "string", severity: "low|medium|high" }],
              extractedInsights: [{ id: "string", interviewId: input.transcriptChunk.interviewId, chunkId: input.transcriptChunk.id, type: "pain_point|objection|feature_request|buying_signal|workflow|quote", title: "string", summary: "string", quote: "string", tags: ["string"], sentiment: "number -1 to 1", urgency: "0-100", confidence: "0-100", createdAt: "ISO string" }],
              sentimentScore: "number -1 to 1",
              urgencyScore: "0-100",
              confidenceScore: "0-100",
              tags: ["string"]
            },
            transcriptChunk: input.transcriptChunk,
            fullTranscript: input.fullTranscript,
            currentInterviewGoal: input.currentInterviewGoal,
            previousInsights: input.previousInsights
          })
        }
      ]
    });
    const content = completion.choices[0]?.message.content ?? "";
    const parsed = safeJson<AnalyzerResponse>(content, fallback);
    return normalizeAnalysis(parsed, input.transcriptChunk, fallback);
  } catch {
    return fallback;
  }
}

function normalizeAnalysis(parsed: AnalyzerResponse, chunk: TranscriptChunk, fallback: AnalyzerResponse): AnalyzerResponse {
  return {
    suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps) ? parsed.suggestedFollowUps : fallback.suggestedFollowUps,
    alerts: Array.isArray(parsed.alerts) ? parsed.alerts : fallback.alerts,
    extractedInsights: Array.isArray(parsed.extractedInsights)
      ? parsed.extractedInsights.map((item, index) => ({
          ...item,
          id: item.id || `${chunk.id}-ai-insight-${index}`,
          interviewId: item.interviewId || chunk.interviewId,
          chunkId: item.chunkId || chunk.id,
          createdAt: item.createdAt || new Date().toISOString()
        }))
      : fallback.extractedInsights,
    sentimentScore: clampNumber(parsed.sentimentScore, -1, 1, fallback.sentimentScore),
    urgencyScore: clampNumber(parsed.urgencyScore, 0, 100, fallback.urgencyScore),
    confidenceScore: clampNumber(parsed.confidenceScore, 0, 100, fallback.confidenceScore),
    tags: Array.isArray(parsed.tags) ? parsed.tags : fallback.tags
  };
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

export async function generateReport(interview: Interview): Promise<InterviewReport> {
  const fallback = makeFallbackReport(interview);
  const openai = getOpenAI();
  if (!openai) return fallback;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.25,
      messages: [
        { role: "system", content: "You are a senior customer research critic. Return polished, concise JSON only." },
        {
          role: "user",
          content: JSON.stringify({
            requiredSections: [
              "executiveSummary",
              "topInsights",
              "painPoints",
              "featureRequests",
              "userQuotes",
              "buyingSignals",
              "qualityScore",
              "qualityBreakdown",
              "didWell",
              "missedFollowUps",
              "leadingQuestions",
              "bestNextQuestions",
              "recommendedProductActions"
            ],
            interview
          })
        }
      ]
    });
    const parsed = safeJson<InterviewReport>(completion.choices[0]?.message.content ?? "", fallback);
    const report = {
      ...fallback,
      ...parsed,
      interviewId: interview.id,
      generatedAt: new Date().toISOString()
    };
    const council = await deliberateWithCouncil(interview, report);
    return { ...report, council };
  } catch {
    return fallback;
  }
}

async function deliberateWithCouncil(interview: Interview, report: InterviewReport): Promise<CouncilDeliberation> {
  const fallback = makeFallbackCouncil(interview, report);
  const openai = getOpenAI();
  if (!openai) return fallback;

  try {
    const justiceOpinions = await Promise.all(
      councilJustices.map(async (justice) => {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          temperature: 0.35,
          messages: [
            {
              role: "system",
              content: `You are ${justice.name}, an LLM council justice for an in-house research supreme court. Your specialty: ${justice.role}. Your stance: ${justice.stance}. Reason independently, cite only transcript/report evidence, and return concise JSON only.`
            },
            {
              role: "user",
              content: JSON.stringify({
                schema: {
                  id: justice.id,
                  name: justice.name,
                  role: justice.role,
                  position: "one sentence ruling from this justice",
                  keyEvidence: ["2-4 short evidence bullets"],
                  recommendation: "one concrete recommendation",
                  confidence: "0-100"
                },
                interview,
                draftReport: report
              })
            }
          ]
        });

        const fallbackJustice = fallback.justices.find((item) => item.id === justice.id) ?? fallback.justices[0];
        return normalizeJustice(
          safeJson<CouncilJustice>(completion.choices[0]?.message.content ?? "", fallbackJustice),
          fallbackJustice
        );
      })
    );

    const synthesis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "You are Chief Justice Synthesis, the final LLM council arbiter. Weigh the justice opinions, resolve disagreements, and return concise JSON only."
        },
        {
          role: "user",
          content: JSON.stringify({
            schema: {
              caseTitle: "string",
              docketSummary: "one short paragraph",
              majorityOpinion: "one short paragraph",
              dissentingConcern: "one short paragraph",
              finalVerdict: "one decisive sentence",
              confidence: "0-100",
              nextAction: "one concrete next step"
            },
            interview,
            draftReport: report,
            justiceOpinions
          })
        }
      ]
    });

    const parsed = safeJson<Omit<CouncilDeliberation, "justices">>(
      synthesis.choices[0]?.message.content ?? "",
      fallback
    );

    return normalizeCouncil({ ...fallback, ...parsed, justices: justiceOpinions }, fallback);
  } catch {
    return fallback;
  }
}

function normalizeJustice(parsed: CouncilJustice, fallback: CouncilJustice): CouncilJustice {
  return {
    id: parsed.id || fallback.id,
    name: parsed.name || fallback.name,
    role: parsed.role || fallback.role,
    position: parsed.position || fallback.position,
    keyEvidence: Array.isArray(parsed.keyEvidence) ? parsed.keyEvidence.slice(0, 4) : fallback.keyEvidence,
    recommendation: parsed.recommendation || fallback.recommendation,
    confidence: clampNumber(parsed.confidence, 0, 100, fallback.confidence)
  };
}

function normalizeCouncil(parsed: CouncilDeliberation, fallback: CouncilDeliberation): CouncilDeliberation {
  return {
    caseTitle: parsed.caseTitle || fallback.caseTitle,
    docketSummary: parsed.docketSummary || fallback.docketSummary,
    justices: Array.isArray(parsed.justices) && parsed.justices.length ? parsed.justices.map((item, index) => normalizeJustice(item, fallback.justices[index] ?? fallback.justices[0])) : fallback.justices,
    majorityOpinion: parsed.majorityOpinion || fallback.majorityOpinion,
    dissentingConcern: parsed.dissentingConcern || fallback.dissentingConcern,
    finalVerdict: parsed.finalVerdict || fallback.finalVerdict,
    confidence: clampNumber(parsed.confidence, 0, 100, fallback.confidence),
    nextAction: parsed.nextAction || fallback.nextAction
  };
}

export function makeFallbackReport(interview: Interview): InterviewReport {
  const painInsights = interview.insights.filter((item) => item.type === "pain_point" || item.type === "objection");
  const featureInsights = interview.insights.filter((item) => item.type === "feature_request");
  const buyingSignals = interview.insights.filter((item) => item.type === "buying_signal");
  const score = Math.max(62, Math.min(94, Math.round(72 + interview.insights.length * 3)));
  return {
    interviewId: interview.id,
    executiveSummary: `${interview.title} produced ${interview.insights.length} usable insights. The strongest signals are ${interview.tags.slice(0, 3).join(", ") || "customer pain, urgency, and product opportunity"}.`,
    topInsights: interview.insights.slice(0, 5).map((item) => item.title),
    painPoints: painInsights.map((item) => item.title),
    featureRequests: featureInsights.map((item) => item.title),
    userQuotes: interview.insights.map((item) => item.quote).filter(Boolean).slice(0, 6),
    buyingSignals: buyingSignals.map((item) => item.title),
    qualityScore: score,
    qualityBreakdown: {
      questionNeutrality: score + 3,
      followUpDepth: score - 4,
      answerSpecificity: score - 6,
      evidenceQuality: score - 2,
      concreteExamples: score - 8,
      emotionalCueCapture: score - 5,
      userTalkTimeRatio: score + 5,
      insightDensity: score + 2
    },
    didWell: ["Kept the conversation focused on the stated research goal", "Captured specific quotes tied to product decisions"],
    missedFollowUps: ["Ask for the exact most recent example", "Quantify frequency, cost, and severity for each pain point"],
    leadingQuestions: ["No severe leading question pattern detected"],
    bestNextQuestions: ["What happened the last time this came up?", "How did you work around it?", "What would make this worth paying for?"],
    recommendedProductActions: interview.insights.slice(0, 4).map((item) => `Prototype around: ${item.title}`),
    council: makeFallbackCouncil(interview),
    generatedAt: new Date().toISOString()
  };
}

export function makeFallbackCouncil(interview: Interview, report?: InterviewReport): CouncilDeliberation {
  const topEvidence = interview.insights.slice(0, 3).map((item) => item.quote || item.title).filter(Boolean);
  const coreEvidence = topEvidence.length ? topEvidence : ["The transcript has limited evidence, so the ruling stays cautious."];
  const topInsight = report?.topInsights?.[0] ?? interview.insights[0]?.title ?? "The strongest opportunity needs more evidence.";
  const topAction = report?.recommendedProductActions?.[0] ?? `Run a deeper follow-up around ${topInsight.toLowerCase()}.`;
  const confidence = Math.round(
    Math.max(55, Math.min(92, (interview.confidenceScore ?? 72) + Math.min(10, interview.insights.length * 2)))
  );

  return {
    caseTitle: `${interview.title} v. Unvalidated Assumptions`,
    docketSummary: `The council reviewed ${interview.transcript.length} transcript turns, ${interview.insights.length} extracted insights, and the stated goal: ${interview.goal}`,
    justices: councilJustices.map((justice, index) => ({
      id: justice.id,
      name: justice.name,
      role: justice.role,
      position: [
        `The evidence supports acting on ${topInsight.toLowerCase()}, but only within this segment.`,
        "The interview produced useful signals, yet more concrete frequency and cost data would improve rigor.",
        `The product team should prioritize a focused experiment before broad roadmap commitment.`,
        "Commercial urgency is promising when the transcript includes explicit time, money, or risk language.",
        "The strongest counterargument is that one interview cannot prove segment-wide demand."
      ][index],
      keyEvidence: coreEvidence,
      recommendation: [
        topAction,
        "Ask the next participant for the most recent example, frequency, and workaround cost.",
        "Prototype the smallest version of the recommended action and test comprehension.",
        "Validate willingness to pay with a concrete package, price, and success metric.",
        "Log assumptions that remain unproven before committing engineering time."
      ][index],
      confidence: Math.max(50, Math.min(94, confidence - index * 3))
    })),
    majorityOpinion: `A majority of the council agrees that ${topInsight.toLowerCase()} is actionable enough for a narrow product experiment, not a broad roadmap bet.`,
    dissentingConcern: "The dissent warns that the sample is too small to infer prevalence without another round of targeted interviews.",
    finalVerdict: `Proceed with a focused validation sprint around ${topInsight.toLowerCase()}.`,
    confidence,
    nextAction: topAction
  };
}

export async function embedText(text: string) {
  const openai = getOpenAI();
  if (!openai) return localHashEmbedding(text);
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text
    });
    return response.data[0]?.embedding ?? localHashEmbedding(text);
  } catch {
    return localHashEmbedding(text);
  }
}
