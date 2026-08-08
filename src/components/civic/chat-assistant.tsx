import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageSquare, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; text: string };

const SUGGESTIONS = [
  "How many water leakage complaints are open?",
  "What is the status of my complaint #2?",
  "Kaunsa department bijli ke tootay taar dekhta hai?",
];

export function ChatAssistant() {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Assalam-o-Alaikum! I'm your AI Civic Assistant. Ask me about complaint status, departments, or open issues — in English, Urdu, or Roman Urdu.",
    },
  ]);
  const [typing, setTyping] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  const send = async (question: string) => {
    if (!question.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    setTyping("");
    const idMatch = question.match(/#\s*(\d+)/);
    try {
      const res = await api.ask({
        question,
        ...(session.citizenPhone ? { phone: session.citizenPhone } : {}),
        ...(idMatch ? { complaint_id: Number(idMatch[1]) } : {}),
      });
      const answer = res.answer ?? "No answer returned.";
      // streaming-style reveal
      for (let i = 1; i <= answer.length; i += Math.max(1, Math.round(answer.length / 60))) {
        setTyping(answer.slice(0, i));
        await new Promise((r) => setTimeout(r, 12));
      }
      setTyping("");
      setMessages((m) => [...m, { role: "assistant", text: answer }]);
    } catch {
      setTyping("");
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "I couldn't reach the civic AI service. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen((o) => !o)}
        className="gradient-hero fixed right-5 bottom-5 z-50 h-14 w-14 rounded-full text-primary-foreground shadow-lg"
        aria-label="Open AI assistant"
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>

      {open && (
        <div className="glass-card animate-scale-in fixed right-4 bottom-24 z-50 flex h-[32rem] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl">
          <div className="gradient-hero flex items-center gap-2 px-4 py-3 text-primary-foreground">
            <Bot className="h-5 w-5" />
            <div className="min-w-0">
              <p className="text-sm font-bold">AI Civic Assistant</p>
              <p className="truncate text-[11px] opacity-90">English · اردو · Roman Urdu</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-background/60 p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-card-foreground",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl border border-border bg-card px-3 py-2 text-sm whitespace-pre-wrap">
                  {typing}
                </div>
              </div>
            )}
            {loading && !typing && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking...
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-border/60 bg-background/60 p-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border/60 bg-background/80 p-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about civic complaints..."
              className="h-10"
            />
            <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
