import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRegistrations, useDeleteRegistration, useDownloadRegistrations } from "@/hooks/use-registration";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Download, 
  Trash2, 
  Loader2, 
  LogOut, 
  Users, 
  ShieldCheck,
  Eye,
  EyeOff,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function LoginForm() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(
      { username, password },
      {
        onError: () => {
          toast({
            title: "ਲੌਗਇਨ ਫੇਲ੍ਹ",
            description: "ਗਲਤ ਯੂਜ਼ਰਨੇਮ ਜਾਂ ਪਾਸਵਰਡ",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
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
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ਯੂਜ਼ਰਨੇਮ ਦਰਜ ਕਰੋ"
                  required
                  autoComplete="username"
                  data-testid="input-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">ਪਾਸਵਰਡ</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ"
                    required
                    autoComplete="current-password"
                    data-testid="input-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="button-toggle-password"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {loginError && (
                <p className="text-sm text-destructive text-center">
                  ਗਲਤ ਯੂਜ਼ਰਨੇਮ ਜਾਂ ਪਾਸਵਰਡ
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoggingIn}
                data-testid="button-login"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ਲੌਗਇਨ ਹੋ ਰਿਹਾ ਹੈ...
                  </>
                ) : (
                  "ਲੌਗਇਨ ਕਰੋ"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function Admin() {
  const { isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { data: registrations, isLoading, error } = useRegistrations();
  const deleteRegistration = useDeleteRegistration();
  const downloadAll = useDownloadRegistrations();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">ਪ੍ਰਸ਼ਾਸਕ ਪੈਨਲ</h1>
              <p className="text-muted-foreground">ਰਜਿਸਟ੍ਰੇਸ਼ਨਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => logout()}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              ਲੌਗ ਆਊਟ
            </Button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">ਕੁੱਲ ਰਜਿਸਟ੍ਰੇਸ਼ਨਾਂ</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {isLoading ? "..." : registrations?.length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">ਡਾਊਨਲੋਡ</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => downloadAll.mutate()}
                disabled={downloadAll.isPending || !registrations?.length}
                data-testid="button-download-all"
                className="w-full"
              >
                {downloadAll.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ਡਾਊਨਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    ਸਾਰੀਆਂ ਰਜਿਸਟ੍ਰੇਸ਼ਨਾਂ ਡਾਊਨਲੋਡ ਕਰੋ (ZIP)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle>ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸੂਚੀ</CardTitle>
            <CardDescription>ਸਾਰੀਆਂ ਮੈਂਬਰ ਰਜਿਸਟ੍ਰੇਸ਼ਨਾਂ</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">
                <p>ਡਾਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ</p>
              </div>
            ) : !registrations?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>ਕੋਈ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ਫੋਟੋ</TableHead>
                      <TableHead>ਨਾਮ</TableHead>
                      <TableHead>ਪਿੰਡ</TableHead>
                      <TableHead>ਤਹਿਸੀਲ</TableHead>
                      <TableHead>ਜ਼ਿਲ੍ਹਾ</TableHead>
                      <TableHead>ਮੋਬਾਈਲ</TableHead>
                      <TableHead>ਆਧਾਰ</TableHead>
                      <TableHead>ਮਿਤੀ</TableHead>
                      <TableHead>ਕਾਰਵਾਈਆਂ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>
                          {reg.photoData ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Avatar className="cursor-pointer hover:ring-2 ring-primary transition-all">
                                  <AvatarImage src={`data:${reg.photoMimeType};base64,${reg.photoData}`} />
                                  <AvatarFallback>{reg.name[0]}</AvatarFallback>
                                </Avatar>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{reg.name}</DialogTitle>
                                </DialogHeader>
                                <img 
                                  src={`data:${reg.photoMimeType};base64,${reg.photoData}`} 
                                  alt={reg.name}
                                  className="w-full max-w-md mx-auto rounded-lg"
                                />
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <Avatar>
                              <AvatarFallback>{reg.name[0]}</AvatarFallback>
                            </Avatar>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{reg.name}</TableCell>
                        <TableCell>{reg.village}</TableCell>
                        <TableCell>{reg.tehsil}</TableCell>
                        <TableCell>{reg.district}</TableCell>
                        <TableCell className="font-mono text-sm">{reg.mobileNumber}</TableCell>
                        <TableCell className="font-mono text-sm">
                          **** **** {reg.aadhaarNumber.slice(-4)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('pa-IN') : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="icon" variant="ghost" data-testid={`button-view-${reg.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>ਮੈਂਬਰ ਵੇਰਵੇ</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {reg.photoData && (
                                    <img 
                                      src={`data:${reg.photoMimeType};base64,${reg.photoData}`} 
                                      alt={reg.name}
                                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                                    />
                                  )}
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>ਨਾਮ:</strong> {reg.name}</div>
                                    <div><strong>ਆਹੁਦਾ:</strong> {reg.designation}</div>
                                    <div><strong>ਪਿੰਡ:</strong> {reg.village}</div>
                                    <div><strong>ਤਹਿਸੀਲ:</strong> {reg.tehsil}</div>
                                    <div><strong>ਜ਼ਿਲ੍ਹਾ:</strong> {reg.district}</div>
                                    <div><strong>ਮੋਬਾਈਲ:</strong> {reg.mobileNumber}</div>
                                    <div className="col-span-2"><strong>ਆਧਾਰ:</strong> **** **** {reg.aadhaarNumber.slice(-4)}</div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteRegistration.mutate(reg.id)}
                              disabled={deleteRegistration.isPending}
                              data-testid={`button-delete-${reg.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
