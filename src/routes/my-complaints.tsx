import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { FileSearch, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, type Complaint } from "@/lib/api";
import { useSession } from "@/hooks/use-session";
import { useAuthDialog } from "@/components/civic/auth-dialog";
import { ComplaintCard } from "@/components/civic/complaint-card";
import { ComplaintDetailDialog } from "@/components/civic/complaint-detail";

export const Route = createFileRoute("/my-complaints")({
  head: () => ({
    meta: [
      { title: "My Complaints — AI Smart Civic Services" },
      {
        name: "description",
        content:
          "Your citizen dashboard: every complaint you filed with AI category, priority, status and resolution timeline.",
      },
      { property: "og:title", content: "My Complaints — AI Smart Civic Services" },
      {
        property: "og:description",
        content: "Track every civic complaint you filed, with live status and AI reasoning.",
      },
    ],
  }),
  component: MyComplaintsPage,
});

function MyComplaintsPage() {
  const session = useSession();
  const { open } = useAuthDialog();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<Complaint | null>(null);

  const load = useCallback(async () => {
    if (!session.citizenToken) return;
    setLoading(true);
    setFailed(false);
    try {
      setComplaints(await api.myComplaints());
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [session.citizenToken]);

  useEffect(() => {
    load();
  }, [load]);

  if (!session.citizenToken) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <FileSearch className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-extrabold">Sign in to see your complaints</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your citizen dashboard is protected by your CNIC login.
        </p>
        <Button className="mt-5" onClick={() => open("citizen")}>
          Sign in with CNIC
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-extrabold tracking-tight">My Complaints</h1>
          <p className="text-sm text-muted-foreground">
            {complaints.length} complaint{complaints.length === 1 ? "" : "s"} filed under your CNIC
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading} className="gap-2">
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh
        </Button>
      </header>

      {loading && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      )}

      {failed && !loading && (
        <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm font-medium">We couldn't load your complaints.</p>
          <Button className="mt-3" variant="outline" onClick={load}>
            <Loader2 className="mr-2 h-4 w-4" /> Retry
          </Button>
        </div>
      )}

      {!loading && !failed && complaints.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No complaints yet. File your first civic issue and the AI will route it instantly.
          </p>
          <Button asChild className="mt-4">
            <Link to="/">Submit a complaint</Link>
          </Button>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {complaints.map((c) => (
          <ComplaintCard key={c.complaint_id} complaint={c} onView={setSelected} />
        ))}
      </div>

      <ComplaintDetailDialog complaint={selected} onOpenChange={() => setSelected(null)} />
    </div>
  );
}
