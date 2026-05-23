import { MemorySearch } from "@/components/MemorySearch";
import { listInterviews } from "@/lib/data";

export default async function SearchPage() {
  const interviews = await listInterviews();
  return <MemorySearch interviews={interviews} />;
}
