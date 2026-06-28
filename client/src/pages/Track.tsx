import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, CheckCircle2, Clock, XCircle, CreditCard, AlertCircle, ArrowRight } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

const STAGES = [
  { key: "submitted", label: "ਅਰਜ਼ੀ ਜਮ੍ਹਾ", sub: "Application Submitted" },
  { key: "state_president_review", label: "ਮੀਤ ਪ੍ਰਧਾਨ ਦੀ ਸਮੀਖਿਆ", sub: "Meet President Review" },
  { key: "admin_review", label: "ਸੂਬਾ ਪ੍ਰਧਾਨ ਦੀ ਸਮੀਖਿਆ", sub: "State President Review" },
  { key: "approved", label: "ਐਡਮਿਨ ਅਪ੍ਰੂਵਡ", sub: "Admin Approved" },
  { key: "card_issued", label: "ਕਾਰਡ ਜਾਰੀ", sub: "Card Issued" },
];

function stageIndex(stage: string | null): number {
  if (!stage) return 0;
  const idx = STAGES.findIndex(s => s.key === stage);
  return idx >= 0 ? idx : 0;
}

function stageProgress(stage: string | null, status: string): number {
  if (status === "rejected") return 0;
  if (!stage) return 5;
  const idx = stageIndex(stage);
  return Math.round(((idx + 1) / STAGES.length) * 100);
}

function StageDot({ stage, current, status }: { stage: typeof STAGES[0]; current: string | null; status: string }) {
  const isRejected = status === "rejected";
  const currentIdx = stageIndex(current);
  const myIdx = STAGES.findIndex(s => s.key === stage.key);
  const isDone = !isRejected && currentIdx > myIdx;
  const isCurrent = !isRejected && currentIdx === myIdx;

  if (isDone) return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
        <CheckCircle2 className="h-5 w-5 text-white" />
      </div>
      <p className="text-xs font-medium text-green-700 text-center leading-tight px-1">{stage.label}</p>
    </div>
  );
  if (isCurrent) return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center shadow-sm animate-pulse">
        <Clock className="h-5 w-5 text-white" />
      </div>
      <p className="text-xs font-semibold text-amber-700 text-center leading-tight px-1">{stage.label}</p>
    </div>
  );
  return (
    <div className="flex flex-col items-center gap-1 flex-1 opacity-40">
      <div className="w-9 h-9 rounded-full bg-muted border-2 border-border flex items-center justify-center">
        <span className="text-xs font-bold text-muted-foreground">{STAGES.findIndex(s => s.key === stage.key) + 1}</span>
      </div>
      <p className="text-xs text-muted-foreground text-center leading-tight px-1">{stage.label}</p>
    </div>
  );
}

