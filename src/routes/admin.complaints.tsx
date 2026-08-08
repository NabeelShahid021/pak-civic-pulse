import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Copy, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, type Complaint } from "@/lib/api";
import { useSession } from "@/hooks/use-session";
import { CategoryBadge, PriorityBadge } from "@/components/civic/badges";
import { ComplaintDetailDialog, formatDate } from "@/components/civic/complaint-detail";
import { AdminPageHeader } from "@/components/civic/admin-shell";

export const Route = createFileRoute("/admin/complaints")({
  head: () => ({
    meta: [
      { title: "Complaints Management — Admin Panel" },
      {
        name: "description",
        content: "Filter, assign departments and update the status of civic complaints.",
      },
      { property: "og:title", content: "Complaints Management — Admin Panel" },
      { property: "og:description", content: "Municipal complaint dispatch and status controls." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminComplaints,
});

const STATUSES = ["Open", "Assigned", "In Progress", "Resolved"];
const CATEGORIES = ["Road", "Water/Drainage", "Waste", "Electricity", "Safety", "Other"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const ALL = "__all__";

function AdminComplaints() {
  const session = useSession();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [filters, setFilters] = useState({
    category: "",
    priority: "",
    status: "",
    department: "",
    location: "",
    date_from: "",
    date_to: "",
  });

  const load = useCallback(async () => {
    if (!session.adminToken) return;
    setLoading(true);
    setError(false);
    try {
      const query: Record<string, string | undefined> = { ...filters };
      if (query["date_from"]) query["date_from"] = new Date(query["date_from"]).toISOString();
      if (query["date_to"]) query["date_to"] = new Date(query["date_to"]).toISOString();
      setComplaints(await api.complaints(query));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [session.adminToken, filters]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <AdminPageHeader
        title="Complaints"
        subtitle="Filter, assign and dispatch civic complaints"
        actions={
          <Button variant="outline" onClick={load} disabled={loading} className="gap-2">
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        }
      />

      {error && (
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-center">
          <p className="text-sm font-medium">Could not load complaints.</p>
          <Button variant="outline" className="mt-3" onClick={load}>
            Retry
          </Button>
        </div>
      )}

      <section className="glass-card mt-6 rounded-2xl p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect
            label="Category"
            value={filters.category}
            options={CATEGORIES}
            onChange={(v) => setFilters((f) => ({ ...f, category: v }))}
          />
          <FilterSelect
            label="Priority"
            value={filters.priority}
            options={PRIORITIES}
            onChange={(v) => setFilters((f) => ({ ...f, priority: v }))}
          />
          <FilterSelect
            label="Status"
            value={filters.status}
            options={STATUSES}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          />
          <div className="space-y-1.5">
            <Label className="text-xs">Department</Label>
            <Input
              value={filters.department}
              onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
              placeholder="WASA, TEPA..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Location</Label>
            <Input
              value={filters.location}
              onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
              placeholder="G-9, Gulberg..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">From</Label>
            <Input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">To</Label>
            <Input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                setFilters({
                  category: "",
                  priority: "",
                  status: "",
                  department: "",
                  location: "",
                  date_from: "",
                  date_to: "",
                })
              }
            >
              Clear filters
            </Button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground uppercase">
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Citizen</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Priority</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <AdminRow key={c.complaint_id} complaint={c} onRefresh={load} onView={setSelected} />
              ))}
              {!loading && complaints.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">
                    No complaints match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && (
            <p className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading complaints...
            </p>
          )}
        </div>
      </section>

      <ComplaintDetailDialog complaint={selected} onOpenChange={() => setSelected(null)} />
    </div>
  );
}

function AdminRow({
  complaint,
  onRefresh,
  onView,
}: {
  complaint: Complaint;
  onRefresh: () => void;
  onView: (c: Complaint) => void;
}) {
  const [department, setDepartment] = useState(complaint.assigned_department ?? "");
  const [saving, setSaving] = useState(false);

  const update = async (body: { status?: string; assigned_department?: string }) => {
    setSaving(true);
    try {
      await api.updateComplaint(complaint.complaint_id, body);
      toast.success(`Complaint #${complaint.complaint_id} updated.`);
      onRefresh();
    } catch {
      /* handled */
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="border-b border-border/60 align-top hover:bg-secondary/40">
      <td className="px-3 py-3 font-bold">#{complaint.complaint_id}</td>
      <td className="px-3 py-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          {complaint.phone || (complaint.citizen_id ? `Citizen #${complaint.citizen_id}` : "—")}
          {complaint.phone && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(complaint.phone!);
                toast.success("Phone copied");
              }}
              aria-label="Copy phone"
            >
              <Copy className="h-3 w-3" />
            </button>
          )}
        </span>
      </td>
      <td className="px-3 py-3">
        <CategoryBadge category={complaint.category} />
      </td>
      <td className="px-3 py-3">
        <PriorityBadge priority={complaint.priority} />
      </td>
      <td className="max-w-[12rem] px-3 py-3 text-xs break-words">{complaint.location || "—"}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-1">
          <Input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Assign department"
            className="h-8 w-40 text-xs"
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            disabled={saving || department === (complaint.assigned_department ?? "")}
            onClick={() => update({ assigned_department: department })}
          >
            Save
          </Button>
        </div>
      </td>
      <td className="px-3 py-3 text-xs text-muted-foreground">
        {formatDate(complaint.date_submitted)}
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <Select value={complaint.status} onValueChange={(v) => update({ status: v })}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="ghost" className="h-8" onClick={() => onView(complaint)}>
            View
          </Button>
        </div>
      </td>
    </tr>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? "" : v)}>
        <SelectTrigger>
          <SelectValue placeholder={`All ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All {label.toLowerCase()}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}