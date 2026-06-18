import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRegistrations, useDeleteRegistration, useDownloadRegistrations } from "@/hooks/use-registration";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Download, Trash2, Loader2, LogOut, Users, ShieldCheck,
  Eye, EyeOff, Lock, QrCode, CheckCircle, Calendar, AlertTriangle,
  MapPin, Phone, CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import type { Registration } from "@shared/schema";

// ─── Login Form ────────────────────────────────────────────
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-3 pb-4">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-display">ਪ੍ਰਸ਼ਾਸਕ ਲੌਗਇਨ</CardTitle>
            <p className="text-sm text-muted-foreground">ਕਿਸਾਨ ਯੂਨੀਅਨ ਪੰਜਾਬ</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">ਯੂਜ਼ਰਨੇਮ</Label>
                <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="ਯੂਜ਼ਰਨੇਮ ਦਰਜ ਕਰੋ" required data-testid="input-username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">ਪਾਸਵਰਡ</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ"
                    required data-testid="input-password" className="pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {loginError && <p className="text-sm text-destructive text-center">ਗਲਤ ਯੂਜ਼ਰਨੇਮ ਜਾਂ ਪਾਸਵਰਡ</p>}
              <Button type="submit" className="w-full" disabled={isLoggingIn} data-testid="button-login">
                {isLoggingIn ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />ਲੌਗਇਨ...</> : "ਲੌਗਇਨ ਕਰੋ"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ─── QR Code Panel ─────────────────────────────────────────
function QRPanel({ qrDataUrl, reg }: { qrDataUrl: string; reg: Registration }) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrintQR = () => {
    const win = window.open("", "_blank", "width=400,height=500");
    if (!win || !printRef.current) return;
    win.document.write(`
      <html><head><title>QR — ${reg.name}</title>
      <style>
        body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; font-family: sans-serif; }
        .wrap { text-align: center; padding: 24px; }
        .qr-img { width: 200px; height: 200px; display: block; margin: 0 auto 12px; }
        .card-no { font-size: 11px; font-family: monospace; color: #15803d; font-weight: bold; letter-spacing: 0.1em; }
        .name { font-size: 14px; font-weight: 700; color: #111; margin: 4px 0; }
        .org { font-size: 10px; color: #6b7280; margin-top: 8px; }
      </style>
      </head><body>
        <div class="wrap">
          <img class="qr-img" src="${qrDataUrl}" />
          <p class="card-no">${reg.cardNumber}</p>
          <p class="name">${reg.name}</p>
          <p class="org">ਕਿਸਾਨ ਮਜ਼ਦੂਰ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ</p>
        </div>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR-${reg.cardNumber}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center gap-4" ref={printRef}>
      {/* QR Code */}
      <div className="bg-white rounded-2xl p-5 shadow-lg border border-green-100 flex flex-col items-center gap-3">
        <img src={qrDataUrl} alt="QR Code" className="w-52 h-52" />
        <div className="text-center">
          <p className="text-xs font-mono font-bold text-green-700 tracking-widest">{reg.cardNumber}</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">{reg.name}</p>
          <p className="text-xs text-gray-500">{reg.designation}</p>
        </div>
        <div className="w-full border-t border-gray-100 pt-2 text-center">
          <p className="text-xs text-gray-400">Scan to Verify • ਕਿਸਾਨ ਮਜ਼ਦੂਰ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 w-full">
        <Button onClick={handleDownload} className="flex-1 bg-green-600 hover:bg-green-700" data-testid="button-download-qr">
          <Download className="mr-2 h-4 w-4" /> PNG ਡਾਊਨਲੋਡ
        </Button>
        <Button onClick={handlePrintQR} variant="outline" className="flex-1" data-testid="button-print-qr">
          🖨️ Print ਕਰੋ
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        ਇਸ QR ਨੂੰ Photoshop card ਤੇ ਲਾਓ — scan ਕਰਨ ਤੇ verification page ਖੁੱਲ੍ਹੇਗਾ
      </p>
    </div>
  );
}

// ─── Issue Card Dialog ─────────────────────────────────────
function IssueCardDialog({ reg }: { reg: Registration }) {
  const [open, setOpen] = useState(false);
  const [validFrom, setValidFrom] = useState(() => new Date().toISOString().split("T")[0]);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date(); d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  });
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [issuedReg, setIssuedReg] = useState<Registration | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleIssue = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("POST", `/api/admin/registrations/${reg.id}/issue-card`, { validFrom, validUntil });
      const data = await res.json();
      setQrDataUrl(data.qrDataUrl);
      setIssuedReg(data.registration);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] });
      toast({ title: "Card Issue ਹੋ ਗਿਆ ✓", description: `Card No: ${data.registration.cardNumber}` });
    } catch {
      toast({ title: "ਗਲਤੀ", description: "Card issue ਕਰਨ ਵਿੱਚ ਸਮੱਸਿਆ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const close = () => { setOpen(false); setQrDataUrl(null); setIssuedReg(null); };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(); setOpen(o); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white w-full" data-testid={`button-issue-${reg.id}`}>
          <QrCode className="h-3.5 w-3.5" />
          {reg.cardNumber ? "QR ਨਵਿਆਓ" : "QR ਬਣਾਓ"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-green-700" />
            {qrDataUrl ? "QR Code ਤਿਆਰ ਹੈ" : "Card Issue ਕਰੋ"}
          </DialogTitle>
        </DialogHeader>

        {qrDataUrl && issuedReg ? (
          <QRPanel qrDataUrl={qrDataUrl} reg={issuedReg} />
        ) : (
          <div className="space-y-4">
            {/* Member Info */}
            <div className="bg-muted/40 rounded-lg p-3 flex items-center gap-3">
              <Avatar className="h-14 w-14 border-2 border-primary/20">
                {reg.photoUrl ? <AvatarImage src={reg.photoUrl} />
                  : reg.photoData ? <AvatarImage src={`data:${reg.photoMimeType};base64,${reg.photoData}`} />
                  : null}
                <AvatarFallback className="text-lg font-bold">{reg.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-base">{reg.name}</p>
                <p className="text-sm text-muted-foreground">{reg.designation}</p>
                <p className="text-xs text-muted-foreground">{reg.village}, {reg.district}</p>
                {reg.cardNumber && <p className="text-xs font-mono text-green-700 mt-0.5 font-semibold">{reg.cardNumber}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Card Validity ਸੈੱਟ ਕਰੋ:</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Valid From</Label>
                  <Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Valid Until</Label>
                  <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
                </div>
              </div>
            </div>

            <Button onClick={handleIssue} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />QR ਬਣ ਰਿਹਾ ਹੈ...</>
                : <><QrCode className="mr-2 h-4 w-4" />QR Code ਬਣਾਓ</>}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── View QR Dialog (existing card) ────────────────────────
function ViewQRDialog({ reg }: { reg: Registration }) {
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadQR = async () => {
    if (qrDataUrl) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations/${reg.id}/qr`, { credentials: "include" });
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = (e) => setQrDataUrl(e.target?.result as string);
      reader.readAsDataURL(blob);
    } catch { } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) loadQR(); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 w-full" data-testid={`button-view-qr-${reg.id}`}>
          <Eye className="h-3.5 w-3.5" /> QR ਦੇਖੋ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code — {reg.name}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
        ) : qrDataUrl ? (
          <QRPanel qrDataUrl={qrDataUrl} reg={reg} />
        ) : (
          <p className="text-center text-muted-foreground py-8">QR load ਨਹੀਂ ਹੋਇਆ</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Member Card ────────────────────────────────────────────
function MemberCard({ reg }: { reg: Registration }) {
  const deleteRegistration = useDeleteRegistration();
  const isExpired = reg.validUntil && new Date(reg.validUntil) < new Date();
  const isActive = reg.validFrom && reg.validUntil
    && new Date() >= new Date(reg.validFrom) && new Date() <= new Date(reg.validUntil);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-14 w-14 flex-shrink-0 border-2 border-muted">
            {reg.photoUrl ? <AvatarImage src={reg.photoUrl} />
              : reg.photoData ? <AvatarImage src={`data:${reg.photoMimeType};base64,${reg.photoData}`} />
              : null}
            <AvatarFallback className="text-xl font-bold">{reg.name[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold leading-tight">{reg.name}</p>
                <p className="text-sm text-muted-foreground">{reg.designation}</p>
              </div>
              <div className="flex-shrink-0">
                {isActive
                  ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium"><CheckCircle className="h-3 w-3" /> Active</span>
                  : isExpired
                  ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium"><AlertTriangle className="h-3 w-3" /> Expired</span>
                  : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">Pending</span>}
              </div>
            </div>

            <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 flex-shrink-0" />{reg.village}, {reg.tehsil}, {reg.district}</div>
              {reg.mobileNumber && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 flex-shrink-0" /><span className="font-mono">{reg.mobileNumber}</span></div>}
              {reg.cardNumber && <div className="flex items-center gap-1.5"><CreditCard className="h-3 w-3 flex-shrink-0" /><span className="font-mono text-green-700 font-semibold">{reg.cardNumber}</span></div>}
              {reg.validFrom && reg.validUntil && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  {new Date(reg.validFrom).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} → {new Date(reg.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <IssueCardDialog reg={reg} />
          {reg.cardNumber && reg.validFrom && <ViewQRDialog reg={reg} />}
        </div>
        <div className="mt-2">
          <Button size="sm" variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
            onClick={() => deleteRegistration.mutate(reg.id)} disabled={deleteRegistration.isPending}
            data-testid={`button-delete-${reg.id}`}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> ਮਿਟਾਓ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Admin Panel ──────────────────────────────────────
export default function Admin() {
  const { isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { data: registrations, isLoading, error } = useRegistrations();
  const downloadAll = useDownloadRegistrations();
  const [search, setSearch] = useState("");

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAuthenticated) return <LoginForm />;

  const totalCards = registrations?.length || 0;
  const activeCards = registrations?.filter(r => r.validFrom && r.validUntil && new Date() >= new Date(r.validFrom) && new Date() <= new Date(r.validUntil)).length || 0;
  const expiredCards = registrations?.filter(r => r.validUntil && new Date(r.validUntil) < new Date()).length || 0;

  const filtered = registrations?.filter(r =>
    !search ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.village.toLowerCase().includes(search.toLowerCase()) ||
    r.district.toLowerCase().includes(search.toLowerCase()) ||
    (r.mobileNumber || "").includes(search) ||
    (r.cardNumber || "").toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full"><ShieldCheck className="h-7 w-7 text-primary" /></div>
            <div>
              <h1 className="text-2xl font-display font-bold">ਪ੍ਰਸ਼ਾਸਕ ਪੈਨਲ</h1>
              <p className="text-sm text-muted-foreground">ਕਿਸਾਨ ਯੂਨੀਅਨ ਪੰਜਾਬ</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => logout()} data-testid="button-logout">
            <LogOut className="h-4 w-4 mr-2" /> ਲੌਗ ਆਊਟ
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "ਕੁੱਲ ਮੈਂਬਰ", value: isLoading ? "..." : totalCards, color: "text-primary" },
            { label: "Active", value: isLoading ? "..." : activeCards, color: "text-green-600" },
            { label: "Expired", value: isLoading ? "..." : expiredCards, color: "text-orange-500" },
            { label: "Pending QR", value: isLoading ? "..." : totalCards - activeCards - expiredCards, color: "text-blue-500" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search + Download */}
        <Card className="mb-6">
          <CardContent className="pt-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input placeholder="ਖੋਜੋ — ਨਾਮ, ਪਿੰਡ, ਮੋਬਾਈਲ, Card No..."
                value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" data-testid="input-search" />
              <Button onClick={() => downloadAll.mutate()} disabled={downloadAll.isPending || !registrations?.length}
                variant="outline" className="flex-shrink-0" data-testid="button-download-all">
                {downloadAll.isPending
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />ਡਾਊਨਲੋਡ...</>
                  : <><Download className="mr-2 h-4 w-4" />ZIP ਡਾਊਨਲੋਡ ({totalCards})</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Member Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> ਮੈਂਬਰ ਸੂਚੀ
            </h2>
            {search && <p className="text-sm text-muted-foreground">{filtered.length} ਮਿਲੇ</p>}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : error ? (
            <Card><CardContent className="text-center py-12 text-destructive">ਡਾਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ</CardContent></Card>
          ) : !filtered.length ? (
            <Card>
              <CardContent className="text-center py-16 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>{search ? "ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ" : "ਕੋਈ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ"}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((reg) => (
                <motion.div key={reg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <MemberCard reg={reg} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
