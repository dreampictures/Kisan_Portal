import { motion } from "framer-motion";
import { ArrowRight, Users, Shield, FileText, Eye, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/use-seo";

export default function Home() {
  useSEO({
    title: "ਕਿਸਾਨ ਮਜ਼ਦੂਰ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ - Kisan Union Punjab | Kot Budha | Inderjit Singh | Sukhdev Singh Mand",
    description: "ਕਿਸਾਨ ਮਜ਼ਦੂਰ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ (ਕੋਟ ਬੁੱਢਾ) - Official website of Kisan Union Punjab. Led by Inderjit Singh Kot Budha and Sukhdev Singh Mand. Register for Kisan Union membership and get your digital farmer ID card. Kisan Punjab farmers union.",
    keywords: "Kisan Union Punjab, Kisan Punjab, Sukhdev Singh Mand, Inderjit Singh Kot Budha, Kot Budha, ਕਿਸਾਨ ਯੂਨੀਅਨ ਪੰਜਾਬ, ਕਿਸਾਨ ਮਜ਼ਦੂਰ ਸੰਘਰਸ਼ ਕਮੇਟੀ, kisan card Punjab, farmer union Punjab",
    canonical: "https://kscpkotbudha.org/",
  });
  const { data: stats } = useQuery<{ total: number; today: number }>({
    queryKey: ["/api/stats"],
    refetchInterval: 60000,
  });
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-b from-primary/20 to-white/80">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />

        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent font-semibold text-sm tracking-wide">
              ਕਿਸਾਨਾਂ ਦੀ ਆਵਾਜ਼
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-primary leading-tight">
              ਕਿਸਾਨ <br />
              <span className="text-foreground">ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              ਕਿਸਾਨਾਂ ਨੂੰ ਇਕਜੁੱਟ ਕਰਨਾ ਤਾਂ ਜੋ ਸਾਡੇ ਹੱਕਾਂ, ਜ਼ਮੀਨਾਂ ਅਤੇ ਭਵਿੱਖ ਦੀ
              ਰਾਖੀ ਕੀਤੀ ਜਾ ਸਕੇ। ਅੱਜ ਹੀ ਲਹਿਰ ਦਾ ਹਿੱਸਾ ਬਣੋ।
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  ਜਥੇਬੰਦੀ ਨਾਲ ਜੁੜੋ
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-lg rounded-full border-2 hover:bg-secondary/50"
                >
                  ਹੋਰ ਜਾਣੋ
                </Button>
              </Link>
            </div>

            {/* Visitor Counter */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-6 pt-6"
              >
                <div className="flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-full px-5 py-2" data-testid="text-total-visits">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">{stats.total.toLocaleString("pa-IN")}</span>
                  <span className="text-xs text-muted-foreground">ਕੁੱਲ ਵਿਜ਼ਿਟ</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-5 py-2" data-testid="text-today-visits">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">{stats.today.toLocaleString("pa-IN")}</span>
                  <span className="text-xs text-green-600">ਅੱਜ</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/85">
        <div className="container mx-auto px-4">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div
              variants={item}
              className="p-8 rounded-2xl bg-white border border-border shadow-lg shadow-black/5 hover:border-primary/50 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">ਏਕਤਾ ਵਿੱਚ ਬਲ</h3>
              <p className="text-muted-foreground leading-relaxed">
                ਅਸੀਂ ਹਰ ਜ਼ਿਲ੍ਹੇ ਦੇ ਕਿਸਾਨਾਂ ਨੂੰ ਇਕੱਠੇ ਕਰਕੇ ਇੱਕ ਮਜ਼ਬੂਤ ਸਮੂਹਿਕ
                ਆਵਾਜ਼ ਬਣਾਉਂਦੇ ਹਾਂ ਜਿਸਨੂੰ ਅਣਗੌਲਿਆ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਦਾ।
              </p>
            </motion.div>

            <motion.div
              variants={item}
              className="p-8 rounded-2xl bg-white border border-border shadow-lg shadow-black/5 hover:border-primary/50 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">ਹੱਕਾਂ ਦੀ ਰਾਖੀ</h3>
              <p className="text-muted-foreground leading-relaxed">
                ਜ਼ਮੀਨੀ ਹੱਕਾਂ, ਫਸਲਾਂ ਦੇ ਉਚਿਤ ਭਾਅ ਅਤੇ ਬੇਇਨਸਾਫ਼ੀ ਵਾਲੀਆਂ ਖੇਤੀ ਨੀਤੀਆਂ
                ਵਿਰੁੱਧ ਲੜਾਈ।
              </p>
            </motion.div>

            <motion.div
              variants={item}
              className="p-8 rounded-2xl bg-white border border-border shadow-lg shadow-black/5 hover:border-primary/50 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">ਸਰਕਾਰੀ ਪਛਾਣ</h3>
              <p className="text-muted-foreground leading-relaxed">
                ਸਾਡੇ ਡਿਜੀਟਲ ਪੋਰਟਲ ਰਾਹੀਂ ਤੁਰੰਤ ਆਪਣਾ ਮੈਂਬਰਸ਼ਿਪ ਪਛਾਣ ਪੱਤਰ ਪ੍ਰਾਪਤ
                ਕਰੋ।
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quote/Banner */}
      <section className="py-20 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-white">
            "ਕਿਸਾਨ ਜਗਾਓ ਦੇਸ਼ ਬਚਾਓ"
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            ਦੇਸ਼ ਨੂੰ ਬਚਾਉਣ ਲਈ ਕਿਸਾਨ ਨੂੰ ਜਗਾਓ। ਸਾਡਾ ਸੰਘਰਸ਼ ਸਿਰਫ਼ ਸਾਡੇ ਲਈ ਨਹੀਂ,
            ਸਗੋਂ ਪੂਰੇ ਦੇਸ਼ ਦੀ ਅੰਨ ਸੁਰੱਖਿਆ ਲਈ ਹੈ।
          </p>
        </div>
      </section>
    </div>
  );
}
