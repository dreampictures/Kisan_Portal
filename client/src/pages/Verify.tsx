import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Shield, ArrowLeft } from "lucide-react";

interface VerifyData {
  valid: boolean;
  expired: boolean;
  cardNumber: string;
  name: string;
  designation: string;
  village: string;
  tehsil: string;
  district: string;
  mobileNumber: string;
  aadhaarNumber: string;
  photoUrl?: string;
  validFrom: string;
  validUntil: string;
  message?: string;
}

export default function Verify() {
  const { cardNumber } = useParams<{ cardNumber: string }>();
  const [, setLocation] = useLocation();
  const [data, setData] = useState<VerifyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/verify/${cardNumber}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((d) => { if (d) setData(d); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [cardNumber]);

  const BackButton = () => (
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
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-green-200 text-sm">Card ਤਸਦੀਕ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...</p>
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-red-800 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm w-full">
          <BackButton />
          <div className="w-24 h-24 rounded-full bg-red-700/50 flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-14 w-14 text-red-300" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Card ਨਹੀਂ ਮਿਲਿਆ</h1>
          <p className="text-red-200 mb-2">ਇਹ Card Number ਸਾਡੇ ਰਿਕਾਰਡ ਵਿੱਚ ਨਹੀਂ ਹੈ।</p>
          <p className="text-sm text-red-400 font-mono bg-red-900/50 px-3 py-1.5 rounded-lg inline-block">{cardNumber}</p>
        </motion.div>
      </div>
    );
  }

  const isValid = data.valid;
  const isExpired = data.expired;

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 flex items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm">

        <BackButton />

        {/* Status badge */}
        <div className="flex justify-center mb-5">
          {isValid ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
              className="flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-full shadow-lg shadow-green-500/30 font-bold text-sm">
              <CheckCircle2 className="h-5 w-5" /> VERIFIED — ਵੈਧ CARD
            </motion.div>
          ) : isExpired ? (
            <div className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-full font-bold text-sm">
              <AlertTriangle className="h-5 w-5" /> EXPIRED — ਮਿਆਦ ਪੁੱਗੀ
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-red-500 text-white px-5 py-2 rounded-full font-bold text-sm">
              <XCircle className="h-5 w-5" /> NOT ACTIVE
            </div>
          )}
        </div>

        {/* ID CARD */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
          className="rounded-2xl overflow-hidden shadow-2xl shadow-black/50">

          {/* Card Top — Green Header */}
          <div className="bg-gradient-to-r from-green-800 to-green-700 px-5 py-4 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
            <div className="flex items-center gap-3 relative">
              <div className="bg-white/15 rounded-full p-2">
                <Shield className="h-7 w-7 text-yellow-300" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ ( ਕੋਟ ਬੁੱਢਾ)</p>
                <p className="text-green-300 text-xs">ਮੈਂਬਰਸ਼ਿਪ ਕਾਰਡ</p>
              </div>
            </div>
            <div className="mt-3 border-t border-white/20 pt-2">
              <p className="text-yellow-300 text-xs font-mono tracking-widest font-semibold">{data.cardNumber}</p>
            </div>
          </div>

          {/* Card Body — White */}
          <div className="bg-white">
            <div className="flex items-stretch">
              <div className="bg-green-50 p-4 flex items-center justify-center border-r border-green-100" style={{ minWidth: "110px" }}>
                {data.photoUrl ? (
                  <img src={data.photoUrl} alt={data.name}
                    className="w-24 h-28 object-cover rounded-xl shadow-md border-2 border-green-200" />
                ) : (
                  <div className="w-24 h-28 rounded-xl bg-green-200 flex items-center justify-center text-4xl font-bold text-green-700 border-2 border-green-300">
                    {data.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 p-4 space-y-2">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">ਨਾਮ / Name</p>
                  <p className="text-lg font-bold text-gray-900 leading-tight">{data.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">ਅਹੁਦਾ / Designation</p>
                  <p className="text-sm font-semibold text-green-700">{data.designation}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">ਪਤਾ / Address</p>
                  <p className="text-sm text-gray-700 leading-tight">{data.village}, {data.tehsil}</p>
                  <p className="text-sm text-gray-700">{data.district}</p>
                </div>
                {data.mobileNumber && data.mobileNumber !== "*" && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">ਮੋਬਾਈਲ</p>
                    <p className="text-sm font-mono text-gray-800">{data.mobileNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Validity Bar */}
            <div className={`px-4 py-3 border-t flex items-center justify-between gap-2 ${
              isValid ? "bg-green-50 border-green-100" : isExpired ? "bg-orange-50 border-orange-100" : "bg-red-50 border-red-100"
            }`}>
              <div className="text-xs text-gray-500">
                <span className="block font-semibold text-gray-700">Valid Period</span>
                <span className="font-mono">{fmtDate(data.validFrom)} → {fmtDate(data.validUntil)}</span>
              </div>
              <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                isValid ? "bg-green-200 text-green-800" : isExpired ? "bg-orange-200 text-orange-800" : "bg-red-200 text-red-800"
              }`}>
                {isValid ? "✓ VALID" : isExpired ? "EXPIRED" : "INACTIVE"}
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-gray-900 px-4 py-3 text-center">
            <p className="text-gray-400 text-xs">Kisan Sangharsh Committee Punjab (Kot Budha)</p>
            <p className="text-gray-600 text-xs font-mono mt-0.5">kisan-union-punjab.fly.dev</p>
          </div>
        </motion.div>

        {/* Aadhaar (masked) below card */}
        {data.aadhaarNumber && data.aadhaarNumber !== "*" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mt-4 bg-white/10 backdrop-blur rounded-xl px-4 py-3 text-center">
            <p className="text-green-300 text-xs mb-1">ਆਧਾਰ ਨੰਬਰ (Masked)</p>
            <p className="text-white font-mono font-bold tracking-widest">{data.aadhaarNumber}</p>
          </motion.div>
        )}

        <p className="text-center text-green-700 text-xs mt-5 opacity-60">
          Verified by KSCPKB Digital System
        </p>
      </motion.div>
    </div>
  );
}
