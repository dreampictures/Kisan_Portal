import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertRegistrationSchema,
  type InsertRegistration,
} from "@shared/schema";
import { useSubmitRegistration } from "@/hooks/use-registration";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Loader2, Send, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { PUNJAB_DISTRICTS } from "@/lib/punjab-data";

const selectCls = "flex h-12 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

const formSchema = insertRegistrationSchema.extend({
  photo: z
    .instanceof(FileList)
    .refine((files) => files?.length === 1, "ਫੋਟੋ ਲੋੜੀਂਦੀ ਹੈ")
    .refine((files) => files?.[0]?.size <= 5000000, "ਵੱਧ ਤੋਂ ਵੱਧ ਆਕਾਰ 5MB")
    .refine(
      (files) =>
        ["image/jpeg", "image/png", "image/jpg"].includes(files?.[0]?.type),
      "ਸਿਰਫ਼ .jpg, .jpeg, .png ਸਮਰਥਿਤ ਹਨ",
    ),
  areaType: z.enum(["rural", "urban"]).default("rural"),
  wardNumber: z.string().optional().or(z.literal("")),
  mohalla: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export default function Contact() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutate, isPending } = useSubmitRegistration();

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

  function onSubmit(data: FormValues) {
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

    if (data.photo && data.photo.length > 0) {
      formData.append("photo", data.photo[0]);
    }

    mutate(formData, {
      onSuccess: () => {
        setIsSuccess(true);
        form.reset();
      },
    });
  }

  const fileRef = form.register("photo");

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-bold mb-4">
            ਮੈਂਬਰ ਰਜਿਸਟ੍ਰੇਸ਼ਨ
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ (ਕੋਟ ਬੁੱਢਾ) ਦੇ ਮੈਂਬਰ ਬਣਨ ਲਈ ਰਜਿਸਟਰ ਕਰੋ।
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-primary text-primary-foreground border-none shadow-xl">
              <CardHeader>
                <CardTitle>ਜ਼ਰੂਰੀ ਨੋਟ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="opacity-90 leading-relaxed">
                  ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਸੰਭਾਲੀ ਜਾਵੇਗੀ। ਤੁਹਾਡਾ ਕਾਰਡ
                  ਜਲਦੀ ਹੀ ਤਿਆਰ ਕੀਤਾ ਜਾਵੇਗਾ।
                </p>
                <div className="flex items-start gap-3 mt-4">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-accent" />
                  <p className="text-sm opacity-90">
                    ਕਿਰਪਾ ਕਰਕੇ ਯਕੀਨੀ ਬਣਾਓ ਕਿ ਤੁਹਾਡੀ ਫੋਟੋ ਸਾਫ਼ ਹੈ।
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-accent" />
                  <p className="text-sm opacity-90">
                    ਤਸਦੀਕ ਲਈ ਆਧਾਰ ਨੰਬਰ ਲਾਜ਼ਮੀ ਹੈ।
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-accent" />
                  <p className="text-sm opacity-90">
                    ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਤੋਂ ਬਾਅਦ ਜਲਦ ਹੀ ਤੁਸੀ ਕਮੇਟੀ ਦੇ ਮੈਂਬਰ ਬਣ ਜਾਓਗੇ।
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-secondary/30 rounded-xl p-6 border border-border">
              <h3 className="font-bold mb-2">ਮਦਦ ਦੀ ਲੋੜ ਹੈ?</h3>
              <p className="text-sm text-muted-foreground">
                ਜੇਕਰ ਤੁਹਾਨੂੰ ਕੋਈ ਸਮੱਸਿਆ ਆਉਂਦੀ ਹੈ, ਤਾਂ ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।
              </p>
              <p className="text-sm font-semibold text-primary mt-2">
                ਸੂਬਾ ਮੀਤ ਪ੍ਰਧਾਨ: 81465 54106
              </p>
              <p className="text-sm font-semibold text-primary mt-2">
                ਪੋਰਟਲ ਪ੍ਰਬੰਧਕ: info@thedreampictures.com
              </p>
            </div>
          </div>

          <Card className="lg:col-span-2 shadow-2xl border-border/50">
            <CardHeader>
              <CardTitle>ਮੈਂਬਰ ਦੇ ਵੇਰਵੇ</CardTitle>
              <CardDescription>ਸਾਰੇ * ਖੇਤਰ ਲਾਜ਼ਮੀ ਹਨ।</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Name + Designation */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ਨਾਮ *</FormLabel>
                          <FormControl>
                            <Input data-testid="input-name" placeholder="ਉਦਾਹਰਣ: ਭਗਵੰਤ ਸਿੰਘ" {...field} className="h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="designation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ਆਹੁਦਾ</FormLabel>
                          <FormControl>
                            <Input data-testid="input-designation" placeholder="ਮੈਂਬਰ" {...field} className="h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Aadhaar + Mobile */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="aadhaarNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ਆਧਾਰ ਨੰਬਰ (12 ਅੰਕ)</FormLabel>
                          <FormControl>
                            <Input data-testid="input-aadhaar" placeholder="XXXX XXXX XXXX" {...field} maxLength={12} className="h-12 font-mono" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mobileNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ਮੋਬਾਈਲ ਨੰਬਰ</FormLabel>
                          <FormControl>
                            <Input data-testid="input-mobile" placeholder="9876543210" {...field} maxLength={10} className="h-12 font-mono" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Area Type Toggle */}
                  <FormField
                    control={form.control}
                    name="areaType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ਖੇਤਰ ਦੀ ਕਿਸਮ *</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-3">
                            {(["rural", "urban"] as const).map(t => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => {
                                  field.onChange(t);
                                  form.setValue("wardNumber", "");
                                  form.setValue("mohalla", "");
                                }}
                                data-testid={`button-area-${t}`}
                                className={`py-3 rounded-md border text-sm font-medium transition-colors ${field.value === t ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-muted"}`}>
                                {t === "rural" ? "🌾 ਪੇਂਡੂ (Rural)" : "🏙️ ਸ਼ਹਿਰੀ (Urban)"}
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* District + Tehsil */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ਜ਼ਿਲ੍ਹਾ *</FormLabel>
                          <FormControl>
                            <select
                              data-testid="input-district"
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                form.setValue("tehsil", "");
                              }}
                              className={selectCls}
                            >
                              <option value="">ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ</option>
                              {PUNJAB_DISTRICTS.map(d => (
                                <option key={d.name} value={d.name}>{d.name}</option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tehsil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ਤਹਿਸੀਲ *</FormLabel>
                          <FormControl>
                            <select
                              data-testid="input-tehsil"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className={selectCls}
                              disabled={!selectedDistrict}
                            >
                              <option value="">ਤਹਿਸੀਲ ਚੁਣੋ</option>
                              {tehsilsForDistrict.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Village / Town */}
                  <FormField
                    control={form.control}
                    name="village"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{areaType === "urban" ? "ਸ਼ਹਿਰ/ਨਗਰ *" : "ਪਿੰਡ *"}</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="input-village"
                            placeholder={areaType === "urban" ? "ਸ਼ਹਿਰ ਦਾ ਨਾਮ ਲਿਖੋ" : "ਪਿੰਡ ਦਾ ਨਾਮ ਲਿਖੋ"}
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Ward + Mohalla (Urban only) */}
                  {areaType === "urban" && (
                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="wardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ਵਾਰਡ ਨੰਬਰ (ਵਿਕਲਪਿਕ)</FormLabel>
                            <FormControl>
                              <Input data-testid="input-ward" placeholder="ਵਾਰਡ ਨੰਬਰ" {...field} className="h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="mohalla"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ਮੁਹੱਲਾ (ਵਿਕਲਪਿਕ)</FormLabel>
                            <FormControl>
                              <Input data-testid="input-mohalla" placeholder="ਮੁਹੱਲਾ" {...field} className="h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Photo */}
                  <FormField
                    control={form.control}
                    name="photo"
                    render={() => (
                      <FormItem>
                        <FormLabel>ਪਾਸਪੋਰਟ ਸਾਈਜ਼ ਫੋਟੋ *</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-4">
                            <div className="relative w-full">
                              <Input
                                data-testid="input-photo"
                                type="file"
                                accept="image/*"
                                className="pl-10 h-12 pt-2.5 file:text-primary file:font-semibold file:bg-primary/10 file:rounded-full file:border-0 file:px-3 file:mr-4"
                                {...fileRef}
                              />
                              <Upload className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          ਵੱਧ ਤੋਂ ਵੱਧ ਆਕਾਰ 5MB. JPG, PNG ਸਮਰਥਿਤ।
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button
                      data-testid="button-submit"
                      type="submit"
                      className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਭੇਜੋ
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>

              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 p-4 bg-green-50 text-green-800 rounded-xl border border-green-200 flex items-center gap-3"
                >
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold">ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਫਲ!</p>
                    <p className="text-sm text-green-700">
                      ਤੁਹਾਡਾ ਕਾਰਡ ਜਲਦੀ ਹੀ ਤਿਆਰ ਕੀਤਾ ਜਾਵੇਗਾ।
                    </p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
