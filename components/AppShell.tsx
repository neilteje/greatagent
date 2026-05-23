"use client";

import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="min-h-screen px-4 py-4 md:pl-[244px] md:pr-6 lg:py-6">
        <div className="mx-auto max-w-[1500px]">{children}</div>
      </main>
    </div>
  );
}
