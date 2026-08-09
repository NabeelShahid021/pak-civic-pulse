import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Building2,
  Camera,
  FileImage,
  Languages,
  Loader2,
  LocateFixed,
  MapPin,
  Phone,
  Play,
  Send,
  Sparkles,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, type Complaint } from "@/lib/api";
import { useSession } from "@/hooks/use-session";
import { useAuthDialog } from "@/components/civic/auth-dialog";
import { CategoryBadge, PriorityBadge } from "@/components/civic/badges";
import { ProgressTimeline } from "@/components/civic/complaint-detail";

// YouTube Demo Video ID
const DEMO_VIDEO_ID = "_HYrqOAjG74";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pak Civic Pulse — AI Civic Complaint Reporting" },
      {
        name: "description",
        content:
          "Pak Civic Pulse: Report civic complaints in English, Urdu or Roman Urdu with automated AI triage and municipal dispatch across Pakistani cities.",
      },
      { property: "og:title", content: "Pak Civic Pulse — AI Civic Complaint Reporting" },
      {
        property: "og:description",
        content:
          "Fast AI-powered civic complaint triage for Pakistani cities across WASA, TEPA, LESCO, and Waste Management.",
      },
    ],
  }),
  component: SubmitPage,
});

const CIVIC_PROBLEM_IMAGES = [
  {
    id: "road",
    title: "Damaged Roads & Potholes",
    urdu: "سڑکیں اور گڑھے",
    dept: "Roads Authority / TEPA",
    image: "/images/road.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80",
    preset: "Massive pothole on the road causing severe traffic hazard at ",
  },
  {
    id: "water",
    title: "Water Leaks & Sewerage",
    urdu: "پانی اور سیوریج کا مسئلہ",
    dept: "WASA",
    image: "/images/water.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1584467735815-f778f274e296?w=600&auto=format&fit=crop&q=80",
    preset: "Main water pipeline burst and gutter overflowing with dirty water at ",
  },
  {
    id: "waste",
    title: "Garbage & Waste Heaps",
    urdu: "کوڑا کرکٹ کے ڈھیر",
    dept: "Solid Waste Management (LWMC)",
    image: "/images/waste.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80",
    preset: "Overflowing garbage dump and uncollected waste creating health hazard at ",
  },
  {
    id: "electricity",
    title: "Streetlights & Power Lines",
    urdu: "اسٹریٹ لائٹس اور کھلے تار",
    dept: "Electricity Board (LESCO/K-Electric)",
    image: "/images/electricity.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=600&auto=format&fit=crop&q=80",
    preset: "Broken streetlights and dangling dangerous electrical wires near ",
  },
];

