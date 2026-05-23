import type { AnalyzerResponse, ExtractedInsight, Interview, InterviewReport, TranscriptChunk } from "@/lib/types";

const now = new Date("2026-05-23T12:00:00.000Z").toISOString();

export const airbnbHostScript: Array<Pick<TranscriptChunk, "speaker" | "text" | "offsetSeconds">> = [
  { speaker: "Interviewer", text: "Thanks for joining. I want to understand how your first month hosting went, especially onboarding and pricing.", offsetSeconds: 4 },
  { speaker: "Customer", text: "Yeah onboarding was fine I guess.", offsetSeconds: 12 },
  { speaker: "Interviewer", text: "Fine as in smooth, or fine as in you got through it?", offsetSeconds: 20 },
  { speaker: "Customer", text: "I mean I figured it out eventually. There were a couple places where I wasn't totally sure what Airbnb wanted from me.", offsetSeconds: 31 },
  { speaker: "Interviewer", text: "Where did that happen?", offsetSeconds: 43 },
  { speaker: "Customer", text: "The pricing settings were kind of weird. I didn't know if smart pricing would make me too cheap on weekends.", offsetSeconds: 53 },
  { speaker: "Customer", text: "I had to message support twice, once for ID verification and once because my calendar kept blocking dates I thought were open.", offsetSeconds: 68 },
  { speaker: "Interviewer", text: "Did that change how confident you felt about launching?", offsetSeconds: 81 },
  { speaker: "Customer", text: "A bit. I delayed my listing by maybe three days because I didn't want the first booking to go badly.", offsetSeconds: 92 },
  { speaker: "Customer", text: "If something just told me what to fix next, I would probably pay if it saved me an hour a week.", offsetSeconds: 107 },
  { speaker: "Interviewer", text: "What would that need to do in order to feel worth paying for?", offsetSeconds: 118 },
  { speaker: "Customer", text: "Show me the exact pricing risks, explain blocked calendar dates, and warn me before I publish something that looks unprofessional.", offsetSeconds: 131 }
];

function chunk(id: string, interviewId: string, speaker: "Interviewer" | "Customer", text: string, offsetSeconds: number): TranscriptChunk {
  return {
    id,
    interviewId,
    speaker,
    text,
    offsetSeconds,
    timestamp: new Date(Date.parse(now) + offsetSeconds * 1000).toISOString()
  };
}

function insight(partial: Omit<ExtractedInsight, "id" | "createdAt" | "interviewId">, interviewId: string, index: number): ExtractedInsight {
  return {
    id: `${interviewId}-insight-${index}`,
    interviewId,
    createdAt: now,
    ...partial
  };
}

export function buildAirbnbInterview(): Interview {
  const id = "airbnb-host-onboarding";
  const transcript = airbnbHostScript.map((line, index) =>
    chunk(`${id}-chunk-${index + 1}`, id, line.speaker, line.text, line.offsetSeconds)
  );
  const insights = [
    insight({
      chunkId: transcript[3].id,
      type: "pain_point",
      title: "Onboarding friction was hidden behind a vague satisfaction answer",
      summary: "The host initially described onboarding as fine, but later admitted they only figured it out eventually.",
      quote: "I mean I figured it out eventually.",
      tags: ["onboarding", "hidden-friction", "new-host"],
      sentiment: -0.28,
      urgency: 71,
      confidence: 88
    }, id, 1),
    insight({
      chunkId: transcript[5].id,
      type: "pain_point",
      title: "Pricing controls created launch anxiety",
      summary: "Smart pricing made the host worry about undercharging on high-demand dates.",
      quote: "I didn't know if smart pricing would make me too cheap on weekends.",
      tags: ["pricing", "trust", "configuration"],
      sentiment: -0.46,
      urgency: 82,
      confidence: 91
    }, id, 2),
    insight({
      chunkId: transcript[6].id,
      type: "workflow",
      title: "Support became part of the setup workflow",
      summary: "The host needed support twice before launch, indicating onboarding does not resolve key setup uncertainty.",
      quote: "I had to message support twice.",
      tags: ["support-dependency", "calendar", "verification"],
      sentiment: -0.52,
      urgency: 77,
      confidence: 93
    }, id, 3),
    insight({
      chunkId: transcript[9].id,
      type: "buying_signal",
      title: "Clear willingness to pay for proactive setup guidance",
      summary: "The host would pay for a tool that saves roughly one hour per week and tells them what to fix next.",
      quote: "I would probably pay if it saved me an hour a week.",
      tags: ["willingness-to-pay", "automation", "buying-signal"],
      sentiment: 0.38,
      urgency: 86,
      confidence: 90
    }, id, 4)
  ];

  return {
    id,
    title: "Airbnb host onboarding",
    customer: "Maya, first-time host",
    segment: "Marketplace supply",
    goal: "Understand first-month setup friction and monetizable guidance opportunities.",
    status: "complete",
    createdAt: now,
    durationSeconds: 1320,
    qualityScore: 86,
    sentimentScore: -0.18,
    urgencyScore: 79,
    confidenceScore: 90,
    tags: ["onboarding", "pricing", "support-dependency", "willingness-to-pay"],
    transcript,
    insights,
    report: buildAirbnbReport(id)
  };
}

