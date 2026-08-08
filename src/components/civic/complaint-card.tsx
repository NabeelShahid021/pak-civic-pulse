import { ImageOff, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryBadge, PriorityBadge, StatusPill } from "./badges";
import { formatDate } from "./complaint-detail";
import type { Complaint } from "@/lib/api";

export function ComplaintCard({
  complaint,
  onView,
}: {
  complaint: Complaint;
  onView: (c: Complaint) => void;
}) {
  return (
    <article className="glass-card flex flex-col gap-3 rounded-2xl p-4 transition-transform duration-200 hover:-translate-y-1">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="text-sm font-extrabold">#{complaint.complaint_id}</p>
          <p className="text-xs text-muted-foreground">{formatDate(complaint.date_submitted)}</p>
        </div>
        <StatusPill status={complaint.status} />
      </div>

      {complaint.image_url ? (
        <img
          src={complaint.image_url}
          alt={`Complaint ${complaint.complaint_id} evidence`}
          loading="lazy"
          className="h-32 w-full rounded-xl border border-border object-cover"
        />
      ) : (
        <div className="grid h-32 w-full place-items-center rounded-xl border border-dashed border-border text-muted-foreground">
          <ImageOff className="h-5 w-5" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <CategoryBadge category={complaint.category} />
        <PriorityBadge priority={complaint.priority} />
      </div>

      <p className="line-clamp-3 text-sm leading-relaxed text-foreground/90">
        {complaint.ai_summary || complaint.description}
      </p>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{complaint.location || "Location not provided"}</span>
      </p>

      <Button variant="outline" size="sm" className="mt-auto" onClick={() => onView(complaint)}>
        View details
      </Button>
    </article>
  );
}
