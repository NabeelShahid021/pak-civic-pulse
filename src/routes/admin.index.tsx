import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Layers,
  RefreshCw,
  Timer,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { api, type Complaint, type Stats } from "@/lib/api";
import { useSession } from "@/hooks/use-session";
import { StatusPill } from "@/components/civic/badges";
import { AdminPageHeader } from "@/components/civic/admin-shell";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Overview — AI Smart Civic Services" },
      {
        name: "description",
        content: "Live KPIs, category and priority analytics for municipal complaint triage.",
      },
      { property: "og:title", content: "Admin Overview — AI Smart Civic Services" },
      { property: "og:description", content: "Live civic analytics for municipal operators." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOverview,
});

const STATUSES = ["Open", "Assigned", "In Progress", "Resolved"];

const PRIORITY_COLORS: Record<string, string> = {
  Low: "var(--emerald)",
  Medium: "var(--sapphire)",
  High: "var(--amber)",
  Critical: "var(--ruby)",
};

function AdminOverview() {
  const session = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!session.adminToken) return;
    setLoading(true);
    setError(false);
    try {
      const [s, c] = await Promise.all([api.stats(), api.complaints({})]);
      setStats(s);
      setComplaints(c);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [session.adminToken]);

  useEffect(() => {
    load();
  }, [load]);

  const criticalOpen = complaints.filter(
    (c) => c.priority?.toLowerCase() === "critical" && c.status?.toLowerCase() !== "resolved",
  ).length;

  const categoryData = Object.entries(stats?.by_category ?? {}).map(([name, value]) => ({
    name,
    value,
  }));
  const priorityData = Object.entries(stats?.by_priority ?? {}).map(([name, value]) => ({
    name,
    value,
  }));
  const statusTotal = Object.values(stats?.by_status ?? {}).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <AdminPageHeader
        title="Overview"
        subtitle="Live municipal triage analytics"
        actions={
          <Button variant="outline" onClick={load} disabled={loading} className="gap-2">
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        }
      />

      {error && (
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-center">
          <p className="text-sm font-medium">Could not load analytics.</p>
          <Button variant="outline" className="mt-3" onClick={load}>
            Retry
          </Button>
        </div>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi icon={ClipboardList} label="Total complaints" value={stats?.total_complaints ?? 0} />
        <Kpi
          icon={CheckCircle2}
          label="Resolved"
          value={stats?.by_status?.["Resolved"] ?? 0}
          tone="text-emerald"
        />
        <Kpi
          icon={AlertTriangle}
          label="Open critical hazards"
          value={criticalOpen}
          tone="text-ruby"
        />
        <Kpi
          icon={Timer}
          label="Avg resolution (hrs)"
          value={
            stats?.avg_resolution_time_hours != null
              ? Math.round(stats.avg_resolution_time_hours * 10) / 10
              : "—"
          }
          tone="text-sapphire"
        />
        <Kpi
          icon={Layers}
          label="Linked duplicates"
          value={stats?.duplicate_count ?? 0}
          tone="text-amber"
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-bold">Complaints by category</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-12} dy={8} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--card-foreground)",
                  }}
                />
                <Bar dataKey="value" fill="var(--sapphire)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-bold">Priority breakdown</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {priorityData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={PRIORITY_COLORS[entry.name] ?? "var(--muted-foreground)"}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--card-foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="glass-card mt-4 rounded-2xl p-5">
        <h2 className="text-sm font-bold">Status pipeline</h2>
        <div className="mt-4 flex h-4 w-full overflow-hidden rounded-full bg-muted">
          {STATUSES.map((s) => {
            const count = stats?.by_status?.[s] ?? 0;
            const pct = (count / statusTotal) * 100;
            const color =
              s === "Resolved"
                ? "var(--emerald)"
                : s === "In Progress"
                  ? "var(--amber)"
                  : s === "Assigned"
                    ? "var(--sapphire)"
                    : "var(--muted-foreground)";
            return (
              <div
                key={s}
                style={{ width: `${pct}%`, background: color }}
                title={`${s}: ${count}`}
              />
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {STATUSES.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <StatusPill status={s} /> {stats?.by_status?.[s] ?? 0}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  tone = "text-primary",
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  tone?: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${tone}`} />
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
    </div>
  );
}