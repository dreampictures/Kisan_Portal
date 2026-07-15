import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth, type StaffRole } from "@/hooks/use-auth";
import { useRegistrations, useDownloadRegistrations } from "@/hooks/use-registration";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Download, Trash2, Loader2, LogOut, Users, ShieldCheck,
  Eye, EyeOff, Lock, QrCode, CheckCircle, Calendar, AlertTriangle,
  MapPin, Phone, CreditCard, UserPlus, Newspaper, Plus, X,
  Clock, ThumbsUp, ThumbsDown, BarChart2, Globe, TrendingUp,
  Pencil, KeyRound, FileText, UserCog, Bell, ChevronRight,
  AlertCircle, CheckCheck, Camera, CheckCircle2, LayoutGrid, List, KeySquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import type { Registration, Update, DeleteRequest } from "@shared/schema";
import { PUNJAB_DISTRICTS } from "@/lib/punjab-data";
import { downloadCard, downloadCalibrationCard, type CardFieldConfig, DEFAULT_CARD_CONFIG } from "@/lib/cardGenerator";
import { CardVisualEditor } from "@/components/CardVisualEditor";

const selectCls = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

// ─── Helpers ────────────────────────────────────────────────
function stageBadge(stage: string | null) {
  const map: Record<string, { label: string; cls: string }> = {
    submitted: { label: "ਅਰਜ਼ੀ ਜਮ੍ਹਾ", cls: "bg-blue-100 text-blue-700" },
    state_president_review: { label: "ਮੀਤ ਪ੍ਰਧਾਨ ਕੋਲ", cls: "bg-purple-100 text-purple-700" },
    admin_review: { label: "ਸੂਬਾ ਪ੍ਰਧਾਨ ਕੋਲ", cls: "bg-orange-100 text-orange-700" },
    approved: { label: "ਅਪ੍ਰੂਵਡ", cls: "bg-green-100 text-green-700" },
    card_issued: { label: "ਕਾਰਡ ਜਾਰੀ", cls: "bg-green-100 text-green-700" },
    rejected: { label: "ਰੱਦ ਕੀਤਾ", cls: "bg-red-100 text-red-700" },
  };
  const info = map[stage || "submitted"] || { label: stage || "Unknown", cls: "bg-muted text-muted-foreground" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${info.cls}`}>{info.label}</span>;
}

// ─── Login Form ─────────────────────────────────────────────
function LoginForm() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ username, password }, {
      onError: () => toast({ title: "ਲੌਗਇਨ ਫੇਲ੍ਹ", description: "ਗਲਤ ਯੂਜ਼ਰਨੇਮ ਜਾਂ ਪਾਸਵਰਡ", variant: "destructive" }),
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Site Navbar */}
      <Navbar />

      {/* Hero Section with blurred farmer field background */}
      <section className="relative flex-grow flex items-center justify-center overflow-hidden py-16 px-4">
        {/* Blurred background image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(6px) brightness(0.55)",
            transform: "scale(1.05)",
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/60 via-primary/30 to-background/80" />

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Left: Hero text (home page style) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden md:flex flex-col gap-5 text-white max-w-sm"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white font-semibold text-sm tracking-wide w-fit">
              ਕਿਸਾਨਾਂ ਦੀ ਆਵਾਜ਼
            </span>
            <h1 className="text-4xl font-display font-bold leading-tight drop-shadow-lg">
              ਕਿਸਾਨ ਸੰਘਰਸ਼<br />
              <span className="text-white/90">ਕਮੇਟੀ ਪੰਜਾਬ</span>
            </h1>
            <p className="text-white/80 text-base leading-relaxed">
              ਕਿਸਾਨਾਂ ਨੂੰ ਇਕਜੁੱਟ ਕਰਨਾ ਤਾਂ ਜੋ ਸਾਡੇ ਹੱਕਾਂ,<br />
              ਜ਼ਮੀਨਾਂ ਅਤੇ ਭਵਿੱਖ ਦੀ ਰਾਖੀ ਕੀਤੀ ਜਾ ਸਕੇ।
            </p>
            <div className="flex gap-3 pt-2">
              <Link href="/contact">
                <Button size="sm" className="rounded-full bg-white text-primary hover:bg-white/90 font-semibold shadow-lg">
                  ਮੈਂਬਰ ਬਣੋ
                </Button>
              </Link>
              <Link href="/about">
                <Button size="sm" variant="outline" className="rounded-full border-white/60 text-white hover:bg-white/10 backdrop-blur">
                  ਹੋਰ ਜਾਣੋ
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right: Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm"
          >
            <Card className="shadow-2xl border-white/20 bg-white/95 backdrop-blur-md">
              <CardHeader className="text-center space-y-3 pb-4">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-display text-foreground">ਸਟਾਫ਼ ਲੌਗਇਨ</CardTitle>
                <p className="text-sm text-muted-foreground">ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">ਯੂਜ਼ਰਨੇਮ</Label>
                    <Input id="username" type="text" value={username} autoComplete="username"
                      onChange={(e) => setUsername(e.target.value)} placeholder="ਯੂਜ਼ਰਨੇਮ"
                      required data-testid="input-username" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">ਪਾਸਵਰਡ</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} value={password}
                        onChange={(e) => setPassword(e.target.value)} placeholder="ਪਾਸਵਰਡ"
                        required data-testid="input-password" className="pr-10" autoComplete="current-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" tabIndex={-1}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {loginError && (
                    <p className="text-sm text-destructive text-center">ਗਲਤ ਯੂਜ਼ਰਨੇਮ ਜਾਂ ਪਾਸਵਰਡ</p>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoggingIn} data-testid="button-login">
                    {isLoggingIn ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />ਲੌਗਇਨ...</> : "ਲੌਗਇਨ ਕਰੋ"}
                  </Button>
                </form>

              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features strip (home page style) */}
      <section className="py-12 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: Users, title: "ਏਕਤਾ ਵਿੱਚ ਬਲ", desc: "ਹਰ ਜ਼ਿਲ੍ਹੇ ਦੇ ਕਿਸਾਨਾਂ ਨੂੰ ਇਕੱਠੇ ਕਰਕੇ ਮਜ਼ਬੂਤ ਸਮੂਹਿਕ ਆਵਾਜ਼।" },
              { icon: ShieldCheck, title: "ਹੱਕਾਂ ਦੀ ਰਾਖੀ", desc: "ਜ਼ਮੀਨੀ ਹੱਕਾਂ ਅਤੇ ਫਸਲਾਂ ਦੇ ਉਚਿਤ ਭਾਅ ਲਈ ਸੰਘਰਸ਼।" },
              { icon: CreditCard, title: "ਸਰਕਾਰੀ ਪਛਾਣ", desc: "ਡਿਜੀਟਲ ਪੋਰਟਲ ਰਾਹੀਂ ਮੈਂਬਰਸ਼ਿਪ ਪਛਾਣ ਪੱਤਰ ਪ੍ਰਾਪਤ ਕਰੋ।" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl bg-white border border-border shadow-sm hover:border-primary/40 transition-colors group">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-base font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quote banner (home page style) */}
      <section className="py-14 bg-primary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-3 drop-shadow">
            "ਕਿਸਾਨ ਜਗਾਓ ਦੇਸ਼ ਬਚਾਓ"
          </h2>
          <p className="text-base opacity-85 max-w-xl mx-auto">
            ਦੇਸ਼ ਨੂੰ ਬਚਾਉਣ ਲਈ ਕਿਸਾਨ ਨੂੰ ਜਗਾਓ। ਸਾਡਾ ਸੰਘਰਸ਼ ਪੂਰੇ ਦੇਸ਼ ਦੀ ਅੰਨ ਸੁਰੱਖਿਆ ਲਈ ਹੈ।
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// ─── PIN Form ────────────────────────────────────────────────
function PinForm() {
  const { verifyPin, isVerifyingPin, pinError, logout } = useAuth();
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;
    verifyPin(pin, {
      onError: () => toast({ title: "ਗਲਤ PIN", description: "4 ਅੰਕਾਂ ਦਾ PIN ਦੁਬਾਰਾ ਦਾਖਲ ਕਰੋ", variant: "destructive" }),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-3 pb-4">
            <div className="mx-auto bg-amber-100 p-4 rounded-full w-fit"><KeyRound className="h-8 w-8 text-amber-600" /></div>
            <CardTitle className="text-2xl font-display">ਸੁਰੱਖਿਆ PIN</CardTitle>
            <p className="text-sm text-muted-foreground">4 ਅੰਕਾਂ ਦਾ PIN ਦਾਖਲ ਕਰੋ</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <div className="relative">
                  <Input id="pin" type={showPin ? "text" : "password"} inputMode="numeric" maxLength={4}
                    value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="••••" required data-testid="input-pin"
                    className="pr-10 text-center text-2xl tracking-[0.5em] font-mono" autoFocus />
                  <button type="button" onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" tabIndex={-1}>
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {pinError && <p className="text-sm text-destructive text-center">ਗਲਤ PIN — ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ</p>}
              <Button type="submit" className="w-full" disabled={isVerifyingPin || pin.length !== 4} data-testid="button-verify-pin">
                {isVerifyingPin ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />ਚੈੱਕ ਕਰ ਰਿਹਾ...</> : "PIN ਦਾਖਲ ਕਰੋ"}
              </Button>
              <Button type="button" variant="ghost" className="w-full text-muted-foreground text-xs" onClick={() => logout()}>
                ਵਾਪਸ ਜਾਓ
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ─── QR Panel ───────────────────────────────────────────────
function QRPanel({ qrDataUrl, reg }: { qrDataUrl: string; reg: Registration }) {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = () => {
    const win = window.open("", "_blank", "width=400,height=500");
    if (!win || !printRef.current) return;
    win.document.write(`<html><head><title>QR — ${reg.name}</title>
      <style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff;font-family:sans-serif;}
      .wrap{text-align:center;padding:24px;}.qr{width:200px;height:200px;display:block;margin:0 auto 12px;}
      .no{font-size:11px;font-family:monospace;color:#15803d;font-weight:bold;letter-spacing:.1em;}
      .nm{font-size:14px;font-weight:700;color:#111;margin:4px 0;}
      .org{font-size:10px;color:#6b7280;margin-top:8px;}</style></head>
      <body><div class="wrap"><img class="qr" src="${qrDataUrl}"/>
      <p class="no">${reg.cardNumber}</p><p class="nm">${reg.name}</p>
      <p class="org">ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ ( ਕੋਟ ਬੁੱਢਾ)</p></div></body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };
  return (
    <div className="flex flex-col items-center gap-4" ref={printRef}>
      <div className="bg-white rounded-2xl p-5 shadow-lg border border-green-100 flex flex-col items-center gap-3">
        <img src={qrDataUrl} alt="QR Code" className="w-52 h-52" />
        <div className="text-center">
          <p className="text-xs font-mono font-bold text-green-700 tracking-widest">{reg.cardNumber}</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">{reg.name}</p>
          <p className="text-xs text-gray-500">{reg.designation}</p>
        </div>
        <div className="w-full border-t border-gray-100 pt-2 text-center">
          <p className="text-xs text-gray-400">Scan to Verify • ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ ( ਕੋਟ ਬੁੱਢਾ)</p>
        </div>
      </div>
      <div className="flex gap-2 w-full">
        <Button onClick={() => { const a = document.createElement("a"); a.href = qrDataUrl; a.download = `QR-${reg.cardNumber}.png`; a.click(); }}
          className="flex-1 bg-green-600 hover:bg-green-700"><Download className="mr-2 h-4 w-4" /> PNG ਡਾਊਨਲੋਡ</Button>
        <Button onClick={handlePrint} variant="outline" className="flex-1">🖨️ Print</Button>
      </div>
    </div>
  );
}

// ─── Issue QR Dialog ─────────────────────────────────────────
function IssueQRDialog({ reg }: { reg: Registration }) {
  const [open, setOpen] = useState(false);
  const [vFrom, setVFrom] = useState(() => new Date().toISOString().split("T")[0]);
  const [vUntil, setVUntil] = useState(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().split("T")[0]; });
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [issuedReg, setIssuedReg] = useState<Registration | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleIssue = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("POST", `/api/admin/registrations/${reg.id}/issue-card`, { validFrom: vFrom, validUntil: vUntil });
      const data = await res.json();
      setQrDataUrl(data.qrDataUrl); setIssuedReg(data.registration);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] });
      toast({ title: "QR ਤਿਆਰ ✓", description: `Card: ${data.registration.cardNumber}` });
    } catch { toast({ title: "ਗਲਤੀ", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const loadExistingQR = async () => {
    if (qrDataUrl || !reg.cardNumber) return;
    try {
      const res = await fetch(`/api/admin/registrations/${reg.id}/qr`, { credentials: "include" });
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = (e) => setQrDataUrl(e.target?.result as string);
      reader.readAsDataURL(blob);
    } catch { }
  };

  const handleClose = (o: boolean) => {
    setOpen(o);
    if (o && reg.cardNumber && reg.validFrom) loadExistingQR();
    if (!o) { setQrDataUrl(null); setIssuedReg(null); }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white w-full" data-testid={`button-qr-${reg.id}`}>
          <QrCode className="h-3.5 w-3.5" />{reg.cardNumber ? "QR ਦੇਖੋ / ਨਵਿਆਓ" : "QR ਬਣਾਓ"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle><QrCode className="inline h-4 w-4 mr-2 text-green-700" />{qrDataUrl ? "QR Code" : "QR ਬਣਾਓ"}</DialogTitle></DialogHeader>
        {qrDataUrl ? <QRPanel qrDataUrl={qrDataUrl} reg={issuedReg || reg} /> : (
          <div className="space-y-4">
            <div className="bg-muted/40 rounded-lg p-3 flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                {reg.photoUrl ? <AvatarImage src={reg.photoUrl} /> : reg.photoData ? <AvatarImage src={`data:${reg.photoMimeType};base64,${reg.photoData}`} /> : null}
                <AvatarFallback className="font-bold">{reg.name[0]}</AvatarFallback>
              </Avatar>
              <div><p className="font-semibold">{reg.name}</p><p className="text-xs text-muted-foreground">{reg.village}, {reg.district}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Valid From</Label><Input type="date" value={vFrom} onChange={(e) => setVFrom(e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Valid Until</Label><Input type="date" value={vUntil} onChange={(e) => setVUntil(e.target.value)} /></div>
            </div>
            <Button onClick={handleIssue} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />QR ਬਣ ਰਿਹਾ...</> : <><QrCode className="mr-2 h-4 w-4" />QR ਬਣਾਓ</>}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Photo Preview Dialog ────────────────────────────────────
function PhotoPreviewDialog({ reg }: { reg: Registration }) {
  const [open, setOpen] = useState(false);
  const photoSrc = reg.photoUrl || (reg.photoData ? `data:${reg.photoMimeType};base64,${reg.photoData}` : null);
  if (!photoSrc) return null;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = photoSrc;
    a.download = `${reg.name.replace(/\s+/g, "_")}_photo.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="flex-shrink-0 rounded-full ring-2 ring-transparent hover:ring-primary/40 transition-all focus:outline-none" title="ਫੋਟੋ ਦੇਖੋ" data-testid={`photo-preview-${reg.id}`}>
          <Avatar className="h-14 w-14 border-2 border-muted">
            <AvatarImage src={photoSrc} />
            <AvatarFallback className="text-xl font-bold">{reg.name[0]}</AvatarFallback>
          </Avatar>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xs p-0 overflow-hidden">
        <div className="bg-gray-900 flex items-center justify-center min-h-[280px]">
          <img src={photoSrc} alt={reg.name} className="max-w-full max-h-[60vh] object-contain" />
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className="font-semibold">{reg.name}</p>
            <p className="text-xs text-muted-foreground">{reg.designation} • {reg.village}, {reg.district}</p>
          </div>
          <Button onClick={handleDownload} className="w-full gap-2" variant="outline" data-testid={`button-download-photo-${reg.id}`}>
            <Download className="h-4 w-4" /> ਫੋਟੋ Download ਕਰੋ
          </Button>
          <p className="text-xs text-muted-foreground text-center">Download ਕਰਕੇ edit ਕਰੋ, ਫਿਰ "ਸੋਧ ਕਰੋ" ਤੋਂ ਦੁਬਾਰਾ upload ਕਰੋ</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Image Compression Utility ───────────────────────────────
async function compressImage(file: File, maxW = 600, maxH = 800, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error("compress failed")), "image/jpeg", quality);
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ─── Edit Dialog ─────────────────────────────────────────────
function EditDialog({ reg }: { reg: Registration }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: reg.name, designation: reg.designation || "ਮੈਂਬਰ", district: reg.district, tehsil: reg.tehsil, village: reg.village, areaType: (reg.areaType || "rural") as "rural" | "urban", wardNumber: reg.wardNumber || "", mohalla: reg.mohalla || "", mobileNumber: reg.mobileNumber || "", aadhaarNumber: reg.aadhaarNumber || "", validFrom: reg.validFrom ? new Date(reg.validFrom).toISOString().split("T")[0] : "", validUntil: reg.validUntil ? new Date(reg.validUntil).toISOString().split("T")[0] : "" });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const tehsilsForDistrict = PUNJAB_DISTRICTS.find(d => d.name === form.district)?.tehsils || [];

  const currentPhoto = reg.photoUrl || (reg.photoData ? `data:${reg.photoMimeType};base64,${reg.photoData}` : null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      const compressedFile = new File([compressed], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
      setPhotoFile(compressedFile);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(compressedFile);
      toast({ title: "✓ ਫੋਟੋ ਤਿਆਰ", description: `Compressed: ${(compressed.size / 1024).toFixed(0)} KB` });
    } catch {
      toast({ title: "ਗਲਤੀ", description: "ਫੋਟੋ compress ਨਹੀਂ ਹੋਈ", variant: "destructive" });
    }
    setCompressing(false);
  };

  const resetDialog = (o: boolean) => {
    setOpen(o);
    if (o) {
      setForm({ name: reg.name, designation: reg.designation || "ਮੈਂਬਰ", district: reg.district, tehsil: reg.tehsil, village: reg.village, areaType: (reg.areaType || "rural") as "rural" | "urban", wardNumber: reg.wardNumber || "", mohalla: reg.mohalla || "", mobileNumber: reg.mobileNumber || "", aadhaarNumber: reg.aadhaarNumber || "", validFrom: reg.validFrom ? new Date(reg.validFrom).toISOString().split("T")[0] : "", validUntil: reg.validUntil ? new Date(reg.validUntil).toISOString().split("T")[0] : "" });
      setPhotoFile(null); setPhotoPreview(null);
    }
  };

  const editMut = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v as string));
      if (photoFile) fd.append("photo", photoFile);
      const res = await fetch(`/api/admin/registrations/${reg.id}`, { method: "PATCH", body: fd, credentials: "include" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      return res.json();
    },
    onSuccess: () => { toast({ title: "✓ ਅੱਪਡੇਟ ਹੋ ਗਿਆ" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] }); setOpen(false); },
    onError: (err: any) => toast({ title: "ਗਲਤੀ", description: err.message, variant: "destructive" }),
  });

  const f = (label: string, key: keyof typeof form, placeholder = "") => (
    <div className="space-y-1"><Label className="text-xs">{label}</Label>
      <Input type="text" value={form[key] as string} onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder || label} className="h-8 text-sm" />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={resetDialog}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs" data-testid={`button-edit-${reg.id}`}><Pencil className="h-3.5 w-3.5" /> ਸੋਧ ਕਰੋ</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Pencil className="h-4 w-4 text-primary" /> ਮੈਂਬਰ ਸੋਧ ਕਰੋ</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">

          {/* ── Photo Section ── */}
          <div className="space-y-2">
            <Label className="text-xs">ਫੋਟੋ</Label>
            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
              <div className="relative flex-shrink-0">
                {(photoPreview || currentPhoto) ? (
                  <img src={photoPreview || currentPhoto!} alt="photo"
                    className="h-16 w-16 rounded-full object-cover border-2 border-primary/20" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                    <span className="text-xl font-bold text-muted-foreground">{reg.name[0]}</span>
                  </div>
                )}
                {photoPreview && (
                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <p className="text-xs text-muted-foreground">
                  {photoPreview ? "ਨਵੀਂ ਫੋਟੋ ਚੁਣੀ ਗਈ (compressed ✓)" : currentPhoto ? "ਮੌਜੂਦਾ ਫੋਟੋ" : "ਕੋਈ ਫੋਟੋ ਨਹੀਂ"}
                </p>
                <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium cursor-pointer transition-colors ${compressing ? "opacity-50 cursor-not-allowed" : "hover:bg-muted border-input"}`}>
                  {compressing ? <><Loader2 className="h-3 w-3 animate-spin" />Compressing...</> : <><Camera className="h-3 w-3" />ਫੋਟੋ ਬਦਲੋ</>}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={compressing} data-testid={`input-photo-edit-${reg.id}`} />
                </label>
                {photoPreview && (
                  <button onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="text-xs text-muted-foreground hover:text-destructive ml-2">✕ ਰੱਦ ਕਰੋ</button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">{f("ਨਾਮ *", "name", "ਪੂਰਾ ਨਾਮ")}{f("ਆਹੁਦਾ", "designation", "ਮੈਂਬਰ / ਪ੍ਰਧਾਨ...")}</div>
          <div className="space-y-1"><Label className="text-xs">ਖੇਤਰ</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["rural", "urban"] as const).map(t => (
                <button key={t} type="button" onClick={() => setForm(p => ({ ...p, areaType: t, wardNumber: "", mohalla: "" }))}
                  className={`py-1.5 rounded-md border text-xs font-medium transition-colors ${form.areaType === t ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-muted"}`}>
                  {t === "rural" ? "🌾 ਪੇਂਡੂ" : "🏙️ ਸ਼ਹਿਰੀ"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1"><Label className="text-xs">ਜ਼ਿਲ੍ਹਾ *</Label>
            <select value={form.district} onChange={(e) => setForm(p => ({ ...p, district: e.target.value, tehsil: "" }))} className={selectCls}>
              <option value="">ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ</option>
              {PUNJAB_DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div className="space-y-1"><Label className="text-xs">ਤਹਿਸੀਲ *</Label>
            <select value={form.tehsil} onChange={(e) => setForm(p => ({ ...p, tehsil: e.target.value }))} className={selectCls} disabled={!form.district}>
              <option value="">ਤਹਿਸੀਲ ਚੁਣੋ</option>
              {tehsilsForDistrict.map(t => <option key={t} value={t}>{t}</option>)}
              {form.tehsil && !tehsilsForDistrict.includes(form.tehsil) && <option value={form.tehsil}>{form.tehsil} (ਮੌਜੂਦਾ)</option>}
            </select>
          </div>
          {f(form.areaType === "urban" ? "ਸ਼ਹਿਰ/ਨਗਰ *" : "ਪਿੰਡ *", "village", form.areaType === "urban" ? "ਸ਼ਹਿਰ ਦਾ ਨਾਮ" : "ਪਿੰਡ ਦਾ ਨਾਮ")}
          {form.areaType === "urban" && <div className="grid grid-cols-2 gap-3">{f("ਵਾਰਡ ਨੰਬਰ", "wardNumber", "ਵਿਕਲਪਿਕ")}{f("ਮੁਹੱਲਾ", "mohalla", "ਵਿਕਲਪਿਕ")}</div>}
          <div className="grid grid-cols-2 gap-3">{f("ਮੋਬਾਈਲ", "mobileNumber", "10 ਅੰਕ")}{f("ਆਧਾਰ ਨੰਬਰ", "aadhaarNumber", "12 ਅੰਕ")}</div>
          {reg.status === "card_issued" && (
            <div className="space-y-1 pt-1 border-t">
              <Label className="text-xs font-semibold text-primary">📅 ਕਾਰਡ ਦੀ ਵੈਧਤਾ</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">ਸ਼ੁਰੂਆਤੀ ਤਾਰੀਖ਼</Label>
                  <Input type="date" value={form.validFrom} onChange={e => setForm(p => ({ ...p, validFrom: e.target.value }))} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">ਅੰਤਿਮ ਤਾਰੀਖ਼</Label>
                  <Input type="date" value={form.validUntil} onChange={e => setForm(p => ({ ...p, validUntil: e.target.value }))} className="h-8 text-sm" />
                </div>
              </div>
            </div>
          )}
        </div>
        <Button onClick={() => editMut.mutate()} disabled={editMut.isPending || compressing || !form.name || !form.village || !form.tehsil || !form.district} className="w-full">
          {editMut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />ਸੇਵ ਹੋ ਰਿਹਾ...</> : <><Pencil className="mr-2 h-4 w-4" />ਸੇਵ ਕਰੋ</>}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Request Dialog (non-admin) ───────────────────────
function DeleteRequestDialog({ reg }: { reg: Registration }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/registrations/${reg.id}/delete-request`, { reason });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✓ ਬੇਨਤੀ ਭੇਜੀ ਗਈ", description: "Admin ਇਸਦੀ ਸਮੀਖਿਆ ਕਰੇਗਾ" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/delete-requests"] });
      setOpen(false); setReason("");
    },
    onError: (err: any) => toast({ title: "ਗਲਤੀ", description: err.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="w-full text-orange-600 hover:bg-orange-50 text-xs gap-1.5" data-testid={`button-delete-req-${reg.id}`}>
          <FileText className="h-3.5 w-3.5" /> ਮਿਟਾਉਣ ਦੀ ਬੇਨਤੀ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="h-4 w-4 text-orange-600" /> ਮਿਟਾਉਣ ਦੀ ਬੇਨਤੀ</DialogTitle></DialogHeader>
        <div className="space-y-3 py-1">
          <div className="bg-muted/40 rounded-lg p-3">
            <p className="font-semibold text-sm">{reg.name}</p>
            <p className="text-xs text-muted-foreground">{reg.village}, {reg.district}</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">ਕਾਰਨ *</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="ਮਿਟਾਉਣ ਦਾ ਕਾਰਨ ਲਿਖੋ..." rows={3} />
          </div>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending || !reason.trim()} className="w-full bg-orange-600 hover:bg-orange-700">
            {mut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />ਭੇਜਿਆ ਜਾ ਰਿਹਾ...</> : "ਬੇਨਤੀ ਭੇਜੋ"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reject with Reason Dialog (admin pending) ───────────────
function RejectDialog({ regId, onReject, endpoint }: { regId: number; onReject: () => void; endpoint: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mut = useMutation({
    mutationFn: async () => {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ reason }) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✗ Reject ਕੀਤਾ" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] });
      setOpen(false); setReason(""); onReject();
    },
    onError: (err: any) => toast({ title: "ਗਲਤੀ", description: err.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive" className="gap-1.5 flex-1" data-testid={`button-reject-${regId}`}>
          <ThumbsDown className="h-3.5 w-3.5" /> Reject
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Reject ਕਰਨ ਦਾ ਕਾਰਨ</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="ਕਾਰਨ ਲਿਖੋ (ਲਾਜ਼ਮੀ)..." rows={3} />
          <Button onClick={() => mut.mutate()} disabled={mut.isPending || !reason.trim()} variant="destructive" className="w-full">
            {mut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Reject ਹੋ ਰਿਹਾ...</> : "Reject ਕਰੋ"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Pending Card (stage-aware) ───────────────────────────────
function photoSizeLabel(reg: Registration): string | null {
  if (reg.photoSize) {
    return reg.photoSize >= 1024 * 1024
      ? `${(reg.photoSize / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(reg.photoSize / 1024)} KB`;
  }
  if (reg.photoData) {
    const bytes = Math.round(reg.photoData.length * 0.75);
    return bytes >= 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(bytes / 1024)} KB`;
  }
  return null;
}

function PendingCard({ reg, userRole }: { reg: Registration; userRole: StaffRole }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const stage = reg.currentStage || "submitted";

  const canMeetPresAct = userRole === "state_meet_president" && stage === "submitted";
  const canStatePresAct = userRole === "state_president" && stage === "state_president_review";
  const canAdminAct = userRole === "admin" && reg.status === "pending";

  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [showValidity, setShowValidity] = useState(false);

  const meetApprove = useMutation({
    mutationFn: async () => { const r = await apiRequest("POST", `/api/admin/registrations/${reg.id}/meet-president-approve`); if (!r.ok) throw new Error(); return r.json(); },
    onSuccess: () => { toast({ title: "✓ Meet President Approved" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] }); },
    onError: () => toast({ title: "ਗਲਤੀ", variant: "destructive" }),
  });

  const stateApprove = useMutation({
    mutationFn: async () => { const r = await apiRequest("POST", `/api/admin/registrations/${reg.id}/state-president-approve`); if (!r.ok) throw new Error(); return r.json(); },
    onSuccess: () => { toast({ title: "✓ State President Approved" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] }); },
    onError: () => toast({ title: "ਗਲਤੀ", variant: "destructive" }),
  });

  const adminApprove = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", `/api/admin/registrations/${reg.id}/approve`, { validFrom, validUntil });
      if (!r.ok) throw new Error();
      return r.json();
    },
    onSuccess: () => { toast({ title: "✓ ਅਪ੍ਰੂਵ ਕੀਤਾ" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] }); },
    onError: () => toast({ title: "ਗਲਤੀ", variant: "destructive" }),
  });

  const sizeLabel = photoSizeLabel(reg);

  return (
    <Card className="border-amber-200 bg-amber-50/30 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            {reg.photoUrl || reg.photoData ? (
              <PhotoPreviewDialog reg={reg} />
            ) : (
              <Avatar className="h-14 w-14 border-2 border-amber-200">
                <AvatarFallback className="text-xl font-bold bg-amber-100">{reg.name[0]}</AvatarFallback>
              </Avatar>
            )}
            {sizeLabel && (
              <span className="text-[10px] font-mono bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">{sizeLabel}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div><p className="font-semibold leading-tight">{reg.name}</p><p className="text-sm text-muted-foreground">{reg.designation}</p></div>
              {stageBadge(stage)}
            </div>
            <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{reg.village}, {reg.tehsil}, {reg.district}</div>
              {reg.mobileNumber && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /><span className="font-mono">{reg.mobileNumber}</span></div>}
              {reg.trackingId && <div className="flex items-center gap-1.5"><CreditCard className="h-3 w-3" /><span className="font-mono text-blue-600">{reg.trackingId}</span></div>}
              <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" />
                {new Date(reg.createdAt!).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {canMeetPresAct && (
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1.5 flex-1" onClick={() => meetApprove.mutate()} disabled={meetApprove.isPending}>
                {meetApprove.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ThumbsUp className="h-3.5 w-3.5" />} Approve
              </Button>
              <RejectDialog regId={reg.id} endpoint={`/api/admin/registrations/${reg.id}/meet-president-reject`} onReject={() => {}} />
            </div>
          )}
          {canStatePresAct && (
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1.5 flex-1" onClick={() => stateApprove.mutate()} disabled={stateApprove.isPending}>
                {stateApprove.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ThumbsUp className="h-3.5 w-3.5" />} Approve
              </Button>
              <RejectDialog regId={reg.id} endpoint={`/api/admin/registrations/${reg.id}/state-president-reject`} onReject={() => {}} />
            </div>
          )}
          {canAdminAct && (
            <div className="space-y-2">
              {!showValidity ? (
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1.5 flex-1" onClick={() => setShowValidity(true)}>
                    <ThumbsUp className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <RejectDialog regId={reg.id} endpoint={`/api/admin/registrations/${reg.id}/reject`} onReject={() => {}} />
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-green-800">📅 ਕਾਰਡ ਦੀ ਵੈਧਤਾ ਦੀਆਂ ਤਾਰੀਖ਼ਾਂ ਚੁਣੋ</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-green-700">ਸ਼ੁਰੂਆਤੀ ਤਾਰੀਖ਼ *</Label>
                      <Input type="date" value={validFrom} onChange={e => setValidFrom(e.target.value)} className="h-7 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-green-700">ਅੰਤਿਮ ਤਾਰੀਖ਼ *</Label>
                      <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="h-7 text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1" onClick={() => adminApprove.mutate()} disabled={adminApprove.isPending || !validFrom || !validUntil}>
                      {adminApprove.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ThumbsUp className="h-3.5 w-3.5" />} ਕਾਰਡ ਜਾਰੀ ਕਰੋ
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setShowValidity(false); setValidFrom(""); setValidUntil(""); }}>ਰੱਦ</Button>
                  </div>
                </div>
              )}
            </div>
          )}
          {!canMeetPresAct && !canStatePresAct && !canAdminAct && (
            <div className="text-xs text-muted-foreground text-center py-1 bg-muted/40 rounded">ਇਸ ਪੜਾਅ ਵਿੱਚ ਕਾਰਵਾਈ ਨਹੀਂ ਕਰ ਸਕਦੇ</div>
          )}
          <EditDialog reg={reg} />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Member Card ─────────────────────────────────────────────
// ── Card Download Button ──────────────────────────────────────
function CardDownloadButton({ reg }: { reg: Registration }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function doDownload() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/card-config", { credentials: "include" });
      const { templateUrl, ...config } = await res.json();
      await downloadCard(reg, config as CardFieldConfig, templateUrl ? "/api/card-template" : "/api/card-template");
      toast({ title: "✓ ਕਾਰਡ ਡਾਊਨਲੋਡ ਸ਼ੁਰੂ ਹੋ ਗਿਆ" });
    } catch (e) {
      console.error(e);
      toast({ title: "ਡਾਊਨਲੋਡ ਫੇਲ੍ਹ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="outline" className="w-full gap-1.5 border-green-300 text-green-700 hover:bg-green-50" onClick={doDownload} disabled={loading}>
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
      {loading ? "ਕਾਰਡ ਬਣ ਰਿਹਾ ਹੈ..." : "ਕਾਰਡ ਡਾਊਨਲੋਡ ਕਰੋ"}
    </Button>
  );
}

// ── Card Template Settings ────────────────────────────────────
function StampUploader({ onUploaded }: { onUploaded: () => void }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [hasStamp, setHasStamp] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/stamp", { credentials: "include" }).then(r => setHasStamp(r.ok)).catch(() => {});
  }, []);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("stamp", file);
      const r = await fetch("/api/admin/stamp", { method: "POST", body: fd, credentials: "include" });
      if (!r.ok) throw new Error();
      setHasStamp(true);
      onUploaded();
    } catch { toast({ title: "ਅੱਪਲੋਡ ਫੇਲ੍ਹ", variant: "destructive" }); }
    finally { setUploading(false); if (ref.current) ref.current.value = ""; }
  }

  return (
    <div className="flex items-center gap-3">
      <Button size="sm" variant="outline" onClick={() => ref.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Camera className="h-3.5 w-3.5 mr-1" />}
        {hasStamp ? "ਸਟੈਂਪ ਬਦਲੋ" : "ਸਟੈਂਪ ਅੱਪਲੋਡ ਕਰੋ"}
      </Button>
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={upload} />
      {hasStamp && <span className="text-xs text-green-600 font-medium">✓ ਸਟੈਂਪ ਅੱਪਲੋਡ ਹੈ</span>}
      <p className="text-xs text-muted-foreground">PNG transparent ਸਭ ਤੋਂ ਵਧੀਆ</p>
    </div>
  );
}

function CardTemplateSettings() {
  const { toast } = useToast();
  const [config, setConfig] = useState<CardFieldConfig>(DEFAULT_CARD_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [templateTs, setTemplateTs] = useState(Date.now());
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/card-config", { credentials: "include" })
      .then(r => r.json())
      .then(({ templateUrl: _url, ...cfg }) => { setConfig(cfg); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  async function saveConfig() {
    setSaving(true);
    try {
      const r = await apiRequest("PUT", "/api/admin/card-config", config);
      if (!r.ok) throw new Error();
      toast({ title: "✓ ਕੌਨਫਿਗ ਸੇਵ ਕੀਤਾ" });
    } catch { toast({ title: "ਸੇਵ ਨਹੀਂ ਹੋਇਆ", variant: "destructive" }); }
    finally { setSaving(false); }
  }

  async function uploadTemplate(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("template", file);
      const r = await fetch("/api/admin/card-template", { method: "POST", body: fd, credentials: "include" });
      if (!r.ok) throw new Error();
      setTemplateTs(Date.now());
      toast({ title: "✓ ਟੈਂਪਲੇਟ ਅੱਪਲੋਡ ਕੀਤਾ" });
    } catch { toast({ title: "ਅੱਪਲੋਡ ਫੇਲ੍ਹ", variant: "destructive" }); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5">
      {/* Template preview + upload */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Camera className="h-4 w-4" /> ਕਾਰਡ ਟੈਂਪਲੇਟ</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <img src={`/api/card-template?t=${templateTs}`} alt="Card Template" className="w-full rounded border shadow-sm" crossOrigin="anonymous" />
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} variant="outline">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Camera className="h-3.5 w-3.5 mr-1" />}
              ਨਵਾਂ ਟੈਂਪਲੇਟ ਅੱਪਲੋਡ
            </Button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={uploadTemplate} />
            <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={async () => { try { await downloadCalibrationCard(config); } catch(e) { toast({ title: "ਕੈਲੀਬ੍ਰੇਸ਼ਨ ਫੇਲ੍ਹ", variant: "destructive" }); } }}>
              🎯 ਕੈਲੀਬ੍ਰੇਸ਼ਨ ਕਾਰਡ ਡਾਊਨਲੋਡ ਕਰੋ
            </Button>
            <p className="text-xs text-muted-foreground">ਸਿਫ਼ਾਰਸ਼: 2480×926 px PNG</p>
          </div>
        </CardContent>
      </Card>

      {/* Stamp upload */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2">💮 ਸਟੈਂਪ</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <StampUploader onUploaded={() => toast({ title: "✓ ਸਟੈਂਪ ਅੱਪਲੋਡ ਕੀਤਾ" })} />
        </CardContent>
      </Card>

      {/* Visual Field Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            🎯 Visual Card Editor
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            ਟੈਂਪਲੇਟ ਉੱਤੇ ਸਿੱਧਾ drag ਕਰੋ — ਬਾਕਸ ਨੂੰ ਖਿੱਚੋ, ਕੋਨੇ ਤੋਂ resize ਕਰੋ
          </p>
        </CardHeader>
        <CardContent>
          <CardVisualEditor
            config={config}
            onChange={setConfig}
            templateTs={templateTs}
          />
          <Button onClick={saveConfig} disabled={saving} className="w-full mt-4">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            ✓ ਕੌਨਫਿਗ ਸੇਵ ਕਰੋ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function MemberCard({ reg, isAdminRole }: { reg: Registration; isAdminRole: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isExpired = reg.validUntil && new Date(reg.validUntil) < new Date();
  const isActive = reg.validFrom && reg.validUntil && new Date() >= new Date(reg.validFrom) && new Date() <= new Date(reg.validUntil);

  const deleteMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/registrations/${reg.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("ਮਿਟਾਉਣ ਵਿੱਚ ਗਲਤੀ");
      return res.json();
    },
    onSuccess: () => { toast({ title: "ਮਿਟਾਇਆ ਗਿਆ" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] }); },
    onError: () => toast({ title: "ਗਲਤੀ", variant: "destructive" }),
  });

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {reg.photoUrl || reg.photoData ? (
            <PhotoPreviewDialog reg={reg} />
          ) : (
            <Avatar className="h-14 w-14 flex-shrink-0 border-2 border-muted">
              <AvatarFallback className="text-xl font-bold">{reg.name[0]}</AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div><p className="font-semibold leading-tight">{reg.name}</p><p className="text-sm text-muted-foreground">{reg.designation}</p></div>
              {isActive ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium"><CheckCircle className="h-3 w-3" /> Active</span>
                : isExpired ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium"><AlertTriangle className="h-3 w-3" /> Expired</span>
                : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"><Clock className="h-3 w-3" /> Ready</span>}
            </div>
            <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{reg.village}, {reg.tehsil}, {reg.district}</div>
              {reg.mobileNumber && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /><span className="font-mono">{reg.mobileNumber}</span></div>}
              {reg.cardNumber && <div className="flex items-center gap-1.5"><CreditCard className="h-3 w-3" /><span className="font-mono text-green-700 font-semibold">{reg.cardNumber}</span></div>}
              {reg.trackingId && <div className="flex items-center gap-1.5"><CreditCard className="h-3 w-3" /><span className="font-mono text-blue-600 text-[10px]">{reg.trackingId}</span></div>}
              {reg.validFrom && reg.validUntil && (
                <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" />
                  {new Date(reg.validFrom).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} → {new Date(reg.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {isAdminRole && reg.currentStage === "card_issued" && <CardDownloadButton reg={reg} />}
          {isAdminRole && <IssueQRDialog reg={reg} />}
          <EditDialog reg={reg} />
          {isAdminRole ? (
            <Button size="sm" variant="ghost" className="w-full text-destructive hover:bg-destructive/10 text-xs"
              onClick={() => { if (confirm(`ਕੀ ਤੁਸੀਂ ${reg.name} ਨੂੰ ਪੱਕੇ ਤੌਰ ਤੇ ਮਿਟਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ?`)) deleteMut.mutate(); }}
              disabled={deleteMut.isPending}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> ਮਿਟਾਓ
            </Button>
          ) : (
            <DeleteRequestDialog reg={reg} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Large Member Card (list view) ───────────────────────────
function MemberCardLarge({ reg, isAdminRole }: { reg: Registration; isAdminRole: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isExpired = reg.validUntil && new Date(reg.validUntil) < new Date();
  const isActive = reg.validFrom && reg.validUntil && new Date() >= new Date(reg.validFrom) && new Date() <= new Date(reg.validUntil);
  const photoSrc = reg.photoUrl || (reg.photoData ? `data:${reg.photoMimeType};base64,${reg.photoData}` : null);

  const deleteMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/registrations/${reg.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("ਮਿਟਾਉਣ ਵਿੱਚ ਗਲਤੀ");
      return res.json();
    },
    onSuccess: () => { toast({ title: "ਮਿਟਾਇਆ ਗਿਆ" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] }); },
    onError: () => toast({ title: "ਗਲਤੀ", variant: "destructive" }),
  });

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex gap-0">
          {/* Photo column */}
          <div className="w-32 sm:w-44 flex-shrink-0 bg-muted/30 flex items-center justify-center min-h-[160px]">
            {photoSrc ? (
              <img src={photoSrc} alt={reg.name} className="w-full h-full object-cover" style={{ minHeight: 160, maxHeight: 220 }} />
            ) : (
              <div className="flex items-center justify-center w-full h-full min-h-[160px]">
                <span className="text-5xl font-bold text-muted-foreground/40">{reg.name[0]}</span>
              </div>
            )}
          </div>
          {/* Details column */}
          <div className="flex-1 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="text-lg font-bold leading-tight">{reg.name}</p>
                <p className="text-sm text-muted-foreground">{reg.designation}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 items-center">
                {stageBadge(reg.currentStage)}
                {isActive ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium"><CheckCircle className="h-3 w-3" /> Active</span>
                  : isExpired ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium"><AlertTriangle className="h-3 w-3" /> Expired</span>
                  : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"><Clock className="h-3 w-3" /> Ready</span>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 flex-shrink-0" />{reg.village}, {reg.tehsil}, {reg.district}</div>
              {reg.mobileNumber && <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 flex-shrink-0" /><span className="font-mono">{reg.mobileNumber}</span></div>}
              {reg.cardNumber && <div className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 flex-shrink-0 text-green-600" /><span className="font-mono text-green-700 font-semibold">{reg.cardNumber}</span></div>}
              {reg.trackingId && <div className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" /><span className="font-mono text-blue-600 text-xs">{reg.trackingId}</span></div>}
              {reg.aadhaarNumber && <div className="flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5 flex-shrink-0" /><span className="font-mono">**** **** {reg.aadhaarNumber.slice(-4)}</span></div>}
              {reg.validFrom && reg.validUntil && (
                <div className="flex items-center gap-1.5 sm:col-span-2"><Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                  {new Date(reg.validFrom).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} → {new Date(reg.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-auto pt-1">
              {isAdminRole && reg.currentStage === "card_issued" && <CardDownloadButton reg={reg} />}
              {isAdminRole && <IssueQRDialog reg={reg} />}
              <EditDialog reg={reg} />
              {isAdminRole ? (
                <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 text-xs"
                  onClick={() => { if (confirm(`ਕੀ ਤੁਸੀਂ ${reg.name} ਨੂੰ ਪੱਕੇ ਤੌਰ ਤੇ ਮਿਟਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ?`)) deleteMut.mutate(); }}
                  disabled={deleteMut.isPending}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> ਮਿਟਾਓ
                </Button>
              ) : (
                <DeleteRequestDialog reg={reg} />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Delete Requests Panel ───────────────────────────────────
function DeleteRequestsPanel({ isAdminRole }: { isAdminRole: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useQuery<DeleteRequest[]>({ queryKey: ["/api/admin/delete-requests"], queryFn: () => fetch("/api/admin/delete-requests", { credentials: "include" }).then(r => r.json()) });

  const resolveMut = useMutation({
    mutationFn: async ({ id, approve }: { id: number; approve: boolean }) => {
      const endpoint = approve ? `/api/admin/delete-requests/${id}/approve` : `/api/admin/delete-requests/${id}/reject`;
      const res = await apiRequest("POST", endpoint);
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: (_, vars) => {
      toast({ title: vars.approve ? "✓ ਮੈਂਬਰ ਮਿਟਾਇਆ ਗਿਆ" : "✗ ਬੇਨਤੀ ਰੱਦ ਕੀਤੀ" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/delete-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] });
    },
    onError: () => toast({ title: "ਗਲਤੀ", variant: "destructive" }),
  });

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!requests?.length) return (
    <Card><CardContent className="text-center py-16 text-muted-foreground">
      <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>ਕੋਈ ਮਿਟਾਉਣ ਦੀ ਬੇਨਤੀ ਨਹੀਂ</p>
    </CardContent></Card>
  );

  const statusBadge = (status: string) => {
    if (status === "pending") return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">ਪੈਂਡਿੰਗ</span>;
    if (status === "approved") return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">ਮਨਜ਼ੂਰ</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">ਰੱਦ</span>;
  };

  return (
    <div className="space-y-3">
      {requests.map(req => (
        <Card key={req.id} className={req.status === "pending" ? "border-amber-200" : ""}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{req.memberName}</p>
                  {statusBadge(req.status)}
                </div>
                <p className="text-xs text-muted-foreground mb-1">ID #{req.memberId} • ਬੇਨਤੀ: <span className="font-medium">{req.requestedBy}</span> ({req.requestedByRole})</p>
                <p className="text-sm text-foreground bg-muted/40 rounded p-2 mt-1">"{req.reason}"</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(req.createdAt!).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                {req.resolvedBy && <p className="text-xs text-muted-foreground mt-0.5">ਫੈਸਲਾ: {req.resolvedBy}</p>}
              </div>
            </div>
            {isAdminRole && req.status === "pending" && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => resolveMut.mutate({ id: req.id, approve: true })} disabled={resolveMut.isPending}>
                  <Trash2 className="h-3.5 w-3.5" /> ਮਿਟਾਓ
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => resolveMut.mutate({ id: req.id, approve: false })} disabled={resolveMut.isPending}>
                  <X className="h-3.5 w-3.5" /> ਰੱਦ ਕਰੋ
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── User Management Panel (admin only) ──────────────────────
function ChangePasswordDialog({ user, onClose }: { user: any; onClose: () => void }) {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const changeMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/admin/staff-users/${user.id}/password`, { newPassword });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✓ ਪਾਸਵਰਡ ਬਦਲ ਦਿੱਤਾ", description: `@${user.username} ਦਾ ਪਾਸਵਰਡ ਅਪਡੇਟ ਹੋ ਗਿਆ` });
      onClose();
    },
    onError: (err: any) => toast({ title: "ਗਲਤੀ", description: err.message, variant: "destructive" }),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /> ਪਾਸਵਰਡ ਬਦਲੋ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <p className="text-sm text-muted-foreground">@{user.username} ({user.displayName})</p>
          <div className="space-y-1">
            <Label className="text-xs">ਨਵਾਂ ਪਾਸਵਰਡ *</Label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="ਨਵਾਂ ਪਾਸਵਰਡ"
                className="pr-10"
                autoFocus
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">ਘੱਟੋ-ਘੱਟ 4 ਅੱਖਰ</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>ਰੱਦ ਕਰੋ</Button>
            <Button className="flex-1" onClick={() => changeMut.mutate()}
              disabled={changeMut.isPending || newPassword.length < 4}>
              {changeMut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />ਅਪਡੇਟ ਹੋ ਰਿਹਾ...</> : "ਪਾਸਵਰਡ ਸੇਵ ਕਰੋ"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UserManagementPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showFormPw, setShowFormPw] = useState(false);
  const [changePwUser, setChangePwUser] = useState<any>(null);
  const [form, setForm] = useState({ username: "", password: "", displayName: "", role: "state_meet_president" });

  const { data: users, isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/staff-users"], queryFn: () => fetch("/api/admin/staff-users", { credentials: "include" }).then(r => r.json()) });

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/staff-users", form);
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      return res.json();
    },
    onSuccess: () => { toast({ title: "✓ ਯੂਜ਼ਰ ਬਣਾਇਆ ਗਿਆ" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/staff-users"] }); setForm({ username: "", password: "", displayName: "", role: "state_meet_president" }); setShowForm(false); },
    onError: (err: any) => toast({ title: "ਗਲਤੀ", description: err.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(`/api/admin/staff-users/${id}`, { method: "DELETE", credentials: "include" }); return r.json(); },
    onSuccess: () => { toast({ title: "ਯੂਜ਼ਰ ਮਿਟਾਇਆ" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/staff-users"] }); },
    onError: () => toast({ title: "ਗਲਤੀ", variant: "destructive" }),
  });

  const roleLabel: Record<string, string> = { admin: "ਐਡਮਿਨ", state_meet_president: "ਸੂਬਾ ਮੀਤ ਪ੍ਰਧਾਨ", state_president: "ਸੂਬਾ ਪ੍ਰਧਾਨ" };

  return (
    <div className="space-y-4">
      {changePwUser && <ChangePasswordDialog user={changePwUser} onClose={() => setChangePwUser(null)} />}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2"><UserCog className="h-5 w-5 text-primary" /> ਸਟਾਫ਼ ਯੂਜ਼ਰ ਮੈਨੇਜ ਕਰੋ</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
          {showForm ? <><X className="h-4 w-4" /> ਰੱਦ ਕਰੋ</> : <><Plus className="h-4 w-4" /> ਨਵਾਂ ਯੂਜ਼ਰ</>}
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">ਯੂਜ਼ਰਨੇਮ *</Label>
                <Input value={form.username} onChange={(e) => setForm(p => ({ ...p, username: e.target.value }))} placeholder="username" className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">ਪਾਸਵਰਡ *</Label>
                <div className="relative">
                  <Input type={showFormPw ? "text" : "password"} value={form.password}
                    onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="password" className="h-9 text-sm pr-9" />
                  <button type="button" onClick={() => setShowFormPw(p => !p)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showFormPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-1"><Label className="text-xs">ਅਸਲ ਨਾਮ *</Label><Input value={form.displayName} onChange={(e) => setForm(p => ({ ...p, displayName: e.target.value }))} placeholder="ਪੂਰਾ ਨਾਮ" className="h-9 text-sm" /></div>
            <div className="space-y-1"><Label className="text-xs">ਅਹੁਦਾ *</Label>
              <select value={form.role} onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))} className={selectCls}>
                <option value="state_meet_president">ਸੂਬਾ ਮੀਤ ਪ੍ਰਧਾਨ</option>
                <option value="state_president">ਸੂਬਾ ਪ੍ਰਧਾਨ</option>
                <option value="admin">ਐਡਮਿਨ</option>
              </select>
            </div>
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending || !form.username || !form.password || !form.displayName} className="w-full">
              {createMut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />ਬਣਾਇਆ ਜਾ ਰਿਹਾ...</> : <><UserPlus className="mr-2 h-4 w-4" />ਯੂਜ਼ਰ ਬਣਾਓ</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        : !users?.length ? <Card><CardContent className="text-center py-10 text-muted-foreground"><UserCog className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>ਕੋਈ ਸਟਾਫ਼ ਯੂਜ਼ਰ ਨਹੀਂ</p></CardContent></Card>
        : (
          <div className="space-y-2">
            {users.map((u) => (
              <Card key={u.id}>
                <CardContent className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{u.displayName}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">@{u.username} • {roleLabel[u.role] || u.role}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8"
                      onClick={() => setChangePwUser(u)}
                      data-testid={`button-change-password-${u.id}`}>
                      <KeyRound className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">ਪਾਸਵਰਡ</span>
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                      onClick={() => { if (confirm(`@${u.username} ਨੂੰ ਮਿਟਾਉਣਾ ਹੈ?`)) deleteMut.mutate(u.id); }}
                      data-testid={`button-delete-user-${u.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}

// ─── Direct Entry Form ───────────────────────────────────────
function DirectEntryForm({ role }: { role: StaffRole }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", designation: "ਮੈਂਬਰ", village: "", tehsil: "", district: "", areaType: "rural" as "rural" | "urban", wardNumber: "", mohalla: "", mobileNumber: "", aadhaarNumber: "" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const tehsilsForDistrict = PUNJAB_DISTRICTS.find(d => d.name === form.district)?.tehsils || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (photo) fd.append("photo", photo);
      const res = await fetch("/api/admin/registrations/direct", { method: "POST", body: fd, credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const isAdmin = role === "admin";
      toast({ title: "✓ ਐਂਟਰੀ ਸਫਲ!", description: isAdmin ? `Card: ${data.registration?.cardNumber}` : "Admin ਸਮੀਖਿਆ ਲਈ ਭੇਜਿਆ ਗਿਆ" });
      setForm({ name: "", designation: "ਮੈਂਬਰ", village: "", tehsil: "", district: "", areaType: "rural", wardNumber: "", mohalla: "", mobileNumber: "", aadhaarNumber: "" });
      setPhoto(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] });
    } catch (err: any) {
      toast({ title: "ਗਲਤੀ", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const textField = (label: string, key: keyof typeof form, placeholder = "") => (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <Input value={form[key] as string} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder || label} />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" /> ਸਿੱਧੀ ਐਂਟਰੀ ਪਾਓ
        </CardTitle>
        {role !== "admin" && <p className="text-xs text-muted-foreground mt-1">ਇਹ ਐਂਟਰੀ Admin ਦੀ ਸਮੀਖਿਆ ਲਈ ਜਾਵੇਗੀ।</p>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {textField("ਨਾਮ *", "name", "ਪੂਰਾ ਨਾਮ")}
            {textField("ਅਹੁਦਾ", "designation", "ਮੈਂਬਰ / ਪ੍ਰਧਾਨ...")}
            {textField("ਮੋਬਾਈਲ", "mobileNumber", "10 ਅੰਕ")}
            {textField("ਆਧਾਰ ਨੰਬਰ", "aadhaarNumber", "12 ਅੰਕ")}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">ਖੇਤਰ ਦੀ ਕਿਸਮ</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["rural", "urban"] as const).map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, areaType: t, wardNumber: "", mohalla: "" }))}
                  className={`py-2 rounded-md border text-sm font-medium transition-colors ${form.areaType === t ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-muted"}`}>
                  {t === "rural" ? "🌾 ਪੇਂਡੂ (Rural)" : "🏙️ ਸ਼ਹਿਰੀ (Urban)"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm">ਜ਼ਿਲ੍ਹਾ *</Label>
              <select value={form.district} onChange={(e) => setForm(f => ({ ...f, district: e.target.value, tehsil: "" }))} className={selectCls + " h-9"}>
                <option value="">ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ</option>
                {PUNJAB_DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">ਤਹਿਸੀਲ *</Label>
              <select value={form.tehsil} onChange={(e) => setForm(f => ({ ...f, tehsil: e.target.value }))} className={selectCls + " h-9"} disabled={!form.district}>
                <option value="">ਤਹਿਸੀਲ ਚੁਣੋ</option>
                {tehsilsForDistrict.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {textField(form.areaType === "urban" ? "ਸ਼ਹਿਰ/ਨਗਰ *" : "ਪਿੰਡ *", "village", form.areaType === "urban" ? "ਸ਼ਹਿਰ ਦਾ ਨਾਮ" : "ਪਿੰਡ ਦਾ ਨਾਮ")}

          {form.areaType === "urban" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {textField("ਵਾਰਡ ਨੰਬਰ (ਵਿਕਲਪਿਕ)", "wardNumber", "ਵਾਰਡ ਨੰਬਰ")}
              {textField("ਮੁਹੱਲਾ (ਵਿਕਲਪਿਕ)", "mohalla", "ਮੁਹੱਲਾ")}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm">ਫ਼ੋਟੋ</Label>
            <Input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
          </div>

          <Button type="submit" disabled={loading || !form.name || !form.village || !form.tehsil || !form.district} className="w-full bg-green-600 hover:bg-green-700">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />ਸੇਵ ਹੋ ਰਿਹਾ...</> : <><UserPlus className="mr-2 h-4 w-4" />{role === "admin" ? "ਐਂਟਰੀ ਸੇਵ ਕਰੋ (Approved)" : "ਐਂਟਰੀ ਭੇਜੋ (Admin ਸਮੀਖਿਆ)"}</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Updates Manager ────────────────────────────────────────
function UpdatesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: updates, isLoading } = useQuery<Update[]>({ queryKey: ["/api/updates"] });
  const [form, setForm] = useState({ title: "", content: "", eventDate: "" });
  const [image, setImage] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "", eventDate: "" });
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editRemoveImage, setEditRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title); fd.append("content", form.content);
      if (form.eventDate) fd.append("eventDate", form.eventDate);
      if (image) fd.append("image", image);
      const res = await fetch("/api/admin/updates", { method: "POST", body: fd, credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast({ title: "✓ ਅੱਪਡੇਟ ਪੋਸਟ ਕੀਤੀ!" });
      setForm({ title: "", content: "", eventDate: "" }); setImage(null); setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/updates"] });
    } catch (err: any) { toast({ title: "ਗਲਤੀ", description: err.message, variant: "destructive" }); }
    finally { setAdding(false); }
  };

  const startEdit = (u: Update) => {
    setEditingId(u.id);
    setEditForm({
      title: u.title,
      content: u.content,
      eventDate: u.eventDate ? new Date(u.eventDate).toISOString().split("T")[0] : "",
    });
    setEditImage(null);
    setEditRemoveImage(false);
    setShowForm(false);
  };

  const cancelEdit = () => { setEditingId(null); setEditImage(null); setEditRemoveImage(false); };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", editForm.title);
      fd.append("content", editForm.content);
      fd.append("eventDate", editForm.eventDate);
      if (editImage) fd.append("image", editImage);
      if (editRemoveImage) fd.append("removeImage", "true");
      const res = await fetch(`/api/admin/updates/${editingId}`, { method: "PUT", body: fd, credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast({ title: "✓ ਅੱਪਡੇਟ ਸੇਵ ਕੀਤੀ!" });
      cancelEdit();
      queryClient.invalidateQueries({ queryKey: ["/api/updates"] });
    } catch (err: any) { toast({ title: "ਗਲਤੀ", description: err.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const deleteMut = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(`/api/admin/updates/${id}`, { method: "DELETE", credentials: "include" }); return r.json(); },
    onSuccess: () => { toast({ title: "Delete ਕੀਤੀ" }); queryClient.invalidateQueries({ queryKey: ["/api/updates"] }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Newspaper className="h-5 w-5 text-primary" /> ਅੱਪਡੇਟਸ ਮੈਨੇਜ ਕਰੋ</h3>
        <Button size="sm" onClick={() => { setShowForm(!showForm); cancelEdit(); }} className="gap-1.5">
          {showForm ? <><X className="h-4 w-4" /> ਰੱਦ ਕਰੋ</> : <><Plus className="h-4 w-4" /> ਨਵੀਂ ਅੱਪਡੇਟ</>}
        </Button>
      </div>
      {showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-1.5"><Label>ਸਿਰਲੇਖ *</Label><Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="ਖ਼ਬਰ ਦਾ ਸਿਰਲੇਖ" required /></div>
              <div className="space-y-1.5"><Label>ਵੇਰਵਾ *</Label><Textarea value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))} placeholder="ਵਿਸਥਾਰ ਨਾਲ ਲਿਖੋ..." rows={4} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">ਘਟਨਾ ਦੀ ਤਾਰੀਖ਼</Label><Input type="date" value={form.eventDate} onChange={(e) => setForm(f => ({ ...f, eventDate: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label className="text-xs">ਫ਼ੋਟੋ</Label><Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} /></div>
              </div>
              <Button type="submit" disabled={adding || !form.title || !form.content} className="w-full">
                {adding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />ਪੋਸਟ ਹੋ ਰਿਹਾ...</> : <><Plus className="mr-2 h-4 w-4" />ਅੱਪਡੇਟ ਪੋਸਟ ਕਰੋ</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        : !updates?.length ? <Card><CardContent className="text-center py-10 text-muted-foreground"><Newspaper className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>ਕੋਈ ਅੱਪਡੇਟ ਨਹੀਂ</p></CardContent></Card>
        : (
          <div className="space-y-3">
            {updates.map((u) => (
              <Card key={u.id} className="overflow-hidden">
                <CardContent className="p-4">
                  {editingId === u.id ? (
                    <form onSubmit={handleEdit} className="space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-primary">✏️ ਅੱਪਡੇਟ ਸੋਧੋ</p>
                        <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}><X className="h-4 w-4" /></Button>
                      </div>
                      <div className="space-y-1.5"><Label className="text-xs">ਸਿਰਲੇਖ *</Label><Input value={editForm.title} onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} placeholder="ਖ਼ਬਰ ਦਾ ਸਿਰਲੇਖ" required /></div>
                      <div className="space-y-1.5"><Label className="text-xs">ਵੇਰਵਾ *</Label><Textarea value={editForm.content} onChange={(e) => setEditForm(f => ({ ...f, content: e.target.value }))} placeholder="ਵਿਸਥਾਰ ਨਾਲ ਲਿਖੋ..." rows={4} required /></div>
                      <div className="space-y-1.5"><Label className="text-xs">ਘਟਨਾ ਦੀ ਤਾਰੀਖ਼</Label><Input type="date" value={editForm.eventDate} onChange={(e) => setEditForm(f => ({ ...f, eventDate: e.target.value }))} /></div>
                      <div className="space-y-2">
                        <Label className="text-xs">ਫ਼ੋਟੋ</Label>
                        {u.imageUrl && !editRemoveImage && !editImage && (
                          <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                            <img src={u.imageUrl} alt="" className="w-12 h-12 rounded object-cover border" />
                            <div className="flex-1 text-xs text-muted-foreground">ਮੌਜੂਦਾ ਫ਼ੋਟੋ</div>
                            <Button type="button" size="sm" variant="ghost" className="text-destructive text-xs h-7" onClick={() => setEditRemoveImage(true)}>ਹਟਾਓ</Button>
                          </div>
                        )}
                        {editRemoveImage && <p className="text-xs text-destructive">ਫ਼ੋਟੋ ਹਟਾਈ ਜਾਵੇਗੀ</p>}
                        {editImage && <p className="text-xs text-green-600">ਨਵੀਂ ਫ਼ੋਟੋ ਚੁਣੀ: {editImage.name}</p>}
                        <Input type="file" accept="image/*" onChange={(e) => { setEditImage(e.target.files?.[0] || null); setEditRemoveImage(false); }} />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={saving || !editForm.title || !editForm.content} className="flex-1">
                          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />ਸੇਵ ਹੋ ਰਿਹਾ...</> : "✓ ਸੇਵ ਕਰੋ"}
                        </Button>
                        <Button type="button" variant="outline" onClick={cancelEdit}>ਰੱਦ</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1"><p className="font-semibold truncate">{u.title}</p>{u.imageUrl && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">📷</span>}</div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{u.content}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">{u.eventDate && `ਘਟਨਾ: ${new Date(u.eventDate).toLocaleDateString("pa-IN")} • `}ਪੋਸਟ: {new Date(u.createdAt!).toLocaleDateString("pa-IN")}</p>
                      </div>
                      {u.imageUrl && <img src={u.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border" />}
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10" onClick={() => startEdit(u)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => deleteMut.mutate(u.id)} disabled={deleteMut.isPending}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}

// ─── Analytics Dashboard ─────────────────────────────────────
function AnalyticsDashboard() {
  const [days, setDays] = useState(7);
  const [customDays, setCustomDays] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const { data, isLoading } = useQuery<{ pageStats: { page: string; count: number }[]; totalVisits: number; todayVisits: number; dailyData: { date: string; count: number }[]; days: number }>({
    queryKey: ["/api/admin/analytics", days],
    queryFn: () => fetch(`/api/admin/analytics?days=${days}`, { credentials: "include" }).then(r => r.json())
  });

  const pageLabels: Record<string, string> = { "/": "ਮੁੱਖ ਪੰਨਾ", "/about": "ਯੂਨੀਅਨ ਬਾਰੇ", "/updates": "ਤਾਜ਼ੀਆਂ ਖ਼ਬਰਾਂ", "/contact": "ਰਜਿਸਟ੍ਰੇਸ਼ਨ", "/track": "ਟਰੈਕਿੰਗ", "/verify": "Card ਤਸਦੀਕ", "/admin": "ਐਡਮਿਨ" };
  const maxPageCount = data?.pageStats?.[0]?.count || 1;
  const dailyMax = Math.max(...(data?.dailyData?.map(d => d.count) ?? [1]), 1);
  const periodTotal = data?.dailyData?.reduce((s, d) => s + d.count, 0) ?? 0;
  const presets = [{ label: "ਅੱਜ", value: 1 }, { label: "7 ਦਿਨ", value: 7 }, { label: "30 ਦਿਨ", value: 30 }, { label: "ਆਪਣੇ ਆਪ", value: 0 }];

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 pb-3 text-center"><Globe className="h-5 w-5 text-primary mx-auto mb-1" /><p className="text-xs text-muted-foreground">ਕੁੱਲ ਵਿਜ਼ਿਟ</p><div className="text-2xl font-bold text-primary">{(data?.totalVisits ?? 0).toLocaleString()}</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><TrendingUp className="h-5 w-5 text-green-500 mx-auto mb-1" /><p className="text-xs text-muted-foreground">ਅੱਜ</p><div className="text-2xl font-bold text-green-600">{(data?.todayVisits ?? 0).toLocaleString()}</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><BarChart2 className="h-5 w-5 text-blue-500 mx-auto mb-1" /><p className="text-xs text-muted-foreground">{days === 1 ? "ਅੱਜ" : `${days} ਦਿਨ`}</p><div className="text-2xl font-bold text-blue-600">{periodTotal.toLocaleString()}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" /> ਰੋਜ਼ਾਨਾ ਵਿਜ਼ਿਟ</CardTitle>
            <div className="flex flex-wrap gap-1.5">
              {presets.map(p => (
                <button key={p.value} onClick={() => { if (p.value === 0) { setShowCustom(true); return; } setShowCustom(false); setDays(p.value); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${days === p.value && !showCustom ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {showCustom && (
            <div className="flex items-center gap-2 mt-2">
              <input type="number" value={customDays} onChange={e => setCustomDays(e.target.value)} placeholder="1-365 ਦਿਨ" className="flex-1 border border-input rounded-md px-3 py-1.5 text-sm" min="1" max="365" />
              <button onClick={() => { const n = parseInt(customDays); if (n > 0 && n <= 365) { setDays(n); setShowCustom(false); } }} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium">ਲਾਗੂ</button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {!data?.dailyData?.length ? <p className="text-center text-muted-foreground py-8">ਇਸ ਸਮੇਂ ਲਈ ਕੋਈ ਡੇਟਾ ਨਹੀਂ</p>
            : <div className="space-y-2">
              {data.dailyData.map((row) => {
                const d = new Date(row.date + "T00:00:00"); const isToday = new Date().toDateString() === d.toDateString();
                return (
                  <div key={row.date} className="flex items-center gap-3">
                    <span className={`text-xs w-20 shrink-0 font-mono ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>{isToday ? "ਅੱਜ" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                    <div className="flex-1 h-5 bg-muted rounded overflow-hidden"><div className={`h-full rounded transition-all ${isToday ? "bg-primary" : "bg-green-500"}`} style={{ width: `${Math.max(Math.round((row.count / dailyMax) * 100), 2)}%` }} /></div>
                    <span className={`text-xs font-bold w-8 text-right ${isToday ? "text-primary" : "text-muted-foreground"}`}>{row.count}</span>
                  </div>
                );
              })}
            </div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart2 className="h-4 w-4 text-primary" /> ਪੰਨੇ ਅਨੁਸਾਰ ਵਿਜ਼ਿਟ</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {!data?.pageStats?.length ? <p className="text-center text-muted-foreground py-6">ਅਜੇ ਕੋਈ ਡੇਟਾ ਨਹੀਂ</p>
            : data.pageStats.map((row) => (
              <div key={row.page}>
                <div className="flex justify-between text-sm mb-1"><span className="font-medium">{pageLabels[row.page] ?? row.page}</span><span className="text-muted-foreground font-mono font-bold">{row.count.toLocaleString()}</span></div>
                <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${Math.round((row.count / maxPageCount) * 100)}%` }} /></div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────
export default function Admin() {
  const { isLoading: authLoading, isAuthenticated, needsPin, logout, role, displayName, isAdminRole } = useAuth();
  const { data: registrations, isLoading } = useRegistrations();
  const downloadAll = useDownloadRegistrations();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/admin/dashboard-stats"],
    queryFn: () => fetch("/api/admin/dashboard-stats", { credentials: "include" }).then(r => r.json()),
    enabled: isAuthenticated,
  });

  const { data: deleteRequests } = useQuery<DeleteRequest[]>({
    queryKey: ["/api/admin/delete-requests"],
    queryFn: () => fetch("/api/admin/delete-requests", { credentials: "include" }).then(r => r.json()),
    enabled: isAuthenticated,
  });
  const pendingDeleteCount = deleteRequests?.filter(r => r.status === "pending").length || 0;

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (needsPin) return <PinForm />;
  if (!isAuthenticated) return <LoginForm />;

  const allRegs = registrations || [];
  const allPending = allRegs.filter(r => r.status === "pending");
  const approved = allRegs.filter(r => r.status === "approved");
  const rejected = allRegs.filter(r => r.status === "rejected");

  const myPending = role === "state_meet_president"
    ? allPending.filter(r => (r.currentStage || "submitted") === "submitted")
    : role === "state_president"
      ? allPending.filter(r => (r.currentStage || "submitted") === "state_president_review")
      : allPending;

  const filteredApproved = approved.filter(r =>
    !search ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.village.toLowerCase().includes(search.toLowerCase()) ||
    (r.mobileNumber || "").includes(search) ||
    (r.cardNumber || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.trackingId || "").toLowerCase().includes(search.toLowerCase())
  );

  const roleLabel: Record<string, string> = {
    admin: "ਐਡਮਿਨ",
    state_meet_president: "ਸੂਬਾ ਮੀਤ ਪ੍ਰਧਾਨ",
    state_president: "ਸੂਬਾ ਪ੍ਰਧਾਨ",
  };

  const overviewStats = isAdminRole
    ? [
        { label: "ਕੁੱਲ", value: isLoading ? "..." : allRegs.length, color: "text-primary" },
        { label: "Pending", value: isLoading ? "..." : allPending.length, color: "text-amber-500" },
        { label: "Approved", value: isLoading ? "..." : approved.length, color: "text-green-600" },
        { label: "Card ਜਾਰੀ", value: isLoading ? "..." : (stats?.cardIssued ?? "..."), color: "text-blue-500" },
        { label: "ਰੱਦ", value: isLoading ? "..." : rejected.length, color: "text-red-500" },
      ]
    : [
        { label: "ਮੇਰੀ ਸਮੀਖਿਆ", value: isLoading ? "..." : myPending.length, color: "text-amber-500" },
        { label: "Approved ਮੈਂਬਰ", value: isLoading ? "..." : approved.length, color: "text-green-600" },
        { label: "Delete ਬੇਨਤੀਆਂ", value: pendingDeleteCount, color: "text-orange-500" },
        { label: "ਕੁੱਲ ਮੈਂਬਰ", value: isLoading ? "..." : allRegs.length, color: "text-primary" },
      ];

  const pendingTabLabel = isAdminRole ? "ਸਮੀਖਿਆ" : "ਮੇਰੀ ਸਮੀਖਿਆ";

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full"><ShieldCheck className="h-7 w-7 text-primary" /></div>
            <div>
              <h1 className="text-2xl font-display font-bold">ਪ੍ਰਸ਼ਾਸਕ ਪੈਨਲ</h1>
              <p className="text-sm text-muted-foreground">{displayName} • {roleLabel[role || ""] || role}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => logout()} data-testid="button-logout">
            <LogOut className="h-4 w-4 mr-2" /> ਲੌਗ ਆਊਟ
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {overviewStats.map((s) => (
            <Card key={s.label}><CardContent className="pt-4 pb-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            </CardContent></Card>
          ))}
        </div>

        <Tabs defaultValue="pending">
          <TabsList className={`grid mb-6 h-auto ${isAdminRole ? "grid-cols-4 md:grid-cols-8" : "grid-cols-4"}`}>
            <TabsTrigger value="pending" className="flex items-center gap-1 py-2.5 text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{pendingTabLabel}</span>
              {myPending.length > 0 && <span className="ml-0.5 bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">{myPending.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-1 py-2.5 text-xs">
              <Users className="h-3.5 w-3.5" /><span className="hidden sm:inline">ਮੈਂਬਰ</span>
            </TabsTrigger>
            <TabsTrigger value="direct" className="flex items-center gap-1 py-2.5 text-xs">
              <UserPlus className="h-3.5 w-3.5" /><span className="hidden sm:inline">ਐਂਟਰੀ</span>
            </TabsTrigger>
            <TabsTrigger value="delreq" className="flex items-center gap-1 py-2.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ਬੇਨਤੀਆਂ</span>
              {pendingDeleteCount > 0 && <span className="ml-0.5 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">{pendingDeleteCount}</span>}
            </TabsTrigger>
            {isAdminRole && (
              <>
                <TabsTrigger value="users" className="flex items-center gap-1 py-2.5 text-xs">
                  <UserCog className="h-3.5 w-3.5" /><span className="hidden sm:inline">ਸਟਾਫ਼</span>
                </TabsTrigger>
                <TabsTrigger value="updates" className="flex items-center gap-1 py-2.5 text-xs">
                  <Newspaper className="h-3.5 w-3.5" /><span className="hidden sm:inline">ਖ਼ਬਰਾਂ</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-1 py-2.5 text-xs">
                  <BarChart2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Stats</span>
                </TabsTrigger>
                <TabsTrigger value="download" className="flex items-center gap-1 py-2.5 text-xs">
                  <Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">ਡਾਊਨਲੋਡ</span>
                </TabsTrigger>
                <TabsTrigger value="cardtemplate" className="flex items-center gap-1 py-2.5 text-xs">
                  <CreditCard className="h-3.5 w-3.5" /><span className="hidden sm:inline">ਟੈਂਪਲੇਟ</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* ── Pending Tab ─────────────────────────── */}
          <TabsContent value="pending">
            {isLoading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              : !myPending.length ? (
                <Card><CardContent className="text-center py-16 text-muted-foreground">
                  <CheckCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>ਕੋਈ ਪੈਂਡਿੰਗ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ</p>
                  <p className="text-sm mt-1">ਤੁਹਾਡੀ ਸਮੀਖਿਆ ਲਈ ਕੁਝ ਨਹੀਂ ਹੈ</p>
                </CardContent></Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myPending.map((reg) => (
                    <motion.div key={reg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <PendingCard reg={reg} userRole={role} />
                    </motion.div>
                  ))}
                </div>
              )}
          </TabsContent>

          {/* ── Members Tab ─────────────────────────── */}
          <TabsContent value="approved">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Input placeholder="ਖੋਜੋ — ਨਾਮ, ਪਿੰਡ, ਮੋਬਾਈਲ, Card No, TRK-..."
                value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" data-testid="input-search" />
              <div className="flex gap-1 border rounded-md p-0.5 bg-muted/40 self-start">
                <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-white shadow text-primary" : "text-muted-foreground hover:text-foreground"}`} title="Grid ਵਿਊ">
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-white shadow text-primary" : "text-muted-foreground hover:text-foreground"}`} title="ਵੱਡਾ ਕਾਰਡ ਵਿਊ">
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
            {isLoading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              : !filteredApproved.length ? (
                <Card><CardContent className="text-center py-16 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-40" /><p>{search ? "ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ" : "ਕੋਈ Approved ਮੈਂਬਰ ਨਹੀਂ"}</p>
                </CardContent></Card>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredApproved.map((reg) => (
                    <motion.div key={reg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <MemberCard reg={reg} isAdminRole={isAdminRole} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredApproved.map((reg) => (
                    <motion.div key={reg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <MemberCardLarge reg={reg} isAdminRole={isAdminRole} />
                    </motion.div>
                  ))}
                </div>
              )}
          </TabsContent>

          {/* ── Direct Entry Tab ────────────────────── */}
          <TabsContent value="direct">
            <DirectEntryForm role={role} />
          </TabsContent>

          {/* ── Delete Requests Tab ─────────────────── */}
          <TabsContent value="delreq">
            <DeleteRequestsPanel isAdminRole={isAdminRole} />
          </TabsContent>

          {/* ── Admin-only tabs ──────────────────────── */}
          {isAdminRole && (
            <>
              <TabsContent value="users">
                <UserManagementPanel />
              </TabsContent>
              <TabsContent value="updates">
                <UpdatesManager />
              </TabsContent>
              <TabsContent value="analytics">
                <AnalyticsDashboard />
              </TabsContent>
              <TabsContent value="cardtemplate">
                <CardTemplateSettings />
              </TabsContent>
              <TabsContent value="download">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* CSV Export */}
                  <Card className="border-green-200">
                    <CardContent className="py-8 text-center space-y-4">
                      <div className="h-14 w-14 mx-auto bg-green-50 rounded-full flex items-center justify-center">
                        <Download className="h-7 w-7 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">CSV / Excel ਡਾਊਨਲੋਡ</p>
                        <p className="text-sm text-muted-foreground mt-1">ਸਾਰੇ {registrations?.length || 0} ਮੈਂਬਰਾਂ ਦਾ ਡਾਟਾ Excel ਵਿੱਚ</p>
                      </div>
                      <Button
                        variant="outline"
                        className="gap-2 border-green-300 text-green-700 hover:bg-green-50"
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = "/api/admin/registrations/export-csv";
                          a.download = `members_${new Date().toISOString().slice(0, 10)}.csv`;
                          a.click();
                        }}
                      >
                        <Download className="h-4 w-4" />
                        CSV ਡਾਊਨਲੋਡ ({registrations?.length || 0} ਮੈਂਬਰ)
                      </Button>
                      <p className="text-xs text-muted-foreground">Excel / Google Sheets ਵਿੱਚ ਖੁੱਲ੍ਹੇਗੀ</p>
                    </CardContent>
                  </Card>

                  {/* ZIP Download */}
                  <Card className="border-blue-200">
                    <CardContent className="py-8 text-center space-y-4">
                      <div className="h-14 w-14 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                        <Download className="h-7 w-7 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">ID Cards ZIP ਡਾਊਨਲੋਡ</p>
                        <p className="text-sm text-muted-foreground mt-1">ਸਾਰੇ {approved.length} Approved ਮੈਂਬਰਾਂ ਦੇ ID Cards</p>
                      </div>
                      <Button
                        onClick={() => downloadAll.mutate()}
                        disabled={downloadAll.isPending || !approved.length}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        {downloadAll.isPending
                          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />ਡਾਊਨਲੋਡ ਹੋ ਰਿਹਾ...</>
                          : <><Download className="h-4 w-4" />ZIP ਡਾਊਨਲੋਡ ({approved.length})</>}
                      </Button>
                      <p className="text-xs text-muted-foreground">ਫ਼ੋਟੋ ਅਤੇ ਵੇਰਵਿਆਂ ਸਮੇਤ</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </motion.div>
    </div>
  );
}
