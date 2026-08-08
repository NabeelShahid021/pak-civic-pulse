import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Search, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, ApiError, type Complaint } from "@/lib/api";
import { ComplaintCard } from "@/components/civic/complaint-card";
import { ComplaintDetailDialog, ProgressTimeline } from "@/components/civic/complaint-detail";
import { CategoryBadge, PriorityBadge, StatusPill } from "@/components/civic/badges";

type TrackSearch = { id?: string; phone?: string };

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>): TrackSearch => ({
    ...(typeof search["id"] === "string" ? { id: search["id"] } : {}),
    ...(typeof search["phone"] === "string" ? { phone: search["phone"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Public Complaint Tracker — AI Smart Civic Services" },
      {
        name: "description",
        content:
          "Track any municipal complaint publicly by complaint ID or phone number — no account required.",
      },
      { property: "og:title", content: "Public Complaint Tracker — AI Smart Civic Services" },
      {
        property: "og:description",
        content: "Follow a civic complaint from submission to resolution, no login needed.",
      },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { id, phone } = Route.useSearch();
  const [mode, setMode] = useState<"id" | "phone">(phone ? "phone" : "id");
  const [query, setQuery] = useState(id ?? phone ?? "");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<Complaint | null>(null);

  const search = useCallback(async (kind: "id" | "phone", value: string) => {
    if (!value.trim()) return;
    setLoading(true);
    setNotFound(false);
    setError(null);
    setResults([]);
    try {
      const res = await api.track(
        kind === "id" ? { complaint_id: value.trim() } : { phone: value.trim() },
      );
      const list = Array.isArray(res) ? res : [res];
      setResults(list);
      setNotFound(list.length === 0);
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 404) setNotFound(true);
      else setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) search("id", id);
    else if (phone) search("phone", phone);
  }, [id, phone, search]);

  const single = results.length === 1 ? results[0] : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Public Complaint <span className="text-gradient">Tracker</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No login needed — track any complaint by its ID or the phone number used to file it.
        </p>
      </header>

      <div className="glass-card mx-auto mt-8 max-w-2xl rounded-2xl p-5">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "id" | "phone")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="id">Track by Complaint ID</TabsTrigger>
            <TabsTrigger value="phone">Track by Phone</TabsTrigger>
          </TabsList>
        </Tabs>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search(mode, query);
          }}
          className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === "id" ? "e.g. 104" : "e.g. 0300-1234567"}
            inputMode={mode === "id" ? "numeric" : "tel"}
          />
          <Button type="submit" className="gap-2" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Track
          </Button>
        </form>
      </div>

      {notFound && !loading && (
        <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-amber/40 bg-amber/10 p-5 text-center">
          <SearchX className="mx-auto h-6 w-6 text-amber" />
          <p className="mt-2 text-sm font-medium text-amber">
            No complaint found for that {mode === "id" ? "complaint ID" : "phone number"}.
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-center">
          <p className="text-sm font-medium">{error}</p>
          <Button variant="outline" className="mt-3" onClick={() => search(mode, query)}>
            Retry
          </Button>
        </div>
      )}

      {single && (
        <div className="glass-card mx-auto mt-8 max-w-2xl space-y-4 rounded-2xl p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <h2 className="min-w-0 text-lg font-extrabold">Complaint #{single.complaint_id}</h2>
            <StatusPill status={single.status} />
          </div>
          <div className="flex flex-wrap gap-2">
            <CategoryBadge category={single.category} />
            <PriorityBadge priority={single.priority} />
          </div>
          <ProgressTimeline complaint={single} />
          <p className="text-sm text-muted-foreground">{single.ai_summary || single.description}</p>
          <Button variant="outline" size="sm" onClick={() => setSelected(single)}>
            View full details
          </Button>
        </div>
      )}

      {results.length > 1 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((c) => (
            <ComplaintCard key={c.complaint_id} complaint={c} onView={setSelected} />
          ))}
        </div>
      )}

      <ComplaintDetailDialog complaint={selected} onOpenChange={() => setSelected(null)} />
    </div>
  );
}
