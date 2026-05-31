`great agent` is an end-to-end demo of an AI-native customer research platform. It feels like a realtime research command center: a moderator agent listens to an interview, flags weak research moments, suggests better follow-ups, extracts insights, scores interview quality, and makes past evidence searchable by meaning.

I strongly believe customer interviews are only as useful as the evidence they produce. Teams often miss vague answers, accept weak satisfaction signals, forget to probe emotional cues, or lose the best quotes after the call. And today, I built something that shows how an AI research copilot can improve interview quality while the conversation is happening, then turn the transcript into a reusable research memory.

## Greatest Agent offerings!!
- Dashboard with recent interviews, insight stats, top pain points, and seeded demo data
- Live interview console with optional webcam preview, MediaRecorder audio capture, timer, transcript stream, moderator alerts, follow-up recommendations, sentiment, urgency, and confidence
- Demo mode via **Run Airbnb Host Demo**
- Real audio transcription route using Whisper when `OPENAI_API_KEY` is configured
- Analyzer route for realtime research critique and insight extraction
- Post-interview report with executive summary, an LLM council deliberation, quality critic score, radar chart, insights, quotes, missed follow-ups, and product actions
- Semantic memory search with local cosine similarity and OpenAI embeddings when available
- Local JSON persistence under `data/interviews.json`

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Mode

1. Open `/interview`.
2. Click **Run Airbnb Host Demo**.
3. Watch the transcript stream line by line.
4. The moderator agent will detect vague satisfaction, hidden onboarding friction, pricing confusion, support dependency, willingness to pay, and missed follow-up opportunities.
5. When the script ends, the app saves the interview and opens the generated report.

## Real Recording Mode

1. Open `/interview`.
2. Allow microphone access.
3. Click **Record Audio**.
4. Click **Stop** to send the captured audio to `/api/transcribe`.
5. The transcript chunk is analyzed and added to the current interview.
6. Click **End & Report** when ready.

## Architecture

- `app/` uses Next.js App Router pages and API routes.
- `components/` contains reusable command-center UI components.
- `lib/types.ts` defines `Interview`, `TranscriptChunk`, `AgentAlert`, `SuggestedFollowUp`, `ExtractedInsight`, `InterviewReport`, and `MemorySearchResult`.
- `lib/data.ts` reads and writes local JSON persistence.
- `lib/ai.ts` wraps OpenAI calls, robust fallback parsing, and the multi-agent LLM council that deliberates over generated reports.
- `lib/vector.ts` implements cosine similarity plus a local hash embedding fallback.
- `lib/demo-data.ts` seeds three research interviews: Airbnb host onboarding, B2B SaaS admin dashboard, and consumer fitness app churn.