function buildAirbnbReport(interviewId: string): InterviewReport {
  return {
    interviewId,
    executiveSummary: "A first-time Airbnb host described onboarding as acceptable at first, but the transcript revealed unresolved setup ambiguity, pricing trust issues, and repeated support dependency. The strongest opportunity is a proactive launch readiness assistant that explains pricing risks, calendar blockers, and next best setup actions.",
    topInsights: [
      "Vague positive satisfaction masked meaningful onboarding friction.",
      "Pricing configuration uncertainty delayed launch confidence.",
      "Support dependency appeared before the host reached first booking.",
      "The host stated willingness to pay if guidance saves one hour per week.",
      "Calendar and verification blockers are emotionally tied to fear of a bad first booking."
    ],
    painPoints: ["Pricing settings felt unclear", "Calendar availability was confusing", "Support was required twice", "Launch confidence dropped enough to delay publishing"],
    featureRequests: ["Next best setup action checklist", "Pricing risk explainer", "Calendar blocker diagnostics", "Pre-publish professionalism warning"],
    userQuotes: [
      "Yeah onboarding was fine I guess.",
      "I mean I figured it out eventually.",
      "I had to message support twice.",
      "I would probably pay if it saved me an hour a week."
    ],
    buyingSignals: ["Explicit willingness to pay", "Clear time-saving threshold", "High pain around avoiding launch mistakes"],
    qualityScore: 86,
    qualityBreakdown: {
      questionNeutrality: 91,
      followUpDepth: 83,
      answerSpecificity: 79,
      evidenceQuality: 84,
      concreteExamples: 78,
      emotionalCueCapture: 82,
      userTalkTimeRatio: 88,
      insightDensity: 93
    },
    didWell: ["Followed up on vague language", "Asked for concrete moments", "Explored confidence impact"],
    missedFollowUps: ["Ask what the support responses failed to make clear", "Ask how the host evaluated smart pricing after launch"],
    leadingQuestions: ["No major leading questions detected"],
    bestNextQuestions: [
      "What was the exact moment you decided to delay publishing?",
      "What would a trustworthy pricing recommendation need to show?",
      "How would you measure whether this saved an hour per week?"
    ],
    recommendedProductActions: [
      "Prototype a launch readiness score for new hosts",
      "Add pricing explanation cards for weekend and demand spikes",
      "Surface calendar blockers with plain-language causes",
      "Test paid proactive setup guidance with first-time hosts"
    ],
    generatedAt: now
  };
}

