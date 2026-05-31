export type AlertType =
  | "vague_answer"
  | "missed_follow_up"
  | "contradiction"
  | "leading_question"
  | "emotional_cue"
  | "buying_signal"
  | "pain_point"
  | "feature_request";

export type InsightType =
  | "pain_point"
  | "objection"
  | "feature_request"
  | "buying_signal"
  | "workflow"
  | "quote";

export type TranscriptChunk = {
  id: string;
  interviewId: string;
  speaker: "Interviewer" | "Customer";
  text: string;
  timestamp: string;
  offsetSeconds: number;
};

export type SuggestedFollowUp = {
  id: string;
  question: string;
  rationale: string;
  priority: "low" | "medium" | "high";
};

export type AgentAlert = {
  id: string;
  type: AlertType;
  title: string;
  reason: string;
  suggestedQuestion: string;
  severity: "low" | "medium" | "high";
};

export type ExtractedInsight = {
  id: string;
  interviewId: string;
  chunkId?: string;
  type: InsightType;
  title: string;
  summary: string;
  quote: string;
  tags: string[];
  sentiment: number;
  urgency: number;
  confidence: number;
  embedding?: number[];
  createdAt: string;
};

export type AnalyzerResponse = {
  suggestedFollowUps: SuggestedFollowUp[];
  alerts: AgentAlert[];
  extractedInsights: ExtractedInsight[];
  sentimentScore: number;
  urgencyScore: number;
  confidenceScore: number;
  tags: string[];
};

export type QualityScoreBreakdown = {
  questionNeutrality: number;
  followUpDepth: number;
  answerSpecificity: number;
  evidenceQuality: number;
  concreteExamples: number;
  emotionalCueCapture: number;
  userTalkTimeRatio: number;
  insightDensity: number;
};

export type CouncilJustice = {
  id: string;
  name: string;
  role: string;
  position: string;
  keyEvidence: string[];
  recommendation: string;
  confidence: number;
};

export type CouncilDeliberation = {
  caseTitle: string;
  docketSummary: string;
  justices: CouncilJustice[];
  majorityOpinion: string;
  dissentingConcern: string;
  finalVerdict: string;
  confidence: number;
  nextAction: string;
};

export type InterviewReport = {
  interviewId: string;
  executiveSummary: string;
  topInsights: string[];
  painPoints: string[];
  featureRequests: string[];
  userQuotes: string[];
  buyingSignals: string[];
  qualityScore: number;
  qualityBreakdown: QualityScoreBreakdown;
  didWell: string[];
  missedFollowUps: string[];
  leadingQuestions: string[];
  bestNextQuestions: string[];
  recommendedProductActions: string[];
  council?: CouncilDeliberation;
  generatedAt: string;
};

export type Interview = {
  id: string;
  title: string;
  customer: string;
  segment: string;
  goal: string;
  status: "draft" | "live" | "complete";
  createdAt: string;
  durationSeconds: number;
  qualityScore?: number;
  sentimentScore?: number;
  urgencyScore?: number;
  confidenceScore?: number;
  tags: string[];
  transcript: TranscriptChunk[];
  insights: ExtractedInsight[];
  report?: InterviewReport;
};

export type MemorySearchResult = {
  interviewId: string;
  interviewTitle: string;
  customer: string;
  chunkId?: string;
  quote: string;
  context: string;
  insight: string;
  tags: string[];
  sentiment: number;
  urgency: number;
  score: number;
};

export type DemoDatabase = {
  interviews: Interview[];
};
