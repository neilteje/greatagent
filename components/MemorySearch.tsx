"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Filter, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { Interview, MemorySearchResult } from "@/lib/types";

const examples = ["onboarding confusion", "willingness to pay", "pricing frustration", "support dependency", "feature requests from power users"];

export function MemorySearch({ interviews }: { interviews: Interview[] }) {
  const [query, setQuery] = useState("pricing frustration");
  const [tag, setTag] = useState("all");
  const [sentiment, setSentiment] = useState("all");
  const [urgency, setUrgency] = useState("all");
  const [interview, setInterview] = useState("all");
  const [results, setResults] = useState<MemorySearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const tags = useMemo(() => ["all", ...new Set(interviews.flatMap((item) => item.tags))], [interviews]);

  async function search(nextQuery = query) {
    setLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: nextQuery, tag, sentiment, urgency, interview })
      });
      const data = await response.json();
      setResults(data.results ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag, sentiment, urgency, interview]);

  return (
    <div className="space-y-4">
      <div>
        <Badge>Semantic memory</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Search across interview moments</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Query insights, quotes, and context using local vector similarity. OpenAI embeddings are used when an API key is configured.
        </p>
      </div>
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && search()} className="pl-9" />
            </div>
            <Button onClick={() => search()} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {examples.map((example) => (
              <Button key={example} size="sm" variant="secondary" onClick={() => { setQuery(example); search(example); }}>
                {example}
              </Button>
            ))}
          </div>
          <div className="grid gap-2 md:grid-cols-4">
            <Select label="Tag" value={tag} onChange={setTag} options={tags} />
            <Select label="Sentiment" value={sentiment} onChange={setSentiment} options={["all", "negative", "positive"]} />
            <Select label="Urgency" value={urgency} onChange={setUrgency} options={["all", "high", "medium"]} />
            <Select label="Interview" value={interview} onChange={setInterview} options={["all", ...interviews.map((item) => item.id)]} labels={Object.fromEntries(interviews.map((item) => [item.id, item.title]))} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {loading ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center text-sm text-muted-foreground">Searching the research memory...</div>
        ) : results.length ? results.map((result) => (
          <Link key={`${result.interviewId}-${result.chunkId}-${result.insight}`} href={`/review/${result.interviewId}`}>
            <Card className="transition hover:border-teal-300/20 hover:bg-white/8">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge>{result.interviewTitle}</Badge>
                      <Badge variant="muted">{result.customer}</Badge>
                      {result.tags.slice(0, 4).map((item) => <Badge key={item} variant="muted">{item}</Badge>)}
                    </div>
                    <h3 className="font-semibold">{result.insight}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{result.context}</p>
                    <p className="mt-3 rounded-md bg-black/20 p-3 text-sm text-slate-200">{result.quote}</p>
                  </div>
                  <div className="w-full shrink-0 space-y-3 lg:w-52">
                    <Score label="Match" value={Math.round(result.score * 100)} />
                    <Score label="Urgency" value={result.urgency} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )) : (
          <div className="rounded-lg border border-dashed border-white/12 bg-white/4 p-8 text-center">
            <Filter className="mx-auto mb-3 h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No results yet. Try a demo query like pricing frustration or support dependency.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options, labels = {} }: { label: string; value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string> }) {
  return (
    <label className="text-xs text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
      >
        {options.map((option) => <option key={option} value={option}>{labels[option] ?? option}</option>)}
      </select>
    </label>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
