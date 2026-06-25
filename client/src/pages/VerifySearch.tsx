import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, ArrowLeft, Shield } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

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
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Back button */}
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-green-300 hover:text-white transition-colors mb-6 group"
          data-testid="button-back-home"
        >
          <div className="bg-white/10 group-hover:bg-white/20 rounded-full p-2 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium">ਮੁੱਖ ਪੰਨਾ</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-yellow-300" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Card ਤਸਦੀਕ ਕਰੋ</h1>
          <p className="text-green-300 text-sm">ਮੈਂਬਰਸ਼ਿਪ ID ਨੰਬਰ ਦਰਜ ਕਰੋ</p>
        </div>

        {/* Search Box */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-green-300" />
            <span className="text-white font-semibold text-sm">ID ਨੰਬਰ ਨਾਲ ਖੋਜੋ</span>
          </div>

          <input
            type="text"
            value={manualId}
            onChange={(e) => { setManualId(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="KSCPKB-XXXXXX"
            className="w-full bg-white/10 border border-white/20 text-white placeholder-green-600 font-mono rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 focus:bg-white/20 transition-all mb-3"
            data-testid="input-card-id"
          />

          {error && (
            <p className="text-red-300 text-xs mb-3">{error}</p>
          )}

          <button
            onClick={handleSearch}
            className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-green-950 font-bold py-3 rounded-xl transition-colors"
            data-testid="button-search-id"
          >
            <Search className="h-4 w-4" />
            ਖੋਜੋ
          </button>
        </div>

        <p className="text-center text-green-700 text-xs mt-6 opacity-60">
          Kisan Sangharsh Committee Punjab (Kot Budha)
        </p>
      </motion.div>
    </div>
  );
}
