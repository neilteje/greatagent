"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, CircleStop, Loader2, Mic, Play, Radio, Save } from "lucide-react";
import { AgentAlertCard } from "@/components/AgentAlertCard";
import { FollowUpCard } from "@/components/FollowUpCard";
import { InsightCard } from "@/components/InsightCard";
import { SentimentTimeline } from "@/components/SentimentTimeline";
import { TranscriptStream } from "@/components/TranscriptStream";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { airbnbHostScript } from "@/lib/demo-data";
import { formatDuration } from "@/lib/utils";
import type { AgentAlert, AnalyzerResponse, ExtractedInsight, Interview, SuggestedFollowUp, TranscriptChunk } from "@/lib/types";

const defaultGoal = "Understand onboarding friction, pricing confidence, support dependency, and willingness to pay for first-time Airbnb hosts.";

export function DemoModeRunner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const alertsRef = useRef<AgentAlert[]>([]);
  const followUpsRef = useRef<SuggestedFollowUp[]>([]);
  const insightsRef = useRef<ExtractedInsight[]>([]);
  const sentimentRef = useRef<number[]>([]);
  const urgencyRef = useRef(42);
  const confidenceRef = useRef(72);
  const [goal, setGoal] = useState(defaultGoal);
  const [transcript, setTranscript] = useState<TranscriptChunk[]>([]);
  const [alerts, setAlerts] = useState<AgentAlert[]>([]);
  const [followUps, setFollowUps] = useState<SuggestedFollowUp[]>([]);
  const [insights, setInsights] = useState<ExtractedInsight[]>([]);
  const [sentiment, setSentiment] = useState<number[]>([]);
  const [urgency, setUrgency] = useState(42);
  const [confidence, setConfidence] = useState(72);
  const [isRunning, setIsRunning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [toast, setToast] = useState("");

  const interviewId = useMemo(() => `live-airbnb-demo-${Date.now()}`, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isRunning || isRecording) {
      timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, isRecording]);

  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => undefined);
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function analyze(chunk: TranscriptChunk, nextTranscript: TranscriptChunk[]) {
    if (chunk.speaker !== "Customer") return;
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-chunk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcriptChunk: chunk,
          fullTranscript: nextTranscript,
          currentInterviewGoal: goal,
          previousInsights: insightsRef.current
        })
      });
      const result = (await response.json()) as AnalyzerResponse;
      alertsRef.current = [...result.alerts, ...alertsRef.current].slice(0, 8);
      followUpsRef.current = [...result.suggestedFollowUps, ...followUpsRef.current].slice(0, 8);
      insightsRef.current = [...result.extractedInsights, ...insightsRef.current].slice(0, 12);
      sentimentRef.current = [...sentimentRef.current, result.sentimentScore];
      setAlerts(alertsRef.current);
      setFollowUps(followUpsRef.current);
      setInsights(insightsRef.current);
      setSentiment(sentimentRef.current);
      urgencyRef.current = result.urgencyScore;
      confidenceRef.current = result.confidenceScore;
      setUrgency(urgencyRef.current);
      setConfidence(confidenceRef.current);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function runDemo() {
    if (isRunning) return;
    setTranscript([]);
    setAlerts([]);
    setFollowUps([]);
    setInsights([]);
    setSentiment([]);
    alertsRef.current = [];
    followUpsRef.current = [];
    insightsRef.current = [];
    sentimentRef.current = [];
    urgencyRef.current = 42;
    confidenceRef.current = 72;
    setUrgency(42);
    setConfidence(72);
    setSeconds(0);
    setIsRunning(true);

    const built: TranscriptChunk[] = [];
    for (let index = 0; index < airbnbHostScript.length; index += 1) {
      const line = airbnbHostScript[index];
      const chunk: TranscriptChunk = {
        id: `${interviewId}-chunk-${index + 1}`,
        interviewId,
        speaker: line.speaker,
        text: line.text,
        offsetSeconds: line.offsetSeconds,
        timestamp: new Date().toISOString()
      };
      built.push(chunk);
      setTranscript([...built]);
      await analyze(chunk, [...built]);
      await sleep(index < 2 ? 850 : 1250);
    }
    setIsRunning(false);
    await finishInterview(built);
  }

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunksRef.current.push(event.data);
    };
    recorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const form = new FormData();
      form.append("audio", blob, "interview.webm");
      const response = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = await response.json();
      const chunk: TranscriptChunk = {
        id: `${interviewId}-recording-${Date.now()}`,
        interviewId,
        speaker: transcript.length % 2 === 0 ? "Interviewer" : "Customer",
        text: data.text ?? "Transcription unavailable.",
        timestamp: new Date().toISOString(),
        offsetSeconds: seconds
      };
      const next = [...transcript, chunk];
      setTranscript(next);
      await analyze(chunk, next);
    };
    recorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setIsRecording(false);
  }

  async function finishInterview(chunks = transcript) {
    const finalInterview: Interview = {
      id: interviewId,
      title: "Airbnb host live demo",
      customer: "Maya, first-time host",
      segment: "Marketplace supply",
      goal,
      status: "complete",
      createdAt: new Date().toISOString(),
      durationSeconds: Math.max(seconds, chunks[chunks.length - 1]?.offsetSeconds ?? 0),
      sentimentScore: sentimentRef.current.at(-1) ?? -0.18,
      urgencyScore: urgencyRef.current,
      confidenceScore: confidenceRef.current,
      tags: [...new Set(insightsRef.current.flatMap((item) => item.tags))],
      transcript: chunks,
      insights: insightsRef.current,
      qualityScore: 86
    };

    setToast("Saving interview and generating report");
    const save = await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interview: finalInterview })
    });
    const saved = await save.json();
    const report = await fetch("/api/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interview: saved.interview ?? finalInterview })
    });
    const generated = await report.json();
    setToast("Report ready");
    setTimeout(() => router.push(`/review/${generated.interview?.id ?? interviewId}`), 750);
  }

  return (
    <div className="space-y-4">
      {toast ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed right-5 top-5 z-50 rounded-md border border-teal-300/20 bg-slate-950/95 px-4 py-3 text-sm shadow-glow"
        >
          {toast}
        </motion.div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge>Live console</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">Realtime research command center</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Run a scripted demo or record a real audio snippet. The moderator agent critiques interview quality while extracting searchable evidence.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={runDemo} disabled={isRunning || isRecording}>
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run Airbnb Host Demo
          </Button>
          {!isRecording ? (
            <Button variant="secondary" onClick={startRecording} disabled={isRunning}>
              <Mic className="h-4 w-4" />
              Record Audio
            </Button>
          ) : (
            <Button variant="destructive" onClick={stopRecording}>
              <CircleStop className="h-4 w-4" />
              Stop
            </Button>
          )}
          <Button variant="outline" onClick={() => finishInterview()} disabled={!transcript.length || isRunning}>
            <Save className="h-4 w-4" />
            End & Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.1fr_0.95fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Interview room</CardTitle>
              <Badge variant={isRunning || isRecording ? "success" : "muted"}>{formatDuration(seconds)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black">
              <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full object-cover opacity-80" />
              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-md bg-black/50 px-2 py-1 text-xs">
                <Camera className="h-3.5 w-3.5" />
                optional video preview
              </div>
            </div>
            <Textarea value={goal} onChange={(event) => setGoal(event.target.value)} className="min-h-[72px]" />
            <TranscriptStream chunks={transcript} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Moderator Agent</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="status-dot" />
                {isAnalyzing ? "analyzing" : "standing by"}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {followUps.length ? followUps.map((item) => <FollowUpCard key={item.id} followUp={item} />) : (
                <div className="rounded-md border border-dashed border-white/12 bg-white/4 p-5 text-sm text-muted-foreground">
                  Follow-up questions appear when the agent hears vague or high-signal moments.
                </div>
              )}
            </div>
            <div className="space-y-3">
              {alerts.length ? alerts.map((alert) => <AgentAlertCard key={alert.id} alert={alert} />) : (
                <div className="rounded-md border border-dashed border-white/12 bg-white/4 p-5 text-sm text-muted-foreground">
                  Alerts will flag missed follow-ups, contradictions, emotional cues, pricing confusion, and leading questions.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Live insights</CardTitle>
              <Badge variant="muted">{insights.length} captured</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Signal label="Urgency" value={urgency} />
              <Signal label="Confidence" value={confidence} />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Radio className="h-4 w-4 text-teal-100" />
                Sentiment timeline
              </div>
              <SentimentTimeline values={sentiment} />
            </div>
            <div className="space-y-3">
              {insights.length ? insights.map((insight) => <InsightCard key={insight.id} insight={insight} />) : (
                <div className="rounded-md border border-dashed border-white/12 bg-white/4 p-5 text-sm text-muted-foreground">
                  Pain points, objections, feature requests, buying intent, and urgency will land here.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-3">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold">{Math.round(value)}</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
