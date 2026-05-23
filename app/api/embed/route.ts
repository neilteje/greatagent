import { NextResponse } from "next/server";
import { embedText } from "@/lib/ai";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const text = body?.text as string | undefined;
  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }
  const embedding = await embedText(text);
  return NextResponse.json({ embedding });
}
