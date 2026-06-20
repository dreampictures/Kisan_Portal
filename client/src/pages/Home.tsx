import { motion } from "framer-motion";
import { ArrowRight, Users, Shield, FileText } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-b from-primary/5 to-background">
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
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
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
