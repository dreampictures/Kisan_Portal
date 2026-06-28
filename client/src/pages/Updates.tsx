import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Calendar, ImageOff, Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Update } from "@shared/schema";
import { useSEO } from "@/hooks/use-seo";

export default function Updates() {
  useSEO({
    title: "ਤਾਜ਼ੀਆਂ ਖ਼ਬਰਾਂ - Kisan Union Punjab Latest News | KMSC Kot Budha Updates",
    description: "Latest news and updates from Kisan Mazdoor Sangharsh Committee Punjab (Kot Budha). Stay informed about Kisan Union Punjab activities, protests, and farmer rights campaigns led by Inderjit Singh Kot Budha.",
    keywords: "Kisan Union Punjab news, KMSC updates, Kisan Punjab latest news, farmer protest Punjab, Kot Budha kisan news, Sukhdev Singh Mand news",
    canonical: "https://kscpkotbudha.org/updates",
  });
  const { data: updates, isLoading } = useQuery<Update[]>({
    queryKey: ["/api/updates"],
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/85 pt-14 pb-10 text-center px-4 border-b border-border/40">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center justify-center bg-primary/10 border border-primary/20 p-4 rounded-full mb-4">
            <Megaphone className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">ਤਾਜ਼ੀਆਂ ਖ਼ਬਰਾਂ</h1>
          <div className="flex justify-center mb-3">
            <div className="h-1 w-16 rounded-full bg-primary/60" />
          </div>
          <p className="text-foreground/65 text-lg font-medium">ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ ਦੀਆਂ ਅੱਪਡੇਟਸ</p>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 pb-16 max-w-4xl">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : !updates?.length ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-white rounded-2xl border border-border shadow-sm p-10 max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-primary/8 rounded-full flex items-center justify-center mx-auto mb-5">
                <Megaphone className="h-8 w-8 text-primary/40" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">ਹੁਣ ਤੱਕ ਕੋਈ ਖ਼ਬਰ ਨਹੀਂ</h3>
              <p className="text-sm text-foreground/55">ਜਲਦੀ ਹੀ ਨਵੀਆਂ ਖ਼ਬਰਾਂ ਅਤੇ ਅੱਪਡੇਟਸ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੀਆਂ।</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 mt-2">
            {updates.map((update, i) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow border border-border/60">
                  {update.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      <img
                        src={update.imageUrl}
                        alt={update.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <CardContent className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h2 className="text-xl md:text-2xl font-display font-bold text-foreground leading-tight">
                        {update.title}
                      </h2>
                      <div className="flex-shrink-0 text-right">
                        {update.eventDate && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(update.eventDate).toLocaleDateString("pa-IN", {
                              day: "2-digit", month: "long", year: "numeric"
                            })}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {new Date(update.createdAt!).toLocaleDateString("pa-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{update.content}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
