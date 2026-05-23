import { NextResponse } from "next/server";
import { listInterviews, resetSeedData, upsertInterview } from "@/lib/data";
import type { Interview } from "@/lib/types";

export async function GET() {
  const interviews = await listInterviews();
  return NextResponse.json({ interviews });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (body?.action === "seed") {
    const interviews = await resetSeedData();
    return NextResponse.json({ interviews, seeded: true });
  }

  const interview = body?.interview as Interview | undefined;
  if (!interview?.id) {
    return NextResponse.json({ error: "Missing interview payload" }, { status: 400 });
  }
  const saved = await upsertInterview(interview);
  return NextResponse.json({ interview: saved });
}
