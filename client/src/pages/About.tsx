import { motion } from "framer-motion";
import { BadgeCheck, Leaf, HeartHandshake, Wheat, Zap, Users, Shield, MapPin, Scale } from "lucide-react";
import inderjitPhoto from "@assets/IMG_1715_1781841729335.jpeg";
import sukhdevPhoto from "@assets/IMG_1716_1781843047103.jpeg";

export default function About() {
  const works = [
    { icon: Scale, title: "ਕਿਸਾਨਾਂ ਦੇ ਹੱਕਾਂ ਲਈ ਸੰਘਰਸ਼", desc: "ਫਸਲਾਂ ਦੇ ਰੇਟ, ਐਮ.ਐਸ.ਪੀ., ਮੰਡੀ ਪ੍ਰਬੰਧ ਅਤੇ ਕਿਸਾਨਾਂ ਦੀਆਂ ਮੰਗਾਂ ਲਈ ਸਰਕਾਰਾਂ ਨਾਲ ਗੱਲਬਾਤ, ਧਰਨੇ, ਰੈਲੀਆਂ।" },
    { icon: Wheat, title: "ਮੰਡੀਆਂ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ", desc: "ਝੋਨੇ ਅਤੇ ਹੋਰ ਫਸਲਾਂ ਦੀ ਖਰੀਦ ਵਿੱਚ ਦੇਰੀ ਹੋਣ ਤੇ ਪ੍ਰਸ਼ਾਸਨ 'ਤੇ ਦਬਾਅ ਬਣਾਉਣਾ।" },
    { icon: MapPin, title: "ਜ਼ਮੀਨ ਅਤੇ ਕਿਸਾਨੀ ਹੱਕ", desc: "ਜ਼ਮੀਨ ਐਕਵਾਇਰ ਹੋਣ ਜਾਂ ਜ਼ਮੀਨੀ ਹੱਕਾਂ ਨੂੰ ਖ਼ਤਰੇ ਤੇ ਪ੍ਰਭਾਵਿਤ ਕਿਸਾਨਾਂ ਦਾ ਸਾਥ।" },
    { icon: Zap, title: "ਬਿਜਲੀ ਅਤੇ ਨੀਤੀਆਂ", desc: "ਬਿਜਲੀ ਨਿੱਜੀਕਰਨ, ਸਮਾਰਟ ਮੀਟਰ ਅਤੇ ਖੇਤੀਬਾੜੀ ਨੀਤੀਆਂ ਵਿਰੁੱਧ ਆਵਾਜ਼।" },
    { icon: Shield, title: "ਟੋਲ ਅਤੇ ਕਾਰਪੋਰੇਟ ਵਿਰੋਧ", desc: "ਟੋਲ ਪਲਾਜ਼ੇ ਮੁਫ਼ਤ ਕਰਵਾਉਣ ਅਤੇ ਕਾਰਪੋਰੇਟ ਨੀਤੀਆਂ ਵਿਰੁੱਧ ਧਰਨੇ।" },
    { icon: HeartHandshake, title: "ਮੁਆਵਜ਼ੇ ਦੀ ਮੰਗ", desc: "ਗੜੇਮਾਰੀ, ਹੜ੍ਹ ਜਾਂ ਕੁਦਰਤੀ ਆਫ਼ਤਾਂ ਨਾਲ ਫਸਲ ਨੁਕਸਾਨ ਤੇ ਸਰਕਾਰ ਤੋਂ ਮੁਆਵਜ਼ਾ।" },
    { icon: Wheat, title: "ਕਿਸਾਨ ਅੰਦੋਲਨਾਂ ਵਿੱਚ ਹਿੱਸਾ", desc: "ਸ਼ੰਭੂ ਬਾਰਡਰ, ਖਨੌਰੀ ਮੋਰਚਾ ਅਤੇ ਵੱਡੇ ਕਿਸਾਨ ਅੰਦੋਲਨਾਂ ਵਿੱਚ ਮੈਂਬਰਾਂ ਸਮੇਤ ਭਾਗ।" },
    { icon: Users, title: "ਪਿੰਡ ਪੱਧਰ ਸੰਗਠਨ", desc: "ਪਿੰਡਾਂ, ਬਲਾਕਾਂ ਅਤੇ ਜ਼ਿਲ੍ਹਿਆਂ ਵਿੱਚ ਕਮੇਟੀਆਂ ਬਣਾ ਕੇ ਕਿਸਾਨਾਂ ਨੂੰ ਇੱਕਜੁੱਟ ਕਰਨਾ।" },
    { icon: BadgeCheck, title: "ਪੰਜਾਬ ਦੇ ਹੱਕ", desc: "BBMB, ਪਾਣੀਆਂ ਦੇ ਮੁੱਦੇ ਅਤੇ ਪੰਜਾਬ ਦੇ ਹਿੱਤਾਂ ਨਾਲ ਸੰਬੰਧਤ ਮਾਮਲਿਆਂ 'ਤੇ ਪ੍ਰਦਰਸ਼ਨ।" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-secondary/30 pt-16 pb-24 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">ਸਾਡੀ ਯੂਨੀਅਨ ਬਾਰੇ</h1>
            <p className="text-lg text-muted-foreground">
              ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ (ਕੋਟ ਬੁੱਢਾ) ਖੇਤੀਬਾੜੀ ਭਾਈਚਾਰੇ ਲਈ ਇੱਕ ਮਜ਼ਬੂਤ ਥੰਮ੍ਹ ਵਾਂਗ ਖੜ੍ਹੀ ਹੈ।
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-12">
        {/* Mission + Leadership */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl p-8 md:p-12 shadow-xl border border-border"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-display font-bold text-foreground">ਸਾਡਾ ਮਿਸ਼ਨ</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                ਅਸੀਂ ਪੰਜਾਬ ਦੇ ਕਿਸਾਨਾਂ ਦੇ ਹਿੱਤਾਂ ਦੀ ਰਾਖੀ ਲਈ ਵਚਨਬੱਧ ਹਾਂ। ਏਕਤਾ ਅਤੇ ਸ਼ਾਂਤਮਈ ਸੰਘਰਸ਼ ਰਾਹੀਂ, ਅਸੀਂ ਖੇਤੀਬਾੜੀ ਖੇਤਰ ਦੇ ਭਖਦੇ ਮਸਲਿਆਂ ਨੂੰ ਹੱਲ ਕਰਨ ਦਾ ਟੀਚਾ ਰੱਖਦੇ ਹਾਂ।
              </p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <BadgeCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">ਸਰਕਾਰੀ ਮਾਨਤਾ</h4>
                    <p className="text-sm text-muted-foreground">ਕਿਸਾਨਾਂ ਦੇ ਹੱਕਾਂ ਲਈ ਲੜਨ ਵਾਲੀ ਮਾਨਤਾ ਪ੍ਰਾਪਤ ਜਥੇਬੰਦੀ।</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Leaf className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">ਸੁਨਹਿਰੀ ਭਵਿੱਖ</h4>
                    <p className="text-sm text-muted-foreground">ਅਜਿਹੀਆਂ ਨੀਤੀਆਂ ਨੂੰ ਉਤਸ਼ਾਹਿਤ ਕਰਨਾ ਜੋ ਲੰਬੇ ਸਮੇਂ ਦੀ ਖੁਸ਼ਹਾਲੀ ਯਕੀਨੀ ਬਣਾਉਣ।</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">ਭਾਈਚਾਰਕ ਸਾਂਝ</h4>
                    <p className="text-sm text-muted-foreground">ਸੰਕਟ ਅਤੇ ਲੋੜ ਦੇ ਸਮੇਂ ਇੱਕਜੁੱਟ ਹੋ ਕੇ ਖੜੇ ਹੋਣਾ।</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold text-foreground text-center">ਸੂਬਾਈ ਅਗਵਾਈ</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-b from-primary/10 to-primary/5 rounded-2xl p-5 text-center border border-primary/20 shadow-sm">
                  <div className="w-24 h-24 rounded-full mx-auto mb-3 overflow-hidden border-4 border-primary/30">
                    <img src={inderjitPhoto} alt="ਇੰਦਰਜੀਤ ਸਿੰਘ" className="w-full h-full object-cover object-top" />
                  </div>
                  <p className="font-bold text-foreground text-sm leading-tight">ਇੰਦਰਜੀਤ ਸਿੰਘ</p>
                  <p className="text-xs text-primary font-semibold mt-1">ਸੂਬਾ ਪ੍ਰਧਾਨ</p>
                </div>
                <div className="bg-gradient-to-b from-secondary/30 to-secondary/10 rounded-2xl p-5 text-center border border-border shadow-sm">
                  <div className="w-24 h-24 rounded-full mx-auto mb-3 overflow-hidden border-4 border-border">
                    <img src={sukhdevPhoto} alt="ਸੁਖਦੇਵ ਸਿੰਘ ਮੰਡ" className="w-full h-full object-cover object-top" />
                  </div>
                  <p className="font-bold text-foreground text-sm leading-tight">ਸੁਖਦੇਵ ਸਿੰਘ ਮੰਡ</p>
                  <p className="text-xs text-primary font-semibold mt-1">ਸੂਬਾ ਮੀਤ ਪ੍ਰਧਾਨ</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Leadership big cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10 bg-card rounded-3xl p-8 md:p-10 shadow-xl border border-border"
        >
          <h2 className="text-2xl font-display font-bold text-center mb-8">ਕਮੇਟੀ ਦੇ ਸੰਸਥਾਪਕ</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-b from-primary/10 to-primary/5 border border-primary/20">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-primary/40 shadow-lg">
                <img src={inderjitPhoto} alt="ਇੰਦਰਜੀਤ ਸਿੰਘ" className="w-full h-full object-cover object-top" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground">ਇੰਦਰਜੀਤ ਸਿੰਘ</h3>
                <p className="text-primary font-semibold mt-1">ਸੂਬਾ ਪ੍ਰਧਾਨ</p>
                <p className="text-sm text-muted-foreground mt-2">ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ ( ਕੋਟ ਬੁੱਢਾ)</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-b from-secondary/30 to-secondary/10 border border-border">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-border shadow-lg">
                <img src={sukhdevPhoto} alt="ਸੁਖਦੇਵ ਸਿੰਘ ਮੰਡ" className="w-full h-full object-cover object-top" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground">ਸੁਖਦੇਵ ਸਿੰਘ ਮੰਡ</h3>
                <p className="text-primary font-semibold mt-1">ਸੂਬਾ ਮੀਤ ਪ੍ਰਧਾਨ</p>
                <p className="text-sm text-muted-foreground mt-2">ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ ( ਕੋਟ ਬੁੱਢਾ)</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* What we do */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 bg-card rounded-3xl p-8 md:p-10 shadow-xl border border-border"
        >
          <h2 className="text-2xl font-display font-bold text-center mb-2">ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਕੀ-ਕੀ ਕੰਮ ਕਰਦੀ ਹੈ?</h2>
          <p className="text-center text-muted-foreground mb-8 text-sm">ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ (ਕੋਟ ਬੁੱਢਾ) ਸਿਰਫ਼ ਫਸਲਾਂ ਦੇ ਰੇਟਾਂ ਤੱਕ ਸੀਮਿਤ ਨਹੀਂ — ਕਿਸਾਨਾਂ ਦੇ ਹਰ ਮੁੱਦੇ ਲਈ ਲੜਾਈ।</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {works.map((w, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-secondary/20 border border-border hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <w.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm leading-tight mb-1">{w.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 bg-primary/5 rounded-2xl border border-primary/20 text-center">
            <p className="text-sm text-foreground font-medium leading-relaxed">
              ਇਸ ਜਥੇਬੰਦੀ ਨੇ MSP ਮੰਗਾਂ ਲਈ ਮੋਰਚੇ, ਸ਼ੰਭੂ-ਖਨੌਰੀ ਅੰਦੋਲਨਾਂ ਵਿੱਚ ਭਾਗ, ਜ਼ਮੀਨ ਬਚਾਉਣ ਦਾ ਸੰਘਰਸ਼, ਬਿਜਲੀ ਨਿੱਜੀਕਰਨ ਵਿਰੋਧ, ਰੇਲ ਰੋਕੋ ਅਤੇ ਪਿੰਡ ਪੱਧਰ ਸੰਗਠਨ ਰਾਹੀਂ ਕਿਸਾਨਾਂ ਦੀ ਆਵਾਜ਼ ਬਣਨ ਦਾ ਕੰਮ ਕੀਤਾ ਹੈ।
            </p>
          </div>
        </motion.div>

        {/* Contact */}
        <div className="mt-10 text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">ਸੰਪਰਕ ਜਾਣਕਾਰੀ</h3>
          <p className="text-muted-foreground mb-8">
            ਕਿਸੇ ਵੀ ਪੁੱਛਗਿੱਛ ਜਾਂ ਸਹਾਇਤਾ ਲਈ, ਕਿਰਪਾ ਕਰਕੇ ਸਾਡੇ ਮੁੱਖ ਦਫਤਰ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।
          </p>
          <div className="p-6 bg-secondary/20 rounded-xl border border-secondary">
            <p className="font-bold text-primary text-lg">ਹੈਲਪਲਾਈਨ: 81465 54106</p>
            <p className="text-muted-foreground mt-2">ਈਮੇਲ: Sukdev3689@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