export function buildSeedInterviews(): Interview[] {
  const airbnb = buildAirbnbInterview();
  const b2b = makeInterview({
    id: "b2b-saas-admin-dashboard",
    title: "B2B SaaS admin dashboard",
    customer: "Jordan, RevOps admin",
    segment: "Mid-market SaaS",
    goal: "Find dashboard workflow breakdowns for administrators.",
    qualityScore: 78,
    sentimentScore: -0.24,
    urgencyScore: 68,
    confidenceScore: 82,
    tags: ["admin", "reporting", "permissions", "workflow"],
    transcriptLines: [
      ["Interviewer", "Walk me through the last time you used the admin dashboard.", 8],
      ["Customer", "I mostly use it when someone asks why a report looks different from Salesforce.", 22],
      ["Customer", "The annoying thing is I have to open three tabs to explain one number.", 44],
      ["Customer", "Permissions are scary because I cannot preview what a manager will see.", 70],
      ["Customer", "I would love a change log that explains who changed a field and what broke downstream.", 95]
    ],
    insights: [
      ["pain_point", "Report reconciliation requires too many tabs", "I have to open three tabs to explain one number.", ["reporting", "workflow"], -0.4, 66, 86],
      ["pain_point", "Permissions lack preview confidence", "I cannot preview what a manager will see.", ["permissions", "trust"], -0.52, 74, 88],
      ["feature_request", "Admin wants an impact-aware change log", "Who changed a field and what broke downstream.", ["audit-log", "admin"], 0.12, 64, 81]
    ]
  });

  const fitness = makeInterview({
    id: "consumer-fitness-app-churn",
    title: "Consumer fitness app churn",
    customer: "Ari, former subscriber",
    segment: "Consumer wellness",
    goal: "Understand why active users cancel after week three.",
    qualityScore: 74,
    sentimentScore: -0.31,
    urgencyScore: 63,
    confidenceScore: 79,
    tags: ["churn", "habits", "notifications", "personalization"],
    transcriptLines: [
      ["Interviewer", "What changed before you cancelled?", 6],
      ["Customer", "The workouts started feeling repetitive, like it forgot what equipment I had.", 19],
      ["Customer", "Notifications were either too many or totally irrelevant.", 43],
      ["Customer", "I liked the streaks, but missing one day made me feel like I had already failed.", 66],
      ["Customer", "If it adapted when my schedule got chaotic, I might have stayed.", 88]
    ],
    insights: [
      ["pain_point", "Personalization decay caused repetition", "It forgot what equipment I had.", ["personalization", "churn"], -0.38, 65, 82],
      ["objection", "Notifications felt poorly calibrated", "Too many or totally irrelevant.", ["notifications"], -0.43, 55, 78],
      ["feature_request", "Recovery mode after missed habits", "Missing one day made me feel like I had already failed.", ["habits", "retention"], -0.48, 72, 83]
    ]
  });

  return [airbnb, b2b, fitness];
}

function makeInterview(input: {
  id: string;
  title: string;
  customer: string;
  segment: string;
  goal: string;
  qualityScore: number;
  sentimentScore: number;
  urgencyScore: number;
  confidenceScore: number;
  tags: string[];
  transcriptLines: Array<["Interviewer" | "Customer", string, number]>;
  insights: Array<[ExtractedInsight["type"], string, string, string[], number, number, number]>;
}): Interview {
  const transcript = input.transcriptLines.map(([speaker, text, offset], index) =>
    chunk(`${input.id}-chunk-${index + 1}`, input.id, speaker, text, offset)
  );
  const insights = input.insights.map(([type, title, quote, tags, sentiment, urgency, confidence], index) =>
    insight({
      chunkId: transcript[Math.min(index + 1, transcript.length - 1)].id,
      type,
      title,
      summary: title,
      quote,
      tags,
      sentiment,
      urgency,
      confidence
    }, input.id, index + 1)
  );
  return {
    id: input.id,
    title: input.title,
    customer: input.customer,
    segment: input.segment,
    goal: input.goal,
    status: "complete",
    createdAt: now,
    durationSeconds: 1080,
    qualityScore: input.qualityScore,
    sentimentScore: input.sentimentScore,
    urgencyScore: input.urgencyScore,
    confidenceScore: input.confidenceScore,
    tags: input.tags,
    transcript,
    insights,
    report: {
      interviewId: input.id,
      executiveSummary: `${input.title} surfaced ${insights.length} product opportunities across ${input.tags.slice(0, 3).join(", ")}.`,
      topInsights: insights.map((item) => item.title),
      painPoints: insights.filter((item) => item.type === "pain_point" || item.type === "objection").map((item) => item.title),
      featureRequests: insights.filter((item) => item.type === "feature_request").map((item) => item.title),
      userQuotes: insights.map((item) => item.quote),
      buyingSignals: [],
      qualityScore: input.qualityScore,
      qualityBreakdown: {
        questionNeutrality: input.qualityScore + 4,
        followUpDepth: input.qualityScore - 5,
        answerSpecificity: input.qualityScore - 3,
        evidenceQuality: input.qualityScore,
        concreteExamples: input.qualityScore - 6,
        emotionalCueCapture: input.qualityScore - 8,
        userTalkTimeRatio: input.qualityScore + 5,
        insightDensity: input.qualityScore + 2
      },
      didWell: ["Kept questions concise", "Captured concrete workflow language"],
      missedFollowUps: ["Probe for frequency and business impact", "Ask for the most recent concrete example"],
      leadingQuestions: ["No severe bias detected"],
      bestNextQuestions: ["What happens immediately after that moment?", "How often does this occur in a normal week?"],
      recommendedProductActions: insights.map((item) => `Explore: ${item.title}`),
      generatedAt: now
    }
  };
}

