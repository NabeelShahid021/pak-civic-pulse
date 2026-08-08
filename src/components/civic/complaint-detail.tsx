import { CalendarClock, CheckCircle2, Copy, MapPin, Building2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoryBadge, PriorityBadge, StatusPill, STATUS_STEPS, statusStepIndex } from "./badges";
import type { Complaint } from "@/lib/api";

export function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProgressTimeline({ complaint }: { complaint: Complaint }) {
  const current = statusStepIndex(complaint.status, complaint.assigned_department);
  return (
    <ol className="grid gap-3 sm:grid-cols-5">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} className="flex items-center gap-2 sm:flex-col sm:items-start">
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                done
                  ? "gradient-hero text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span
              className={`text-xs font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function ComplaintDetailDialog({
  complaint,
  onOpenChange,
}: {
  complaint: Complaint | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!complaint) return null;
  return (
    <Dialog open={!!complaint} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Complaint #{complaint.complaint_id}
            <button
              onClick={() => {
                navigator.clipboard.writeText(String(complaint.complaint_id));
                toast.success("Complaint ID copied");
              }}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Copy complaint id"
            >
              <Copy className="h-4 w-4" />
            </button>
          </DialogTitle>
          <DialogDescription>{formatDate(complaint.date_submitted)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <CategoryBadge category={complaint.category} />
            <PriorityBadge priority={complaint.priority} />
            <StatusPill status={complaint.status} />
          </div>

          <ProgressTimeline complaint={complaint} />

          {complaint.image_url && (
            <img
              src={complaint.image_url}
              alt={`Evidence for complaint ${complaint.complaint_id}`}
              className="max-h-64 w-full rounded-xl border border-border object-cover"
              loading="lazy"
            />
          )}

          <div className="rounded-xl border border-border bg-secondary/50 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Description</p>
            <p className="mt-1 text-sm leading-relaxed break-words">{complaint.description}</p>
          </div>

          {complaint.ai_summary && (
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
              <p className="text-xs font-semibold text-primary uppercase">AI Dispatch Summary</p>
              <p className="mt-1 text-sm leading-relaxed">{complaint.ai_summary}</p>
            </div>
          )}

          {!!complaint.ai_keywords?.length && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                AI Explainability Keywords
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {complaint.ai_keywords.map((k) => (
                  <span
                    key={k}
                    className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <Detail icon={MapPin} label="Location" value={complaint.location ?? "Not provided"} />
            <Detail
              icon={Building2}
              label="Assigned department"
              value={complaint.assigned_department ?? "Awaiting dispatch"}
            />
            <Detail icon={CalendarClock} label="Submitted" value={formatDate(complaint.date_submitted)} />
            <Detail
              icon={CheckCircle2}
              label="Resolved at"
              value={complaint.resolved_at ? formatDate(complaint.resolved_at) : "Not yet resolved"}
            />
          </div>

          {complaint.duplicate_of != null && (
            <p className="rounded-xl border border-amber/40 bg-amber/10 p-3 text-sm text-amber">
              ⚡ Clustered with complaint #{complaint.duplicate_of} — priority escalated for rapid
              dispatch.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2 rounded-lg border border-border p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}
