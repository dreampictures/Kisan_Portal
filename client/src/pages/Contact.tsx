import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRegistrationSchema, type InsertRegistration } from "@shared/schema";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Upload, Loader2, Send, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { PUNJAB_DISTRICTS } from "@/lib/punjab-data";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

const selectCls = "flex h-12 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

const formSchema = insertRegistrationSchema.extend({
  photo: z
    .instanceof(FileList)
    .refine((files) => files?.length === 1, "ਫੋਟੋ ਲਾਜ਼ਮੀ ਹੈ")
    .refine((files) => files?.[0]?.size <= 5000000, "ਵੱਧ ਤੋਂ ਵੱਧ ਆਕਾਰ 5MB")
    .refine(
      (files) => ["image/jpeg", "image/png", "image/jpg"].includes(files?.[0]?.type),
      "ਸਿਰਫ਼ .jpg, .jpeg, .png ਸਮਰਥਿਤ ਹਨ",
    ),
  aadhaarNumber: z.string().length(12, "ਆਧਾਰ ਨੰਬਰ 12 ਅੰਕ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ"),
  mobileNumber: z.string().min(10, "ਮੋਬਾਈਲ ਨੰਬਰ 10 ਅੰਕ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ").max(10, "ਮੋਬਾਈਲ ਨੰਬਰ 10 ਅੰਕ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ"),
  name: z.string().min(1, "ਨਾਮ ਲਾਜ਼ਮੀ ਹੈ"),
  village: z.string().min(1, "ਪਿੰਡ/ਸ਼ਹਿਰ ਲਾਜ਼ਮੀ ਹੈ"),
  tehsil: z.string().min(1, "ਤਹਿਸੀਲ ਲਾਜ਼ਮੀ ਹੈ"),
  district: z.string().min(1, "ਜ਼ਿਲ੍ਹਾ ਲਾਜ਼ਮੀ ਹੈ"),
  areaType: z.enum(["rural", "urban"]).default("rural"),
  wardNumber: z.string().optional().or(z.literal("")),
  mohalla: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

function SuccessModal({ trackingId, onClose }: { trackingId: string; onClose: () => void }) {
  const { toast } = useToast();

  const copyId = () => {
    navigator.clipboard.writeText(trackingId).then(() =>
      toast({ title: "Copied!", description: "Tracking ID copied to clipboard" })
    );
  };

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        className="max-w-sm text-center"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-green-800 mb-1">ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਫਲ!</h2>
            <p className="text-sm text-muted-foreground">ਤੁਹਾਡੀ ਬੇਨਤੀ ਮਿਲ ਗਈ ਹੈ</p>
          </div>

          <div className="w-full bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs text-green-700 font-medium mb-2 uppercase tracking-wide">ਤੁਹਾਡਾ ਟਰੈਕਿੰਗ ਨੰਬਰ</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-mono font-bold text-green-800 tracking-widest">{trackingId}</span>
              <button onClick={copyId} className="p-1.5 rounded-md hover:bg-green-200 text-green-700 transition-colors" title="Copy">
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-1 bg-amber-50 border border-amber-200 rounded-lg p-3 w-full">
            <p className="font-semibold text-amber-800">⚠️ ਇਹ ਨੰਬਰ ਯਾਦ ਰੱਖੋ</p>
            <p className="text-amber-700">ਇਸ ਨੰਬਰ ਨਾਲ ਤੁਸੀਂ ਆਪਣੀ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਦੀ ਸਥਿਤੀ ਟਰੈਕ ਕਰ ਸਕਦੇ ਹੋ।</p>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Button
              data-testid="button-success-ok"
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              ਠੀਕ ਹੈ
            </Button>
            <Link href="/track">
              <Button variant="outline" className="w-full gap-2" onClick={onClose} data-testid="button-track-status">
                <ExternalLink className="h-4 w-4" />
                ਸਥਿਤੀ ਟਰੈਕ ਕਰੋ
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Contact() {
  const [successData, setSuccessData] = useState<{ trackingId: string } | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      designation: "ਮੈਂਬਰ",
      village: "",
      tehsil: "",
      district: "",
      areaType: "rural",
      wardNumber: "",
      mohalla: "",
      mobileNumber: "",
      aadhaarNumber: "",
    },
  });

  const areaType = form.watch("areaType");
  const selectedDistrict = form.watch("district");
  const tehsilsForDistrict = PUNJAB_DISTRICTS.find(d => d.name === selectedDistrict)?.tehsils || [];

  async function onSubmit(data: FormValues) {
    setIsPending(true);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("designation", data.designation || "ਮੈਂਬਰ");
    formData.append("village", data.village);
    formData.append("tehsil", data.tehsil);
    formData.append("district", data.district);
    formData.append("areaType", data.areaType || "rural");
    if (data.wardNumber) formData.append("wardNumber", data.wardNumber);
    if (data.mohalla) formData.append("mohalla", data.mohalla);
    formData.append("mobileNumber", data.mobileNumber || "");
    formData.append("aadhaarNumber", data.aadhaarNumber || "");
    if (data.photo && data.photo.length > 0) formData.append("photo", data.photo[0]);

    try {
      const res = await fetch(api.registrations.submit.path, {
        method: api.registrations.submit.method,
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਫੇਲ੍ਹ ਹੋ ਗਈ" }));
        throw new Error(err.message);
      }
      const result = await res.json();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/registrations'] });
      form.reset();
      setSuccessData({ trackingId: result.trackingId || "" });
    } catch (err: any) {
      toast({ title: "ਗਲਤੀ", description: err.message, variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  }

  const fileRef = form.register("photo");

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      {successData && (
        <SuccessModal
          trackingId={successData.trackingId}
          onClose={() => setSuccessData(null)}
        />
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-bold mb-4">ਮੈਂਬਰ ਰਜਿਸਟ੍ਰੇਸ਼ਨ</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ (ਕੋਟ ਬੁੱਢਾ) ਦੇ ਮੈਂਬਰ ਬਣਨ ਲਈ ਰਜਿਸਟਰ ਕਰੋ।
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-primary text-primary-foreground border-none shadow-xl">
              <CardHeader><CardTitle>ਜ਼ਰੂਰੀ ਨੋਟ</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="opacity-90 leading-relaxed">
                  ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਸੰਭਾਲੀ ਜਾਵੇਗੀ।
                </p>
                <div className="flex items-start gap-3 mt-4">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-accent" />
                  <p className="text-sm opacity-90">ਕਿਰਪਾ ਕਰਕੇ ਯਕੀਨੀ ਬਣਾਓ ਕਿ ਤੁਹਾਡੀ ਫੋਟੋ ਸਾਫ਼ ਹੈ।</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-accent" />
                  <p className="text-sm opacity-90">ਤਸਦੀਕ ਲਈ ਆਧਾਰ ਨੰਬਰ ਲਾਜ਼ਮੀ ਹੈ।</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-accent" />
                  <p className="text-sm opacity-90">ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਤੋਂ ਬਾਅਦ ਟਰੈਕਿੰਗ ID ਮਿਲੇਗੀ।</p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-secondary/30 rounded-xl p-6 border border-border">
              <h3 className="font-bold mb-2">ਮਦਦ ਦੀ ਲੋੜ ਹੈ?</h3>
              <p className="text-sm text-muted-foreground">ਜੇਕਰ ਤੁਹਾਨੂੰ ਕੋਈ ਸਮੱਸਿਆ ਆਉਂਦੀ ਹੈ, ਤਾਂ ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।</p>
              <p className="text-sm font-semibold text-primary mt-2">ਸੂਬਾ ਮੀਤ ਪ੍ਰਧਾਨ: 81465 54106</p>
              <p className="text-sm font-semibold text-primary mt-2">ਪੋਰਟਲ ਪ੍ਰਬੰਧਕ: info@thedreampictures.com</p>
              <div className="mt-3 pt-3 border-t border-border">
                <Link href="/track">
                  <button className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" /> ਸਥਿਤੀ ਟਰੈਕ ਕਰੋ →
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <Card className="lg:col-span-2 shadow-2xl border-border/50">
            <CardHeader>
              <CardTitle>ਮੈਂਬਰ ਦੇ ਵੇਰਵੇ</CardTitle>
              <CardDescription>ਸਾਰੇ * ਖੇਤਰ ਲਾਜ਼ਮੀ ਹਨ।</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ਨਾਮ *</FormLabel>
                        <FormControl><Input data-testid="input-name" placeholder="ਉਦਾਹਰਣ: ਭਗਵੰਤ ਸਿੰਘ" {...field} className="h-12" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="designation" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ਆਹੁਦਾ</FormLabel>
                        <FormControl><Input data-testid="input-designation" placeholder="ਮੈਂਬਰ" {...field} value={field.value ?? ""} className="h-12" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField control={form.control} name="aadhaarNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ਆਧਾਰ ਨੰਬਰ (12 ਅੰਕ) *</FormLabel>
                        <FormControl><Input data-testid="input-aadhaar" placeholder="XXXXXXXXXXXX" {...field} maxLength={12} className="h-12 font-mono" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ਮੋਬਾਈਲ ਨੰਬਰ *</FormLabel>
                        <FormControl><Input data-testid="input-mobile" placeholder="9876543210" {...field} maxLength={10} className="h-12 font-mono" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="areaType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>ਖੇਤਰ ਦੀ ਕਿਸਮ *</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-3">
                          {(["rural", "urban"] as const).map(t => (
                            <button key={t} type="button"
                              onClick={() => { field.onChange(t); form.setValue("wardNumber", ""); form.setValue("mohalla", ""); }}
                              data-testid={`button-area-${t}`}
                              className={`py-3 rounded-md border text-sm font-medium transition-colors ${field.value === t ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-muted"}`}>
                              {t === "rural" ? "🌾 ਪੇਂਡੂ (Rural)" : "🏙️ ਸ਼ਹਿਰੀ (Urban)"}
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField control={form.control} name="district" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ਜ਼ਿਲ੍ਹਾ *</FormLabel>
                        <FormControl>
                          <select data-testid="input-district" value={field.value}
                            onChange={(e) => { field.onChange(e.target.value); form.setValue("tehsil", ""); }}
                            className={selectCls}>
                            <option value="">ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ</option>
                            {PUNJAB_DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="tehsil" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ਤਹਿਸੀਲ *</FormLabel>
                        <FormControl>
                          <select data-testid="input-tehsil" value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className={selectCls} disabled={!selectedDistrict}>
                            <option value="">ਤਹਿਸੀਲ ਚੁਣੋ</option>
                            {tehsilsForDistrict.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="village" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{areaType === "urban" ? "ਸ਼ਹਿਰ/ਨਗਰ *" : "ਪਿੰਡ *"}</FormLabel>
                      <FormControl>
                        <Input data-testid="input-village"
                          placeholder={areaType === "urban" ? "ਸ਼ਹਿਰ ਦਾ ਨਾਮ ਲਿਖੋ" : "ਪਿੰਡ ਦਾ ਨਾਮ ਲਿਖੋ"}
                          {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {areaType === "urban" && (
                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField control={form.control} name="wardNumber" render={({ field }) => (
                        <FormItem>
                          <FormLabel>ਵਾਰਡ ਨੰਬਰ (ਵਿਕਲਪਿਕ)</FormLabel>
                          <FormControl><Input data-testid="input-ward" placeholder="ਵਾਰਡ ਨੰਬਰ" {...field} className="h-12" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="mohalla" render={({ field }) => (
                        <FormItem>
                          <FormLabel>ਮੁਹੱਲਾ (ਵਿਕਲਪਿਕ)</FormLabel>
                          <FormControl><Input data-testid="input-mohalla" placeholder="ਮੁਹੱਲਾ" {...field} className="h-12" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  )}

                  <FormField control={form.control} name="photo" render={() => (
                    <FormItem>
                      <FormLabel>ਪਾਸਪੋਰਟ ਸਾਈਜ਼ ਫੋਟੋ *</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <div className="relative w-full">
                            <Input data-testid="input-photo" type="file" accept="image/*"
                              className="pl-10 h-12 pt-2.5 file:text-primary file:font-semibold file:bg-primary/10 file:rounded-full file:border-0 file:px-3 file:mr-4"
                              {...fileRef} />
                            <Upload className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>ਵੱਧ ਤੋਂ ਵੱਧ ਆਕਾਰ 5MB. JPG, PNG ਸਮਰਥਿਤ।</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="pt-4">
                    <Button data-testid="button-submit" type="submit"
                      className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                      disabled={isPending}>
                      {isPending ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" />ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ...</>
                      ) : (
                        <><Send className="mr-2 h-5 w-5" />ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਭੇਜੋ</>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