function TrackResult({ reg }: { reg: any }) {
  const isRejected = reg.status === "rejected";
  const progress = stageProgress(reg.currentStage, reg.status);

  const stageLabel: Record<string, string> = {
    submitted: "ਅਰਜ਼ੀ ਜਮ੍ਹਾ ਹੋਈ",
    state_president_review: "ਮੀਤ ਪ੍ਰਧਾਨ ਕੋਲ ਸਮੀਖਿਆ ਅਧੀਨ",
    admin_review: "ਸੂਬਾ ਪ੍ਰਧਾਨ ਕੋਲ ਸਮੀਖਿਆ ਅਧੀਨ",
    approved: "ਐਡਮਿਨ ਵੱਲੋਂ ਅਪ੍ਰੂਵਡ – ਕਾਰਡ ਤਿਆਰ ਹੋ ਰਿਹਾ",
    card_issued: "✅ ਮੈਂਬਰਸ਼ਿਪ ਕਾਰਡ ਜਾਰੀ ਹੋ ਗਿਆ!",
    rejected: "❌ ਅਰਜ਼ੀ ਰੱਦ ਕੀਤੀ ਗਈ",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`overflow-hidden ${isRejected ? "border-red-200" : "border-green-200"}`}>
        <CardHeader className={`py-4 ${isRejected ? "bg-red-50" : "bg-green-50"}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">{reg.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{reg.village}, {reg.district}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-mono text-muted-foreground">{reg.trackingId}</p>
              {reg.cardNumber && (
                <p className="text-xs font-mono font-bold text-green-700 flex items-center gap-1 justify-end">
                  <CreditCard className="h-3 w-3" />{reg.cardNumber}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-5 pb-4 space-y-5">
          {isRejected ? (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700">ਅਰਜ਼ੀ ਰੱਦ ਕੀਤੀ ਗਈ</p>
                {reg.rejectedReason && <p className="text-sm text-red-600 mt-0.5">ਕਾਰਨ: {reg.rejectedReason}</p>}
                {reg.rejectedAt && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {new Date(reg.rejectedAt).toLocaleDateString("pa-IN", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{stageLabel[reg.currentStage] || reg.currentStage}</p>
                  <span className="text-xs font-bold text-primary">{progress}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="flex items-start justify-between gap-1">
                {STAGES.map((stage, i) => (
                  <div key={stage.key} className="flex items-center flex-1">
                    <StageDot stage={stage} current={reg.currentStage} status={reg.status} />
                    {i < STAGES.length - 1 && (
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 -mt-5" />
                    )}
                  </div>
                ))}
              </div>

              {reg.currentStage === "card_issued" && reg.validFrom && reg.validUntil && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-green-800 mb-1">🎉 ਮੈਂਬਰਸ਼ਿਪ ਕਾਰਡ ਤਿਆਰ ਹੈ!</p>
                  <p className="text-green-700 font-mono text-xs">Card: {reg.cardNumber}</p>
                  <p className="text-green-600 text-xs mt-1">
                    Valid: {new Date(reg.validFrom).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} →{" "}
                    {new Date(reg.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground pt-1 border-t border-border">
            {reg.submittedAt && (
              <div><p className="font-medium text-foreground">ਜਮ੍ਹਾ</p>
                <p>{new Date(reg.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</p></div>
            )}
            {reg.meetPresidentAt && (
              <div><p className="font-medium text-foreground">ਮੀਤ ਪ੍ਰਧਾਨ</p>
                <p className={reg.meetPresidentStatus === "approved" ? "text-green-600" : "text-red-500"}>
                  {reg.meetPresidentStatus === "approved" ? "✓ ਅਪ੍ਰੂਵਡ" : "✗ ਰੱਦ"}
                </p></div>
            )}
            {reg.statePresidentAt && (
              <div><p className="font-medium text-foreground">ਸੂਬਾ ਪ੍ਰਧਾਨ</p>
                <p className={reg.statePresidentStatus === "approved" ? "text-green-600" : "text-red-500"}>
                  {reg.statePresidentStatus === "approved" ? "✓ ਅਪ੍ਰੂਵਡ" : "✗ ਰੱਦ"}
                </p></div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Track() {
  useSEO({
    title: "ਅਰਜ਼ੀ ਟਰੈਕ ਕਰੋ - Track Kisan Union Punjab Application | KMSC Status",
    description: "Track your Kisan Mazdoor Sangharsh Committee Punjab membership application status. Check your Kisan Union Punjab ID card registration progress by tracking ID or mobile number.",
    keywords: "track kisan application, KMSC application status, Kisan Union Punjab card status, kisan card track Punjab, ਕਿਸਾਨ ਅਰਜ਼ੀ ਟਰੈਕ",
    canonical: "https://kscpkotbudha.org/track",
  });
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState<{ type: "trackingId" | "mobile"; value: string } | null>(null);

  const { data, isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/track", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const param = searchQuery.type === "trackingId"
        ? `trackingId=${encodeURIComponent(searchQuery.value)}`
        : `mobile=${encodeURIComponent(searchQuery.value)}`;
      const res = await fetch(`/api/track?${param}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "ਕੋਈ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    enabled: !!searchQuery,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    if (val.toUpperCase().startsWith("TRK-") || /^\d{6}$/.test(val)) {
      const id = val.toUpperCase().startsWith("TRK-") ? val.toUpperCase() : `TRK-${val}`;
      setSearchQuery({ type: "trackingId", value: id });
    } else if (/^\d{10}$/.test(val)) {
      setSearchQuery({ type: "mobile", value: val });
    } else {
      setSearchQuery({ type: "trackingId", value: val.toUpperCase().startsWith("TRK-") ? val.toUpperCase() : `TRK-${val.replace(/\D/g, "")}` });
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-3 text-foreground">ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਟਰੈਕ ਕਰੋ</h1>
          <p className="text-muted-foreground">ਆਪਣੀ Tracking ID ਜਾਂ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ</p>
        </div>

        <Card className="shadow-lg mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="TRK-XXXXXX ਜਾਂ ਮੋਬਾਈਲ ਨੰਬਰ (10 ਅੰਕ)"
                className="h-12 text-base font-mono"
                data-testid="input-track-search"
              />
              <Button type="submit" disabled={isLoading || !input.trim()} className="h-12 px-6" data-testid="button-track-search">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </Button>
            </form>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-muted-foreground">ਉਦਾਹਰਣ:</span>
              <button onClick={() => setInput("TRK-847291")} className="text-xs text-primary hover:underline font-mono">TRK-847291</button>
              <span className="text-xs text-muted-foreground">ਜਾਂ ਮੋਬਾਈਲ</span>
              <button onClick={() => setInput("9876543210")} className="text-xs text-primary hover:underline font-mono">9876543210</button>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="flex items-center gap-3 py-6">
                <AlertCircle className="h-8 w-8 text-amber-500 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800">ਕੋਈ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ</p>
                  <p className="text-sm text-amber-700">Tracking ID ਜਾਂ ਮੋਬਾਈਲ ਨੰਬਰ ਦੁਬਾਰਾ ਚੈੱਕ ਕਰੋ।</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {data && data.length > 0 && !isLoading && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-medium">{data.length} ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਮਿਲੀ</p>
            {data.map((reg) => <TrackResult key={reg.id} reg={reg} />)}
          </div>
        )}

        {!searchQuery && (
          <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-primary/8 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-7 w-7 text-primary/40" />
            </div>
            <h3 className="font-bold text-foreground mb-1">ਆਪਣੀ Tracking ID ਦਾਖਲ ਕਰੋ</h3>
            <p className="text-sm text-foreground/55">ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਜਮ੍ਹਾ ਕਰਨ ਤੋਂ ਬਾਅਦ ਤੁਹਾਨੂੰ ਇੱਕ TRK-XXXXXX ਨੰਬਰ ਮਿਲਿਆ ਸੀ।</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
