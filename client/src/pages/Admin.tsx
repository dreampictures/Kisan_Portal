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
  MapPin, Phone, CreditCard, Printer, Shield,
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

// ─── Printable ID Card ─────────────────────────────────────
function IDCard({ reg, qrDataUrl }: { reg: Registration; qrDataUrl?: string | null }) {
  const fmtDate = (d: Date | string | null) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A";

  const isActive = reg.validFrom && reg.validUntil
    && new Date() >= new Date(reg.validFrom) && new Date() <= new Date(reg.validUntil);
  const isExpired = reg.validUntil && new Date(reg.validUntil) < new Date();

  return (
    <div style={{ width: "340px", fontFamily: "sans-serif", borderRadius: "14px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", border: "1px solid #d1fae5" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)", padding: "14px 16px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -12, left: -12, width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "50%", padding: 8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fde047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, margin: 0, lineHeight: 1.3 }}>ਕਿਸਾਨ ਮਜ਼ਦੂਰ ਸੰਘਰਸ਼ ਕਮੇਟੀ</p>
            <p style={{ color: "#86efac", fontSize: 10, margin: 0 }}>ਪੰਜਾਬ — ਮੈਂਬਰਸ਼ਿਪ ਕਾਰਡ</p>
          </div>
        </div>
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
          <p style={{ color: "#fde047", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.12em", margin: 0, fontWeight: 700 }}>
            {reg.cardNumber || "PENDING"}
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ background: "#fff", display: "flex" }}>
        {/* Photo */}
        <div style={{ background: "#f0fdf4", padding: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRight: "1px solid #d1fae5", minWidth: 100 }}>
          {reg.photoUrl ? (
            <img src={reg.photoUrl} alt={reg.name}
              style={{ width: 80, height: 96, objectFit: "cover", borderRadius: 10, border: "2px solid #bbf7d0", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
          ) : reg.photoData ? (
            <img src={`data:${reg.photoMimeType};base64,${reg.photoData}`} alt={reg.name}
              style={{ width: 80, height: 96, objectFit: "cover", borderRadius: 10, border: "2px solid #bbf7d0" }} />
          ) : (
            <div style={{ width: 80, height: 96, borderRadius: 10, background: "#bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700, color: "#15803d" }}>
              {reg.name[0]}
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div>
            <p style={{ fontSize: 9, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 1px" }}>ਨਾਮ / Name</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.2 }}>{reg.name}</p>
          </div>
          <div>
            <p style={{ fontSize: 9, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 1px" }}>ਅਹੁਦਾ</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#15803d", margin: 0 }}>{reg.designation || "ਮੈਂਬਰ"}</p>
          </div>
          <div>
            <p style={{ fontSize: 9, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 1px" }}>ਪਤਾ</p>
            <p style={{ fontSize: 10, color: "#374151", margin: 0, lineHeight: 1.4 }}>{reg.village}, {reg.tehsil}</p>
            <p style={{ fontSize: 10, color: "#374151", margin: 0 }}>{reg.district}</p>
          </div>
          {reg.mobileNumber && (
            <div>
              <p style={{ fontSize: 9, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 1px" }}>ਮੋਬਾਈਲ</p>
              <p style={{ fontSize: 10, fontFamily: "monospace", color: "#374151", margin: 0 }}>{reg.mobileNumber}</p>
            </div>
          )}
        </div>
      </div>

      {/* Validity + QR */}
      <div style={{ background: isActive ? "#f0fdf4" : isExpired ? "#fff7ed" : "#f9fafb", borderTop: "1px solid #d1fae5", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 9, fontWeight: 700,
            background: isActive ? "#dcfce7" : isExpired ? "#ffedd5" : "#f3f4f6",
            color: isActive ? "#15803d" : isExpired ? "#c2410c" : "#6b7280",
            marginBottom: 4
          }}>
            {isActive ? "✓ VALID" : isExpired ? "⚠ EXPIRED" : "● PENDING"}
          </div>
          <p style={{ fontSize: 9, color: "#6b7280", margin: 0 }}>
            {reg.validFrom ? fmtDate(reg.validFrom) : "—"}
            <br />{reg.validUntil ? `→ ${fmtDate(reg.validUntil)}` : ""}
          </p>
          {reg.aadhaarNumber && (
            <p style={{ fontSize: 9, color: "#9ca3af", margin: "4px 0 0", fontFamily: "monospace" }}>
              Aadhar: ****{reg.aadhaarNumber.slice(-4)}
            </p>
          )}
        </div>
        {qrDataUrl && (
          <div style={{ background: "#fff", padding: 4, borderRadius: 8, border: "1px solid #d1fae5", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <img src={qrDataUrl} alt="QR" style={{ width: 70, height: 70, display: "block" }} />
            <p style={{ fontSize: 7, color: "#9ca3af", textAlign: "center", margin: "2px 0 0" }}>Scan to Verify</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: "#111827", padding: "6px 14px", textAlign: "center" }}>
        <p style={{ fontSize: 8, color: "#6b7280", margin: 0 }}>Kisan Mazdoor Sangharsh Committee Punjab • kisan-union-punjab.fly.dev</p>
      </div>
    </div>
  );
}

// ─── Issue Card + ID Card Dialog ───────────────────────────
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
  const [showCard, setShowCard] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);

  const handleIssue = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("POST", `/api/admin/registrations/${reg.id}/issue-card`, { validFrom, validUntil });
      const data = await res.json();
      setQrDataUrl(data.qrDataUrl);
      setIssuedReg(data.registration);
      setShowCard(true);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] });
      toast({ title: "Card Issue ਹੋ ਗਿਆ ✓", description: `Card No: ${data.registration.cardNumber}` });
    } catch {
      toast({ title: "ਗਲਤੀ", description: "Card issue ਕਰਨ ਵਿੱਚ ਸਮੱਸਿਆ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const win = window.open("", "_blank", "width=500,height=700");
    if (!win) return;
    win.document.write(`
      <html><head><title>ID Card — ${(issuedReg || reg).name}</title>
      <style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f3f4f6;}</style>
      </head><body>${printRef.current.innerHTML}</body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  const showExistingCard = reg.cardNumber && reg.validUntil && !showCard;
  const cardReg = issuedReg || reg;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setQrDataUrl(null); setIssuedReg(null); setShowCard(false); } }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white w-full" data-testid={`button-issue-${reg.id}`}>
          <QrCode className="h-3.5 w-3.5" />
          {reg.cardNumber ? "Card / ਨਵਿਆਓ" : "Card ਬਣਾਓ"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-green-700" />
            {showCard || showExistingCard ? "ID Card Preview" : "Card Issue ਕਰੋ"}
          </DialogTitle>
        </DialogHeader>

        {/* Card Preview mode */}
        {(showCard || showExistingCard) ? (
          <div className="space-y-4">
            <div className="flex justify-center" ref={printRef}>
              <IDCard reg={cardReg} qrDataUrl={qrDataUrl} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="flex-1 bg-green-600 hover:bg-green-700">
                <Printer className="mr-2 h-4 w-4" /> Print Card
              </Button>
              <Button variant="outline" onClick={() => setShowCard(false)} className="flex-1">
                ← ਵਾਪਸ
              </Button>
            </div>
            {qrDataUrl && (
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => {
                const a = document.createElement("a"); a.href = qrDataUrl;
                a.download = `QR-${cardReg.cardNumber}.png`; a.click();
              }}>
                <Download className="mr-2 h-4 w-4" /> QR PNG ਡਾਊਨਲੋਡ ਕਰੋ
              </Button>
            )}
          </div>
        ) : (
          /* Issue mode */
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
                  <Label className="text-xs">Valid From (ਤੋਂ)</Label>
                  <Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Valid Until (ਤੱਕ)</Label>
                  <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
                </div>
              </div>
            </div>

            <Button onClick={handleIssue} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Card ਬਣ ਰਿਹਾ ਹੈ...</>
                : <><QrCode className="mr-2 h-4 w-4" />Card Issue ਕਰੋ ਅਤੇ QR ਬਣਾਓ</>}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── View Existing Card Dialog ─────────────────────────────
function ViewCardDialog({ reg }: { reg: Registration }) {
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const loadQR = async () => {
    if (qrDataUrl || !reg.cardNumber) return;
    setLoadingQR(true);
    try {
      const res = await fetch(`/api/admin/registrations/${reg.id}/qr`, { credentials: "include" });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => { };
      const reader = new FileReader();
      reader.onload = (e) => setQrDataUrl(e.target?.result as string);
      reader.readAsDataURL(blob);
    } catch { } finally { setLoadingQR(false); }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const win = window.open("", "_blank", "width=500,height=700");
    if (!win) return;
    win.document.write(`<html><head><title>ID Card — ${reg.name}</title>
      <style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f3f4f6;}</style>
      </head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) loadQR(); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 w-full" data-testid={`button-view-card-${reg.id}`}>
          <Eye className="h-3.5 w-3.5" /> Card ਦੇਖੋ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>ID Card — {reg.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {loadingQR ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
          ) : (
            <div className="flex justify-center" ref={printRef}>
              <IDCard reg={reg} qrDataUrl={qrDataUrl} />
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="flex-1 bg-green-600 hover:bg-green-700">
              <Printer className="mr-2 h-4 w-4" /> Print Card
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Member Card (grid item) ────────────────────────────────
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
          {reg.cardNumber && reg.validUntil && <ViewCardDialog reg={reg} />}
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
  const activeCards = registrations?.filter(r => r.validUntil && new Date(r.validUntil) > new Date()).length || 0;
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
            { label: "ਕੁੱਲ", value: isLoading ? "..." : totalCards, color: "text-primary" },
            { label: "Active", value: isLoading ? "..." : activeCards, color: "text-green-600" },
            { label: "Expired", value: isLoading ? "..." : expiredCards, color: "text-orange-500" },
            { label: "Pending", value: isLoading ? "..." : totalCards - activeCards - expiredCards, color: "text-blue-500" },
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
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              ⚠️ ZIP ਡਾਊਨਲੋਡ ਕਰਨ ਤੋਂ ਬਾਅਦ portal ਦੀਆਂ ਸਾਰੀਆਂ ਰਜਿਸਟ੍ਰੇਸ਼ਨਾਂ ਆਪਣੇ ਆਪ delete ਹੋ ਜਾਣਗੀਆਂ।
            </p>
          </CardContent>
        </Card>

        {/* Member Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">ਮੈਂਬਰ ਸੂਚੀ</h2>
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
