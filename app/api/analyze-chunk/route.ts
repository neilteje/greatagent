import { NextResponse } from "next/server";
import { analyzeChunk } from "@/lib/ai";
import type { TranscriptChunk } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.transcriptChunk) {
    return NextResponse.json({ error: "Missing transcriptChunk" }, { status: 400 });
  }

  const result = await analyzeChunk({
    transcriptChunk: body.transcriptChunk as TranscriptChunk,
    fullTranscript: (body.fullTranscript ?? []) as TranscriptChunk[],
    currentInterviewGoal: body.currentInterviewGoal ?? "Discover customer pain and buying signals.",
    previousInsights: body.previousInsights ?? []
  });

  return NextResponse.json(result);
}
