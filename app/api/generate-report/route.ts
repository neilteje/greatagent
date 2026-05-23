import { NextResponse } from "next/server";
import { generateReport } from "@/lib/ai";
import { getInterview, upsertInterview } from "@/lib/data";
import type { Interview } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const interviewFromBody = body?.interview as Interview | undefined;
  const id = body?.interviewId as string | undefined;
  const interview = interviewFromBody ?? (id ? await getInterview(id) : null);

  if (!interview) {
    return NextResponse.json({ error: "Missing interview" }, { status: 400 });
  }

  const report = await generateReport(interview);
  const saved = await upsertInterview({
    ...interview,
    status: "complete",
    qualityScore: report.qualityScore,
    report
  });

  return NextResponse.json({ report, interview: saved });
}
