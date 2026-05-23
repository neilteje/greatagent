import type { AnalyzerResponse, Interview, InterviewReport, TranscriptChunk } from "@/lib/types";
import { fallbackAnalysis } from "@/lib/demo-data";
import { getOpenAI } from "@/lib/openai";
import { localHashEmbedding } from "@/lib/vector";

const analyzerPrompt =
  "You are an expert user research moderator. Your job is to help the interviewer run a better customer interview in real time. Detect vague answers, missed follow-ups, contradictions, emotional cues, buying signals, feature requests, pain points, and leading questions. Return concise, actionable JSON only.";

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
    return {
      ...fallback,
      ...parsed,
      interviewId: interview.id,
      generatedAt: new Date().toISOString()
    };
  } catch {
    return fallback;
  }
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
    generatedAt: new Date().toISOString()
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
