"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bot, FileText, Home, Search, Settings, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/interview", label: "Live Interview", icon: Radio },
  { href: "/review/airbnb-host-onboarding", label: "Review", icon: FileText },
  { href: "/search", label: "Memory Search", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-x-3 top-3 z-40 rounded-lg border border-white/10 bg-black/45 p-3 backdrop-blur-xl md:inset-y-4 md:left-4 md:right-auto md:w-[216px]">
      <div className="hidden items-center gap-3 px-2 pb-5 md:flex">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-teal-300 text-slate-950">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold">great agent</div>
          <div className="text-xs text-muted-foreground">Research Autopilot</div>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split("/").slice(0, 2).join("/")));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-fit items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/8 hover:text-foreground",
                active && "bg-white/10 text-foreground shadow-sm"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-5 hidden rounded-md border border-white/10 bg-white/5 p-3 md:block">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-teal-100">
          <span className="status-dot" />
          Live critique ready
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          Demo mode streams a scripted interview and runs the same analysis surface.
        </p>
      </div>
      <div className="mt-3 hidden items-center gap-2 rounded-md border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground md:flex">
        <BarChart3 className="h-4 w-4 text-indigo-200" />
        3 seeded studies
      </div>
    </aside>
  );
}
