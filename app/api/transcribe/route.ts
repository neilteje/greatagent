import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(request: Request) {
  const openai = getOpenAI();
  if (!openai) {
    return NextResponse.json({
      text: "Demo transcription fallback: the customer described onboarding as fine, then revealed pricing confusion and support dependency.",
      fallback: true
    });
  }

  const form = await request.formData();
  const file = form.get("audio");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1"
    });
    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    return NextResponse.json(
      { error: "Transcription failed", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
