import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, QrCode, ArrowLeft, Loader2, Shield } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function VerifySearch() {
  const [, setLocation] = useLocation();
  const [manualId, setManualId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [cameraError, setCameraError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const divId = "qr-reader";

  const goToCard = (cardNumber: string) => {
    const cn = cardNumber.trim().toUpperCase();
    if (cn) setLocation(`/verify/${cn}`);
  };

  const startScanner = async () => {
    setScanError("");
    setCameraError("");
    setScanning(true);
    try {
      const scanner = new Html5Qrcode(divId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          const url = decodedText.trim();
          const match = url.match(/\/verify\/([A-Z0-9-]+)/i);
          const cardNum = match ? match[1] : url;
          stopScanner();
          goToCard(cardNum);
        },
        () => {}
      );
    } catch (err: any) {
      setCameraError("ਕੈਮਰਾ ਖੋਲ੍ਹਣ ਵਿੱਚ ਦਿੱਕਤ ਆਈ। ਕਿਰਪਾ ਕੈਮਰਾ permission ਦਿਓ।");
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleManualSearch = () => {
    if (!manualId.trim()) { setScanError("ਕਿਰਪਾ ID ਨੰਬਰ ਦਰਜ ਕਰੋ"); return; }
    goToCard(manualId);
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
          <p className="text-green-300 text-sm">QR ਸਕੈਨ ਕਰੋ ਜਾਂ ID ਨੰਬਰ ਦਰਜ ਕਰੋ</p>
        </div>

        {/* QR Scanner Section */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="h-5 w-5 text-green-300" />
            <span className="text-white font-semibold text-sm">QR Code ਸਕੈਨ ਕਰੋ</span>
          </div>

          {/* QR reader div — always in DOM when scanning */}
          <div
            id={divId}
            className={`rounded-xl overflow-hidden ${scanning ? "block" : "hidden"}`}
            style={{ width: "100%" }}
          />

          {!scanning && (
            <div className="bg-black/20 rounded-xl h-44 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-green-700/50">
              <QrCode className="h-12 w-12 text-green-600" />
              <p className="text-green-400 text-sm text-center">ਕੈਮਰਾ ਚਾਲੂ ਕਰਨ ਲਈ ਹੇਠਾਂ<br/>ਬਟਨ ਦਬਾਓ</p>
            </div>
          )}

          {cameraError && (
            <p className="text-red-300 text-xs mt-2 text-center">{cameraError}</p>
          )}

          <div className="mt-3 flex gap-2">
            {!scanning ? (
              <button
                onClick={startScanner}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition-colors"
                data-testid="button-start-scan"
              >
                <QrCode className="h-4 w-4" />
                ਸਕੈਨ ਸ਼ੁਰੂ ਕਰੋ
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-colors"
                data-testid="button-stop-scan"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                ਬੰਦ ਕਰੋ
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-green-400 text-xs font-medium">ਜਾਂ</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        {/* Manual Search */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-green-300" />
            <span className="text-white font-semibold text-sm">ID ਨੰਬਰ ਨਾਲ ਖੋਜੋ</span>
          </div>

          <input
            type="text"
            value={manualId}
            onChange={(e) => { setManualId(e.target.value.toUpperCase()); setScanError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
            placeholder="KSCPKB-XXXXXX"
            className="w-full bg-white/10 border border-white/20 text-white placeholder-green-600 font-mono rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 focus:bg-white/20 transition-all mb-3"
            data-testid="input-card-id"
          />

          {scanError && (
            <p className="text-red-300 text-xs mb-3">{scanError}</p>
          )}

          <button
            onClick={handleManualSearch}
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
