import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Loader2, ShieldCheck, Calendar, User, MapPin, Phone, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <Loader2 className="h-10 w-10 animate-spin text-green-700" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
          <XCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-700 mb-2">Card ਨਹੀਂ ਮਿਲਿਆ</h1>
          <p className="text-red-600">ਇਹ Card Number ਸਾਡੇ ਰਿਕਾਰਡ ਵਿੱਚ ਨਹੀਂ ਹੈ।</p>
          <p className="text-sm text-gray-500 mt-2 font-mono">{cardNumber}</p>
        </motion.div>
      </div>
    );
  }

  const isValid = data.valid;
  const isExpired = data.expired;

  const bgClass = isValid
    ? "from-green-50 to-emerald-50"
    : isExpired
    ? "from-orange-50 to-amber-50"
    : "from-red-50 to-rose-50";

  const statusColor = isValid ? "text-green-700" : isExpired ? "text-orange-600" : "text-red-600";
  const borderColor = isValid ? "border-green-400" : isExpired ? "border-orange-400" : "border-red-400";
  const badgeBg = isValid ? "bg-green-100 text-green-800" : isExpired ? "bg-orange-100 text-orange-800" : "bg-red-100 text-red-800";

  const StatusIcon = isValid ? CheckCircle2 : isExpired ? AlertTriangle : XCircle;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgClass} px-4 py-10`}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto space-y-4">

        {/* Header */}
        <div className="text-center mb-6">
          <ShieldCheck className="h-10 w-10 text-green-700 mx-auto mb-2" />
          <p className="text-sm text-gray-600">ਕਿਸਾਨ ਮਜ਼ਦੂਰ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ</p>
          <p className="text-xs text-gray-400 font-mono mt-1">Card Verification System</p>
        </div>

        {/* Status Banner */}
        <div className={`rounded-2xl border-2 ${borderColor} p-5 text-center bg-white/80 backdrop-blur-sm shadow-lg`}>
          <StatusIcon className={`h-16 w-16 mx-auto mb-3 ${statusColor}`} />
          <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${badgeBg} mb-2`}>
            {isValid ? "✓ VALID CARD" : isExpired ? "⚠ EXPIRED" : "✗ NOT ACTIVE"}
          </div>
          <h2 className={`text-xl font-bold ${statusColor}`}>
            {isValid ? "ਇਹ Card ਵੈਧ ਹੈ" : isExpired ? "ਇਹ Card Expire ਹੋ ਗਿਆ ਹੈ" : "ਇਹ Card ਅਜੇ Active ਨਹੀਂ ਹੈ"}
          </h2>
        </div>

        {/* Member Details */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-green-700 text-white py-4 px-5">
            <div className="flex items-center gap-4">
              {data.photoUrl ? (
                <img src={data.photoUrl} alt={data.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/50" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
                  {data.name[0]}
                </div>
              )}
              <div>
                <p className="text-lg font-bold">{data.name}</p>
                <p className="text-green-200 text-sm">{data.designation}</p>
                <p className="text-green-300 text-xs font-mono mt-0.5">{data.cardNumber}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="ਪਤਾ" value={`${data.village}, ${data.tehsil}, ${data.district}`} />
            <InfoRow icon={<Phone className="h-4 w-4" />} label="ਮੋਬਾਈਲ" value={data.mobileNumber} />
            <InfoRow icon={<CreditCard className="h-4 w-4" />} label="ਆਧਾਰ" value={data.aadhaarNumber} />
            <div className="border-t pt-3 mt-3">
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="Valid From"
                value={data.validFrom ? new Date(data.validFrom).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
              />
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="Valid Until"
                value={data.validUntil ? new Date(data.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
                className={isExpired ? "text-red-600 font-semibold" : ""}
              />
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 pb-4">
          Verified by Kisan Mazdoor Sangharsh Committee Punjab
        </p>
      </motion.div>
    </div>
  );
}

function InfoRow({ icon, label, value, className = "" }: { icon: React.ReactNode; label: string; value: string; className?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-green-600 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-sm font-medium text-gray-800 break-words ${className}`}>{value}</p>
      </div>
    </div>
  );
}
