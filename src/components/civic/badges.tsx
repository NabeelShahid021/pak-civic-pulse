import {
  Building2,
  Droplets,
  Trash2,
  Zap,
  ShieldAlert,
  Construction,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function categoryIcon(category?: string | null): LucideIcon {
  const c = (category ?? "").toLowerCase();
  if (c.includes("road")) return Construction;
  if (c.includes("water") || c.includes("drain") || c.includes("sewer")) return Droplets;
  if (c.includes("waste") || c.includes("garbage") || c.includes("sanit")) return Trash2;
  if (c.includes("electric") || c.includes("power")) return Zap;
  if (c.includes("safety") || c.includes("hazard")) return ShieldAlert;
  return Building2;
}

export function CategoryBadge({ category, className }: { category: string; className?: string }) {
  const Icon = categoryIcon(category);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {category}
    </span>
  );
}

const priorityStyles: Record<string, string> = {
  low: "bg-emerald/15 text-emerald border-emerald/30",
  medium: "bg-sapphire/15 text-sapphire border-sapphire/30",
  high: "bg-amber/20 text-amber border-amber/40",
  critical: "bg-ruby/15 text-ruby border-ruby/40 animate-pulse",
};

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  const key = (priority ?? "").toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold tracking-wide uppercase",
        priorityStyles[key] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}

const statusStyles: Record<string, string> = {
  open: "bg-muted text-muted-foreground border-border",
  assigned: "bg-sapphire/15 text-sapphire border-sapphire/30",
  "in progress": "bg-amber/20 text-amber border-amber/40",
  resolved: "bg-emerald/15 text-emerald border-emerald/30",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const key = (status ?? "").toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        statusStyles[key] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      {status}
    </span>
  );
}

export const STATUS_STEPS = ["Submitted", "AI Triaged", "Assigned", "In Progress", "Resolved"];

export function statusStepIndex(status: string, department?: string | null) {
  const s = (status ?? "").toLowerCase();
  if (s === "resolved") return 4;
  if (s === "in progress") return 3;
  if (s === "assigned" || department) return 2;
  return 1;
}
