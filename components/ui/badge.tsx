import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "muted" | "warning" | "success" }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium",
        variant === "default" && "border-teal-300/20 bg-teal-300/10 text-teal-100",
        variant === "muted" && "border-white/10 bg-white/6 text-muted-foreground",
        variant === "warning" && "border-amber-300/20 bg-amber-300/10 text-amber-100",
        variant === "success" && "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
        className
      )}
      {...props}
    />
  );
}
