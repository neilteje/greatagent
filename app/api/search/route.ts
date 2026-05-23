import { NextResponse } from "next/server";
import { embedText } from "@/lib/ai";
import { listInterviews } from "@/lib/data";
import type { MemorySearchResult } from "@/lib/types";
import { cosineSimilarity, localHashEmbedding } from "@/lib/vector";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const query = String(body?.query ?? "").trim();
  const tag = String(body?.tag ?? "all");
  const sentiment = String(body?.sentiment ?? "all");
  const urgency = String(body?.urgency ?? "all");
  const interviewFilter = String(body?.interview ?? "all");

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const queryEmbedding = await embedText(query);
  const interviews = await listInterviews();
  const results: MemorySearchResult[] = [];

  for (const interview of interviews) {
    if (interviewFilter !== "all" && interview.id !== interviewFilter) continue;
    for (const insight of interview.insights) {
      if (tag !== "all" && !insight.tags.includes(tag)) continue;
      if (sentiment === "negative" && insight.sentiment >= -0.05) continue;
      if (sentiment === "positive" && insight.sentiment <= 0.05) continue;
      if (urgency === "high" && insight.urgency < 75) continue;
      if (urgency === "medium" && (insight.urgency < 45 || insight.urgency >= 75)) continue;
      const text = [insight.title, insight.summary, insight.quote, insight.tags.join(" ")].join(" ");
      const embedding = insight.embedding ?? localHashEmbedding(text, queryEmbedding.length);
      const score = cosineSimilarity(queryEmbedding, embedding);
      const context = interview.transcript.find((chunk) => chunk.id === insight.chunkId)?.text ?? insight.summary;
      results.push({
        interviewId: interview.id,
        interviewTitle: interview.title,
        customer: interview.customer,
        chunkId: insight.chunkId,
        quote: insight.quote,
        context,
        insight: insight.title,
        tags: insight.tags,
        sentiment: insight.sentiment,
        urgency: insight.urgency,
        score
      });
    }
  }

  results.sort((a, b) => b.score - a.score || b.urgency - a.urgency);
  return NextResponse.json({ results: results.slice(0, 12) });
}
