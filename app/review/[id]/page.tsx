import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { InterviewReportView } from "@/components/InterviewReportView";
import { Button } from "@/components/ui/button";
import { getInterview } from "@/lib/data";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const interview = await getInterview(id);
  if (!interview) notFound();
  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
      </Button>
      <InterviewReportView interview={interview} />
    </div>
  );
}
