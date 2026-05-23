"use client";

import { motion } from "framer-motion";
import type { TranscriptChunk } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function TranscriptStream({ chunks }: { chunks: TranscriptChunk[] }) {
  if (!chunks.length) {
    return (
      <div className="grid min-h-[220px] place-items-center rounded-md border border-dashed border-white/12 bg-white/4 p-6 text-center">
        <div>
          <div className="mx-auto mb-3 h-2 w-20 rounded-full bg-white/12" />
          <p className="text-sm text-muted-foreground">Transcript will stream here as the interview runs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-[430px] space-y-3 overflow-y-auto pr-1">
      {chunks.map((chunk) => (
        <motion.div
          key={chunk.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-md border border-white/8 bg-white/5 p-3"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <Badge variant={chunk.speaker === "Customer" ? "default" : "muted"}>{chunk.speaker}</Badge>
            <span className="text-xs text-muted-foreground">{Math.floor(chunk.offsetSeconds / 60)}:{String(chunk.offsetSeconds % 60).padStart(2, "0")}</span>
          </div>
          <p className="text-sm leading-6 text-slate-100">{chunk.text}</p>
        </motion.div>
      ))}
    </div>
  );
}