export function fallbackAnalysis(input: {
  chunk: TranscriptChunk;
  fullTranscript: TranscriptChunk[];
  goal: string;
}): AnalyzerResponse {
  const text = input.chunk.text.toLowerCase();
  const insightBase = {
    id: `${input.chunk.id}-insight`,
    interviewId: input.chunk.interviewId,
    chunkId: input.chunk.id,
    createdAt: new Date().toISOString()
  };

  const alerts = [];
  const suggestedFollowUps = [];
  const insights: ExtractedInsight[] = [];

  if (text.includes("fine") || text.includes("guess") || text.includes("eventually")) {
    alerts.push({
      id: `${input.chunk.id}-vague`,
      type: "vague_answer" as const,
      title: "Vague satisfaction answer",
      reason: "The customer is using soft language that may conceal friction.",
      suggestedQuestion: "When you say it was fine, what was the least smooth part?",
      severity: "high" as const
    });
    suggestedFollowUps.push({
      id: `${input.chunk.id}-follow-vague`,
      question: "What did you have to figure out that you expected the product to explain?",
      rationale: "Turns vague satisfaction into a concrete setup moment.",
      priority: "high" as const
    });
    insights.push({
      ...insightBase,
      type: "pain_point",
      title: "Hidden onboarding friction",
      summary: "The customer minimized friction before admitting they had to work through uncertainty.",
      quote: input.chunk.text,
      tags: ["onboarding", "hidden-friction"],
      sentiment: -0.35,
      urgency: 70,
      confidence: 86
    });
  }

  if (text.includes("pricing") || text.includes("cheap")) {
    alerts.push({
      id: `${input.chunk.id}-pricing`,
      type: "pain_point" as const,
      title: "Pricing confusion",
      reason: "The answer links pricing controls to trust and revenue anxiety.",
      suggestedQuestion: "What information would make that pricing recommendation feel trustworthy?",
      severity: "high" as const
    });
    insights.push({
      ...insightBase,
      id: `${input.chunk.id}-pricing-insight`,
      type: "pain_point",
      title: "Pricing controls create uncertainty",
      summary: "The customer is unsure whether automated pricing will harm revenue.",
      quote: input.chunk.text,
      tags: ["pricing", "trust"],
      sentiment: -0.5,
      urgency: 82,
      confidence: 91
    });
  }

  if (text.includes("support")) {
    alerts.push({
      id: `${input.chunk.id}-support`,
      type: "missed_follow_up" as const,
      title: "Support dependency",
      reason: "Repeated support contact suggests the product did not resolve setup uncertainty itself.",
      suggestedQuestion: "What did support clarify that the onboarding flow should have made obvious?",
      severity: "medium" as const
    });
    insights.push({
      ...insightBase,
      id: `${input.chunk.id}-support-insight`,
      type: "workflow",
      title: "Support became part of onboarding",
      summary: "Support was needed twice before launch, which signals gaps in self-serve setup.",
      quote: input.chunk.text,
      tags: ["support-dependency", "onboarding"],
      sentiment: -0.44,
      urgency: 76,
      confidence: 90
    });
  }

  if (text.includes("pay") || text.includes("saved me")) {
    alerts.push({
      id: `${input.chunk.id}-pay`,
      type: "buying_signal" as const,
      title: "Willingness to pay",
      reason: "The customer named a specific value threshold.",
      suggestedQuestion: "How would you decide whether it actually saved you that hour?",
      severity: "high" as const
    });
    insights.push({
      ...insightBase,
      id: `${input.chunk.id}-pay-insight`,
      type: "buying_signal",
      title: "Willingness to pay for time savings",
      summary: "The customer would pay if proactive guidance saved an hour each week.",
      quote: input.chunk.text,
      tags: ["willingness-to-pay", "automation"],
      sentiment: 0.42,
      urgency: 88,
      confidence: 89
    });
  }

  if (alerts.length === 0 && input.chunk.speaker === "Customer") {
    suggestedFollowUps.push({
      id: `${input.chunk.id}-follow-default`,
      question: "Can you give me the most recent example of that?",
      rationale: "Pushes toward concrete evidence without leading the customer.",
      priority: "medium" as const
    });
  }

  return {
    suggestedFollowUps,
    alerts,
    extractedInsights: insights,
    sentimentScore: insights[0]?.sentiment ?? 0.05,
    urgencyScore: Math.max(42, ...insights.map((item) => item.urgency)),
    confidenceScore: insights[0]?.confidence ?? 72,
    tags: [...new Set(insights.flatMap((item) => item.tags))]
  };
}
