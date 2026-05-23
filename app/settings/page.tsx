import { KeyRound, Mic, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <Badge>Demo settings</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Prototype configuration</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          No auth, teams, billing, or permissions. This screen documents the runtime knobs for the investor demo.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Setting icon={KeyRound} title="OpenAI API key" copy="Set OPENAI_API_KEY to enable live analyzer completions, embeddings, report generation, and Whisper transcription." />
        <Setting icon={Mic} title="Recording mode" copy="Browser MediaRecorder captures audio locally and posts the clip to /api/transcribe when stopped." />
        <Setting icon={Server} title="Persistence" copy="Demo interviews are stored in local JSON under /data/interviews.json for fast reset and portability." />
      </div>
    </div>
  );
}

function Setting({ icon: Icon, title, copy }: { icon: typeof KeyRound; title: string; copy: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-teal-100" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{copy}</p>
      </CardContent>
    </Card>
  );
}
