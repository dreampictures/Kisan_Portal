import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, Shield } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";

export default function VerifySearch() {
  useSEO({
    title: "ਕਾਰਡ ਤਸਦੀਕ ਕਰੋ - Verify Kisan Union Punjab Membership Card | KMSC",
    description: "Verify the authenticity of Kisan Mazdoor Sangharsh Committee Punjab (Kot Budha) membership ID cards. Check if a Kisan Union Punjab member card is genuine.",
    keywords: "verify kisan card Punjab, KMSC card verify, Kisan Union Punjab ID verification, Kot Budha kisan card check",
    canonical: "https://kscpkotbudha.org/verify",
  });
  const [, setLocation] = useLocation();
  const [manualId, setManualId] = useState("");
  const [error, setError] = useState("");

  const handleSearch = () => {
    const cn = manualId.trim().toUpperCase();
    if (!cn) { setError("ਕਿਰਪਾ ID ਨੰਬਰ ਦਰਜ ਕਰੋ"); return; }
    setLocation(`/verify/${cn}`);
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Card ਤਸਦੀਕ ਕਰੋ</h1>
          <p className="text-muted-foreground text-sm">ਮੈਂਬਰਸ਼ਿਪ ID ਨੰਬਰ ਦਰਜ ਕਰੋ</p>
        </div>

        {/* Search Box */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-primary" />
            <span className="text-foreground font-semibold text-sm">ID ਨੰਬਰ ਨਾਲ ਖੋਜੋ</span>
          </div>

          <input
            type="text"
            value={manualId}
            onChange={(e) => { setManualId(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="KSCPKB-XXXXXX"
            className="w-full border border-input bg-background text-foreground placeholder-muted-foreground font-mono rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all mb-3"
            data-testid="input-card-id"
          />

          {error && (
            <p className="text-destructive text-xs mb-3">{error}</p>
          )}

          <Button
            onClick={handleSearch}
            className="w-full"
            data-testid="button-search-id"
          >
            <Search className="h-4 w-4 mr-2" />
            ਖੋਜੋ
          </Button>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-6">
          Kisan Sangharsh Committee Punjab (Kot Budha)
        </p>
      </motion.div>
    </div>
  );
}
