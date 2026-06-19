import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRegistrations, useDeleteRegistration, useDownloadRegistrations } from "@/hooks/use-registration";
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
  Clock, ThumbsUp, ThumbsDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import type { Registration, Update } from "@shared/schema";

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
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="ਯੂਜ਼ਰਨੇਮ" required data-testid="input-username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">ਪਾਸਵਰਡ</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="ਪਾਸਵਰਡ"
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

// ─── QR Panel ──────────────────────────────────────────────
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
          className="flex-1 bg-green-600 hover:bg-green-700">
          <Download className="mr-2 h-4 w-4" /> PNG ਡਾਊਨਲੋਡ
        </Button>
        <Button onClick={handlePrint} variant="outline" className="flex-1">🖨️ Print</Button>
      </div>
    </div>
  );
}

// ─── Issue/View QR Dialog ──────────────────────────────────
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

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o && reg.cardNumber && reg.validFrom) loadExistingQR(); if (!o) { setQrDataUrl(null); setIssuedReg(null); } }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white w-full" data-testid={`button-qr-${reg.id}`}>
          <QrCode className="h-3.5 w-3.5" />{reg.cardNumber ? "QR ਦੇਖੋ / ਨਵਿਆਓ" : "QR ਬਣਾਓ"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle><QrCode className="inline h-4 w-4 mr-2 text-green-700" />{qrDataUrl ? "QR Code" : "QR ਬਣਾਓ"}</DialogTitle>
        </DialogHeader>
        {qrDataUrl ? (
          <QRPanel qrDataUrl={qrDataUrl} reg={issuedReg || reg} />
        ) : (
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

// ─── Member Card (Approved) ────────────────────────────────
function MemberCard({ reg }: { reg: Registration }) {
  const deleteRegistration = useDeleteRegistration();
  const isExpired = reg.validUntil && new Date(reg.validUntil) < new Date();
  const isActive = reg.validFrom && reg.validUntil && new Date() >= new Date(reg.validFrom) && new Date() <= new Date(reg.validUntil);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-14 w-14 flex-shrink-0 border-2 border-muted">
            {reg.photoUrl ? <AvatarImage src={reg.photoUrl} /> : reg.photoData ? <AvatarImage src={`data:${reg.photoMimeType};base64,${reg.photoData}`} /> : null}
            <AvatarFallback className="text-xl font-bold">{reg.name[0]}</AvatarFallback>
          </Avatar>
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
              {reg.validFrom && reg.validUntil && (
                <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" />
                  {new Date(reg.validFrom).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} → {new Date(reg.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3"><IssueQRDialog reg={reg} /></div>
        <div className="mt-2">
          <Button size="sm" variant="ghost" className="w-full text-destructive hover:bg-destructive/10 text-xs"
            onClick={() => deleteRegistration.mutate(reg.id)} disabled={deleteRegistration.isPending}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> ਮਿਟਾਓ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Pending Card ──────────────────────────────────────────
function PendingCard({ reg }: { reg: Registration }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approveMut = useMutation({
    mutationFn: async () => { const r = await apiRequest("POST", `/api/admin/registrations/${reg.id}/approve`); return r.json(); },
    onSuccess: () => { toast({ title: "✓ ਅਪ੍ਰੂਵ ਕੀਤਾ" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] }); },
    onError: () => toast({ title: "ਗਲਤੀ", variant: "destructive" }),
  });

  const rejectMut = useMutation({
    mutationFn: async () => { const r = await fetch(`/api/admin/registrations/${reg.id}/reject`, { method: "DELETE", credentials: "include" }); return r.json(); },
    onSuccess: () => { toast({ title: "✗ Reject ਕੀਤਾ ਅਤੇ Delete ਕੀਤਾ" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] }); },
    onError: () => toast({ title: "ਗਲਤੀ", variant: "destructive" }),
  });

  return (
    <Card className="border-amber-200 bg-amber-50/30 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-14 w-14 flex-shrink-0 border-2 border-amber-200">
            {reg.photoUrl ? <AvatarImage src={reg.photoUrl} /> : reg.photoData ? <AvatarImage src={`data:${reg.photoMimeType};base64,${reg.photoData}`} /> : null}
            <AvatarFallback className="text-xl font-bold bg-amber-100">{reg.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div><p className="font-semibold leading-tight">{reg.name}</p><p className="text-sm text-muted-foreground">{reg.designation}</p></div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                <Clock className="h-3 w-3" /> Pending
              </span>
            </div>
            <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{reg.village}, {reg.tehsil}, {reg.district}</div>
              {reg.mobileNumber && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /><span className="font-mono">{reg.mobileNumber}</span></div>}
              <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" />
                {new Date(reg.createdAt!).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1.5" onClick={() => approveMut.mutate()} disabled={approveMut.isPending}>
            {approveMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ThumbsUp className="h-3.5 w-3.5" />} ਅਪ੍ਰੂਵ ਕਰੋ
          </Button>
          <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => rejectMut.mutate()} disabled={rejectMut.isPending}>
            {rejectMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ThumbsDown className="h-3.5 w-3.5" />} Reject ਕਰੋ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Direct Entry Form ─────────────────────────────────────
function DirectEntryForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", designation: "ਮੈਂਬਰ", village: "", tehsil: "", district: "", mobileNumber: "", aadhaarNumber: "" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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
      toast({ title: "✓ ਐਂਟਰੀ ਸਫਲ!", description: `Card: ${data.registration.cardNumber}` });
      setForm({ name: "", designation: "ਮੈਂਬਰ", village: "", tehsil: "", district: "", mobileNumber: "", aadhaarNumber: "" });
      setPhoto(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] });
    } catch (err: any) {
      toast({ title: "ਗਲਤੀ", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const field = (label: string, key: keyof typeof form, placeholder = "") => (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <Input value={form[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder || label} />
    </div>
  );

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" /> ਸਿੱਧੀ ਐਂਟਰੀ ਪਾਓ</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field("ਨਾਮ *", "name", "ਪੂਰਾ ਨਾਮ")}
            {field("ਅਹੁਦਾ", "designation", "ਮੈਂਬਰ / ਪ੍ਰਧਾਨ...")}
            {field("ਪਿੰਡ *", "village")}
            {field("ਤਹਿਸੀਲ *", "tehsil")}
            {field("ਜ਼ਿਲ੍ਹਾ *", "district")}
            {field("ਮੋਬਾਈਲ", "mobileNumber", "10 ਅੰਕ")}
            {field("ਆਧਾਰ ਨੰਬਰ", "aadhaarNumber", "12 ਅੰਕ")}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">ਫ਼ੋਟੋ</Label>
            <Input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
          </div>
          <Button type="submit" disabled={loading || !form.name || !form.village || !form.tehsil || !form.district} className="w-full bg-green-600 hover:bg-green-700">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />ਸੇਵ ਹੋ ਰਿਹਾ...</> : <><UserPlus className="mr-2 h-4 w-4" />ਐਂਟਰੀ ਸੇਵ ਕਰੋ (Approved)</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Updates Manager ───────────────────────────────────────
function UpdatesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: updates, isLoading } = useQuery<Update[]>({ queryKey: ["/api/updates"] });
  const [form, setForm] = useState({ title: "", content: "", eventDate: "" });
  const [image, setImage] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

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

  const deleteMut = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(`/api/admin/updates/${id}`, { method: "DELETE", credentials: "include" }); return r.json(); },
    onSuccess: () => { toast({ title: "Delete ਕੀਤੀ" }); queryClient.invalidateQueries({ queryKey: ["/api/updates"] }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Newspaper className="h-5 w-5 text-primary" /> ਅੱਪਡੇਟਸ ਮੈਨੇਜ ਕਰੋ</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
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
                <div className="space-y-1.5"><Label className="text-xs">ਫ਼ੋਟੋ (R2 ਵਿੱਚ ਸੇਵ)</Label><Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} /></div>
              </div>
              <Button type="submit" disabled={adding || !form.title || !form.content} className="w-full">
                {adding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />ਪੋਸਟ ਹੋ ਰਿਹਾ...</> : <><Plus className="mr-2 h-4 w-4" />ਅੱਪਡੇਟ ਪੋਸਟ ਕਰੋ</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        : !updates?.length ? (
          <Card><CardContent className="text-center py-10 text-muted-foreground"><Newspaper className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>ਕੋਈ ਅੱਪਡੇਟ ਨਹੀਂ ਅਜੇ</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {updates.map((u) => (
              <Card key={u.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">{u.title}</p>
                        {u.imageUrl && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">📷 ਫ਼ੋਟੋ</span>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{u.content}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {u.eventDate && `ਘਟਨਾ: ${new Date(u.eventDate).toLocaleDateString("pa-IN")} • `}
                        ਪੋਸਟ: {new Date(u.createdAt!).toLocaleDateString("pa-IN")}
                      </p>
                    </div>
                    {u.imageUrl && <img src={u.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border" />}
                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 flex-shrink-0"
                      onClick={() => deleteMut.mutate(u.id)} disabled={deleteMut.isPending}>
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

// ─── Main Admin Panel ──────────────────────────────────────
export default function Admin() {
  const { isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { data: registrations, isLoading } = useRegistrations();
  const downloadAll = useDownloadRegistrations();
  const [search, setSearch] = useState("");

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAuthenticated) return <LoginForm />;

  const allRegs = registrations || [];
  const pending = allRegs.filter(r => r.status === "pending");
  const approved = allRegs.filter(r => r.status === "approved");
  const activeCards = approved.filter(r => r.validFrom && r.validUntil && new Date() >= new Date(r.validFrom) && new Date() <= new Date(r.validUntil)).length;

  const filtered = approved.filter(r =>
    !search ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.village.toLowerCase().includes(search.toLowerCase()) ||
    (r.mobileNumber || "").includes(search) ||
    (r.cardNumber || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full"><ShieldCheck className="h-7 w-7 text-primary" /></div>
            <div><h1 className="text-2xl font-display font-bold">ਪ੍ਰਸ਼ਾਸਕ ਪੈਨਲ</h1><p className="text-sm text-muted-foreground">ਕਿਸਾਨ ਯੂਨੀਅਨ ਪੰਜਾਬ</p></div>
          </div>
          <Button variant="outline" size="sm" onClick={() => logout()} data-testid="button-logout">
            <LogOut className="h-4 w-4 mr-2" /> ਲੌਗ ਆਊਟ
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "ਕੁੱਲ", value: isLoading ? "..." : allRegs.length, color: "text-primary" },
            { label: "Pending", value: isLoading ? "..." : pending.length, color: "text-amber-500" },
            { label: "Approved", value: isLoading ? "..." : approved.length, color: "text-green-600" },
            { label: "Active Card", value: isLoading ? "..." : activeCards, color: "text-blue-500" },
          ].map((s) => (
            <Card key={s.label}><CardContent className="pt-4 pb-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            </CardContent></Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending">
          <TabsList className="grid grid-cols-4 mb-6 h-auto">
            <TabsTrigger value="pending" className="flex items-center gap-1.5 py-2.5 text-xs">
              <Clock className="h-3.5 w-3.5" />
              Pending {pending.length > 0 && <span className="ml-1 bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">{pending.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-1.5 py-2.5 text-xs">
              <Users className="h-3.5 w-3.5" /> ਮੈਂਬਰ ਸੂਚੀ
            </TabsTrigger>
            <TabsTrigger value="direct" className="flex items-center gap-1.5 py-2.5 text-xs">
              <UserPlus className="h-3.5 w-3.5" /> ਐਂਟਰੀ ਪਾਓ
            </TabsTrigger>
            <TabsTrigger value="updates" className="flex items-center gap-1.5 py-2.5 text-xs">
              <Newspaper className="h-3.5 w-3.5" /> ਖ਼ਬਰਾਂ
            </TabsTrigger>
          </TabsList>

          {/* PENDING TAB */}
          <TabsContent value="pending">
            {isLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : !pending.length ? (
              <Card><CardContent className="text-center py-16 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>ਕੋਈ Pending ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ</p>
              </CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pending.map((reg) => <motion.div key={reg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><PendingCard reg={reg} /></motion.div>)}
              </div>
            )}
          </TabsContent>

          {/* APPROVED TAB */}
          <TabsContent value="approved">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Input placeholder="ਖੋਜੋ — ਨਾਮ, ਪਿੰਡ, ਮੋਬਾਈਲ, Card No..."
                value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" data-testid="input-search" />
              <Button onClick={() => downloadAll.mutate()} disabled={downloadAll.isPending || !approved.length} variant="outline" className="flex-shrink-0">
                {downloadAll.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />ਡਾਊਨਲੋਡ...</> : <><Download className="mr-2 h-4 w-4" />ZIP ({approved.length})</>}
              </Button>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : !filtered.length ? (
              <Card><CardContent className="text-center py-16 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-40" /><p>{search ? "ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ" : "ਕੋਈ Approved ਮੈਂਬਰ ਨਹੀਂ"}</p>
              </CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((reg) => <motion.div key={reg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><MemberCard reg={reg} /></motion.div>)}
              </div>
            )}
          </TabsContent>

          {/* DIRECT ENTRY TAB */}
          <TabsContent value="direct"><DirectEntryForm /></TabsContent>

          {/* UPDATES TAB */}
          <TabsContent value="updates"><UpdatesManager /></TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
