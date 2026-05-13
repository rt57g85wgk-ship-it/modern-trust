import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Msg = { role: "user" | "ai"; text: string };

const seedReply = (q: string): string => {
  const t = q.toLowerCase();
  if (/hello|hi|hey/.test(t)) return "Hi there! 👋 I can help you find rentals, recommend rooms, or simulate a booking. What are you looking for?";
  if (/recommend|suggest/.test(t)) return "Based on popular picks: try The Line Ari (฿16,000) or Life Asoke Studio (฿17,500). Both have 4.8+ ratings and verified landlords.";
  if (/book|booking/.test(t)) return "To book: open any listing → choose your move-in date → tap Book Now. Booking confirmation is simulated in this demo.";
  if (/budget|price|cheap/.test(t)) return "We have great units from ฿14,500 (Park Origin Thonglor) up to ฿32,000 (Ideo Mobi 2BR). Use the budget filter on the home page.";
  if (/location|where|area/.test(t)) return "Popular areas: Ari, Asoke, Thonglor, Ekkamai, Phrom Phong. All BTS-accessible.";
  if (/safe|verified|trust/.test(t)) return "All landlords go through ID verification. Look for the blue ✓ verified badge on listings.";
  return "I'm a demo assistant — try asking about budget, location, recommendations, or booking flow!";
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Hi! I'm Trust AI ✨ Ask me anything about rentals, listings, or how booking works." },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTimeout(() => setMsgs((m) => [...m, { role: "ai", text: seedReply(q) }]), 600);
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow transition-transform hover:scale-105"
        aria-label="Open AI chat"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 22 }}
            className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card"
          >
            <div className="flex items-center justify-between border-b border-border bg-brand-gradient px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Trust AI</p>
                  <p className="text-[11px] text-white/70">Online · usually replies instantly</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-white/15"><X className="h-4 w-4" /></button>
            </div>
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask about rentals…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <Button size="icon" className="h-8 w-8" onClick={send}><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
