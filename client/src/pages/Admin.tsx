import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRegistrations, useDeleteRegistration, useDownloadRegistrations } from "@/hooks/use-registration";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
            <CardDescription>ਕਿਸਾਨ ਯੂਨੀਅਨ ਪੰਜਾਬ</CardDescription>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {loginError && <p className="text-sm text-destructive text-center">ਗਲਤ ਯੂਜ਼ਰਨੇਮ ਜਾਂ ਪਾਸਵਰਡ</p>}
              <Button type="submit" className="w-full" disabled={isLoggingIn} data-testid="button-login">
                {isLoggingIn ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />ਲੌਗਇਨ ਹੋ ਰਿਹਾ ਹੈ...</> : "ਲੌਗਇਨ ਕਰੋ"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleIssue = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("POST", `/api/admin/registrations/${reg.id}/issue-card`, { validFrom, validUntil });
      const data = await res.json();
      setQrDataUrl(data.qrDataUrl);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] });
      toast({ title: "Card Issue ਹੋ ਗਿਆ ✓", description: `Card No: ${data.registration.cardNumber}` });
    } catch {
      toast({ title: "ਗਲਤੀ", description: "Card issue ਕਰਨ ਵਿੱਚ ਸਮੱਸਿਆ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR-${reg.cardNumber || reg.name}.png`;
    a.click();
  };

  const downloadQRFromServer = async () => {
    const res = await fetch(`/api/admin/registrations/${reg.id}/qr`, { credentials: "include" });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR-${reg.cardNumber || reg.name}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQrDataUrl(null); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white w-full" data-testid={`button-issue-${reg.id}`}>
          <QrCode className="h-3.5 w-3.5" />
          {reg.cardNumber ? "QR / ਨਵਿਆਓ" : "QR Card ਬਣਾਓ"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-green-700" /> Card Issue ਕਰੋ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/40 rounded-lg p-3 flex items-center gap-3">
            <Avatar className="h-14 w-14 border-2 border-primary/20">
              {reg.photoUrl ? <AvatarImage src={reg.photoUrl} /> : reg.photoData ? <AvatarImage src={`data:${reg.photoMimeType};base64,${reg.photoData}`} /> : null}
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
            <p className="text-sm font-medium text-muted-foreground">Card Validity ਸੈੱਟ ਕਰੋ:</p>
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
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />QR ਬਣ ਰਿਹਾ ਹੈ...</>
              : <><QrCode className="mr-2 h-4 w-4" />Card Issue ਕਰੋ ਅਤੇ QR ਬਣਾਓ</>}
          </Button>

          {qrDataUrl && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="border-2 border-green-300 rounded-xl p-4 text-center bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-green-700 mb-2">QR Code ਤਿਆਰ ਹੈ!</p>
              <img src={qrDataUrl} alt="QR Code" className="w-44 h-44 mx-auto rounded-lg mb-3 border border-green-200" />
              <p className="text-xs text-muted-foreground mb-3">ਇਹ QR Code ਪ੍ਰਿੰਟ ਕੀਤੇ Card ਤੇ ਲਗਾਓ</p>
              <Button onClick={downloadQR} variant="default" size="sm" className="w-full">
                <Download className="mr-2 h-4 w-4" /> QR PNG ਡਾਊਨਲੋਡ ਕਰੋ
              </Button>
            </motion.div>
          )}

          {!qrDataUrl && reg.cardNumber && reg.validUntil && (
            <div className="border rounded-xl p-3 text-center bg-muted/30">
              <div className="flex items-center justify-center gap-2 mb-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {reg.validUntil && new Date(reg.validUntil) < new Date()
                  ? <span className="text-orange-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />Expired</span>
                  : <span className="text-green-700">Valid till {new Date(reg.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>}
              </div>
              <Button onClick={downloadQRFromServer} variant="outline" size="sm" className="w-full">
                <QrCode className="mr-2 h-4 w-4" /> ਪੁਰਾਣਾ QR ਡਾਊਨਲੋਡ ਕਰੋ
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Member Card (Mobile) ──────────────────────────────────
function MemberCard({ reg }: { reg: Registration }) {
  const deleteRegistration = useDeleteRegistration();
  const isExpired = reg.validUntil && new Date(reg.validUntil) < new Date();
  const isActive = reg.validFrom && reg.validUntil
    && new Date() >= new Date(reg.validFrom) && new Date() <= new Date(reg.validUntil);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Avatar className="h-16 w-16 flex-shrink-0 cursor-pointer hover:ring-2 ring-primary transition-all border-2 border-muted">
                {reg.photoUrl
                  ? <AvatarImage src={reg.photoUrl} />
                  : reg.photoData
                  ? <AvatarImage src={`data:${reg.photoMimeType};base64,${reg.photoData}`} />
                  : null}
                <AvatarFallback className="text-xl font-bold">{reg.name[0]}</AvatarFallback>
              </Avatar>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{reg.name}</DialogTitle></DialogHeader>
              {(reg.photoUrl || reg.photoData) && (
                <img src={reg.photoUrl || `data:${reg.photoMimeType};base64,${reg.photoData}`}
                  alt={reg.name} className="w-full max-w-md mx-auto rounded-lg" />
              )}
            </DialogContent>
          </Dialog>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-base leading-tight">{reg.name}</p>
                <p className="text-sm text-muted-foreground">{reg.designation}</p>
              </div>
              <div className="flex-shrink-0">
                {isActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    <CheckCircle className="h-3 w-3" /> Active
                  </span>
                ) : isExpired ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                    <AlertTriangle className="h-3 w-3" /> Expired
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                    Pending
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span>{reg.village}, {reg.tehsil}, {reg.district}</span>
              </div>
              {reg.mobileNumber && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span className="font-mono">{reg.mobileNumber}</span>
                </div>
              )}
              {reg.cardNumber && (
                <div className="flex items-center gap-1.5">
                  <CreditCard className="h-3 w-3 flex-shrink-0" />
                  <span className="font-mono text-green-700 font-semibold">{reg.cardNumber}</span>
                </div>
              )}
              {reg.validFrom && reg.validUntil && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span>
                    {new Date(reg.validFrom).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    {" → "}
                    {new Date(reg.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <div className="flex-1">
            <IssueCardDialog reg={reg} />
          </div>
          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
            onClick={() => deleteRegistration.mutate(reg.id)} disabled={deleteRegistration.isPending}
            data-testid={`button-delete-${reg.id}`}>
            <Trash2 className="h-4 w-4" />
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

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!isAuthenticated) return <LoginForm />;

  const totalCards = registrations?.length || 0;
  const activeCards = registrations?.filter(r => r.validUntil && new Date(r.validUntil) > new Date()).length || 0;
  const expiredCards = registrations?.filter(r => r.validUntil && new Date(r.validUntil) < new Date()).length || 0;
  const pendingCards = totalCards - activeCards - expiredCards;

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
            { label: "ਕੁੱਲ", value: isLoading ? "..." : totalCards, icon: <Users className="h-4 w-4" />, color: "text-primary" },
            { label: "Active", value: isLoading ? "..." : activeCards, icon: <CheckCircle className="h-4 w-4" />, color: "text-green-600" },
            { label: "Expired", value: isLoading ? "..." : expiredCards, icon: <AlertTriangle className="h-4 w-4" />, color: "text-orange-500" },
            { label: "Pending", value: isLoading ? "..." : pendingCards, icon: <QrCode className="h-4 w-4" />, color: "text-blue-500" },
          ].map((s) => (
            <Card key={s.label} className="text-center">
              <CardContent className="pt-4 pb-3">
                <div className={`flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1 ${s.color}`}>
                  {s.icon} {s.label}
                </div>
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Download + Search */}
        <Card className="mb-6">
          <CardContent className="pt-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="ਖੋਜੋ — ਨਾਮ, ਪਿੰਡ, ਮੋਬਾਈਲ, Card No..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
                data-testid="input-search"
              />
              <Button
                onClick={() => downloadAll.mutate()}
                disabled={downloadAll.isPending || !registrations?.length}
                variant="outline"
                className="flex-shrink-0"
                data-testid="button-download-all"
              >
                {downloadAll.isPending
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />ਡਾਊਨਲੋਡ...</>
                  : <><Download className="mr-2 h-4 w-4" />ZIP ਡਾਊਨਲੋਡ ({totalCards})</>}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 ZIP ਡਾਊਨਲੋਡ ਕਰਨ ਨਾਲ ਕੋਈ ਡਾਟਾ ਨਹੀਂ ਮਿਟਦਾ — ਸਿਰਫ਼ copy ਡਾਊਨਲੋਡ ਹੁੰਦੀ ਹੈ।
            </p>
          </CardContent>
        </Card>

        {/* Member List */}
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
                <p className="text-base">{search ? "ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ ਮਿਲਿਆ" : "ਕੋਈ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ"}</p>
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