function SubmitPage() {
  const session = useSession();
  const { open } = useAuthDialog();
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Complaint | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (session.citizenPhone) setPhone((p) => p || session.citizenPhone!);
  }, [session.citizenPhone]);

  const selectProblemCard = (preset: string) => {
    setDescription(preset);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      toast.error("Image file size must be under 6MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageUrl(dataUrl);
      setFileName(file.name);
      toast.success("Photo attached!");
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setImageUrl("");
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const useGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported on this device.");
      return;
    }
    toast.info("Fetching GPS coordinates...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success("GPS location attached!");
      },
      () => toast.error("Could not fetch GPS. Please enter address manually."),
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session.citizenToken) {
      toast.error("Please sign in with your CNIC first.");
      open("citizen");
      return;
    }
    if (description.trim().length < 3) {
      toast.error("Please describe the issue.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await api.submitComplaint({
        description: description.trim(),
        ...(location ? { location } : {}),
        ...(phone ? { phone } : {}),
        ...(imageUrl ? { image_url: imageUrl } : {}),
        ...(coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
      });
      setResult(res);
      toast.success(`Complaint #${res.complaint_id} triaged and dispatched!`);
    } catch {
      /* handled */
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setDescription("");
    setLocation("");
    setImageUrl("");
    setFileName(null);
    setCoords(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
      {/* 2-Column Hero Section with Video Embed Slot */}
      <section className="grid items-center gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Left Column: Brand Hero Text */}
        <div className="space-y-3 text-left lg:col-span-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Pak Civic Pulse
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
            Report City Problems. <span className="text-gradient">Fast AI Triage.</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
            Submit municipal complaints in English, اردو, or Roman Urdu. AI automatically classifies urgency, clusters duplicates, and dispatches to WASA, TEPA, or LESCO.
          </p>
        </div>

        {/* Right Column: Responsive Video Embed Slot */}
        <div className="lg:col-span-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/80 bg-card shadow-md">
            {DEMO_VIDEO_ID && DEMO_VIDEO_ID !== "REPLACE_WITH_YOUTUBE_ID" ? (
              <iframe
                src={`https://www.youtube.com/embed/${DEMO_VIDEO_ID}?rel=0&modestbranding=1`}
                title="Pak Civic Pulse Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-secondary/40 via-card to-background">
                <div className="mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                  <Play className="h-6 w-6 fill-current translate-x-0.5" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-foreground">Platform Demo Video</p>
                <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground max-w-xs">
                  Watch how citizen complaints are triaged, clustered, and resolved in real-time.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Visual Problem Cards with Guaranteed Local & CDN Images */}
      {!result && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Common Civic Issues — Click to Report
            </h2>
            <span className="text-[11px] text-muted-foreground">Tap any card to auto-fill</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CIVIC_PROBLEM_IMAGES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectProblemCard(item.preset)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
              >
                <div className="relative h-28 w-full overflow-hidden bg-muted">
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={(e) => {
                      // Fallback to verified CDN if local path is not yet built
                      (e.target as HTMLImageElement).src = item.fallbackImage;
                    }}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white/90">
                    {item.dept}
                  </span>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-bold text-foreground leading-snug">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground font-urdu">{item.urdu}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Main Complaint Form & AI Result Grid */}
      <div className="grid gap-6 lg:grid-cols-5 items-start">
        {/* Form Card */}
        <form
          ref={formRef}
          onSubmit={submit}
          className="glass-card space-y-4 rounded-3xl p-5 sm:p-6 lg:col-span-3 shadow-sm border border-border/80"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-sm font-bold flex items-center gap-1.5">
                <Languages className="h-4 w-4 text-primary" /> Complaint Description
              </Label>
              <span className="text-[11px] text-muted-foreground">English · اردو · Roman Urdu</span>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe what's broken (e.g. 'Street 14 mein paani ki pipe leak ho rahi hai' / 'Broken road causing accidents')..."
              className="resize-none rounded-xl"
              required
            />
          </div>

          {/* Location & GPS */}
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" /> Location / Address
            </Label>
            <div className="flex gap-2">
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Street address, block, sector or landmark..."
                className="rounded-xl"
              />
              <Button
                type="button"
                variant="outline"
                onClick={useGps}
                className="gap-1.5 rounded-xl shrink-0 border-primary/30 text-primary hover:bg-primary/10"
              >
                <LocateFixed className="h-4 w-4" />
                <span>GPS</span>
              </Button>
            </div>
            {coords && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ GPS pinned: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </p>
            )}
          </div>

          {/* Phone & Photo Attachment */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary" /> Contact Mobile (optional)
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300-1234567"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-primary" /> Attach Photo Evidence
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="media-upload"
              />
              <label
                htmlFor="media-upload"
                className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/40 px-3 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:bg-secondary hover:text-foreground"
              >
                <Upload className="h-3.5 w-3.5 text-primary" />
                <span>{fileName ? "Change Photo" : "Upload Image File"}</span>
              </label>
            </div>
          </div>

          {/* Photo Preview Thumbnail */}
          {imageUrl && (
            <div className="relative flex items-center justify-between rounded-xl border border-border bg-card p-2">
              <div className="flex items-center gap-2 truncate text-xs font-medium">
                <img src={imageUrl} alt="preview" className="h-10 w-10 rounded-lg object-cover border" />
                <span className="truncate">{fileName || "Photo attached"}</span>
              </div>
              <button
                type="button"
                onClick={removePhoto}
                className="rounded-md p-1 text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <Button type="submit" className="w-full h-11 rounded-xl font-bold shadow-md gap-2" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {loading ? "AI Analyzing & Dispatching..." : "Submit Complaint"}
          </Button>

          {!session.citizenToken && (
            <p className="text-center text-xs text-muted-foreground">
              Sign in with your 13-digit Pakistani CNIC to submit and track all your complaints.
            </p>
          )}
        </form>

        {/* Right Column: AI Triage Result or System Overview Card */}
        <div className="lg:col-span-2 space-y-4">
          {loading && (
            <div className="glass-card animate-fade-in space-y-3 rounded-3xl p-6 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-bold">AI Triage in Progress</p>
              <p className="text-xs text-muted-foreground">
                Classifying category, estimating urgency, and dispatching to the responsible department...
              </p>
            </div>
          )}

          {result && !loading && <TriageCard complaint={result} onReset={reset} />}

          {!result && !loading && (
            <div className="glass-card rounded-3xl p-5 space-y-4 border border-border/80">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Zap className="h-4 w-4 text-amber-500" /> How The AI System Works
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 rounded-2xl bg-secondary/50 p-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                    1
                  </span>
                  <div>
                    <p className="font-bold text-foreground">Multilingual Input</p>
                    <p className="text-muted-foreground">Report issues in English, Urdu (اردو), or Roman Urdu.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-secondary/50 p-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                    2
                  </span>
                  <div>
                    <p className="font-bold text-foreground">Instant Triage & Dedup</p>
                    <p className="text-muted-foreground">AI scores urgency and boosts priority if multiple neighbors report.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-secondary/50 p-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                    3
                  </span>
                  <div>
                    <p className="font-bold text-foreground">Direct Department Dispatch</p>
                    <p className="text-muted-foreground">Automatically sent to WASA, TEPA, LESCO, or Waste Management.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TriageCard({ complaint, onReset }: { complaint: Complaint; onReset: () => void }) {
  return (
    <div className="glass-card animate-scale-in space-y-4 rounded-3xl p-6 border border-primary/20 shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-foreground">AI Triage Result</h2>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
          #{complaint.complaint_id}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <CategoryBadge category={complaint.category} />
        <PriorityBadge priority={complaint.priority} />
      </div>

      <div className="rounded-2xl border border-border bg-secondary/60 p-3 text-xs space-y-1">
        <p className="text-muted-foreground flex items-center gap-1.5 font-medium">
          <Building2 className="h-3.5 w-3.5 text-primary" /> Responsible Department
        </p>
        <p className="font-bold text-foreground text-sm">
          {complaint.assigned_department ?? "Assigned to Municipal Services"}
        </p>
      </div>

      {complaint.ai_summary && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-1">
          <p className="font-bold text-primary">Dispatch Summary</p>
          <p className="text-foreground">{complaint.ai_summary}</p>
        </div>
      )}

      {!!complaint.ai_keywords?.length && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-muted-foreground uppercase">Key Signals</p>
          <div className="flex flex-wrap gap-1.5">
            {complaint.ai_keywords.map((k) => (
              <span
                key={k}
                className="rounded-full border border-primary/20 bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-foreground"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {complaint.duplicate_of != null && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-semibold text-amber-600 dark:text-amber-400">
          ⚡ Clustered Issue: Matches report #{complaint.duplicate_of} in your area — priority escalated!
        </div>
      )}

      <ProgressTimeline complaint={complaint} />

      <div className="flex flex-wrap gap-2 pt-2">
        <Button asChild size="sm" className="rounded-xl font-semibold">
          <Link to="/my-complaints">My Complaints</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="rounded-xl">
          <Link to="/track" search={{ id: String(complaint.complaint_id) }}>
            Track Status
          </Link>
        </Button>
        <Button size="sm" variant="ghost" onClick={onReset} className="rounded-xl">
          Submit Another
        </Button>
      </div>
    </div>
  );
}
