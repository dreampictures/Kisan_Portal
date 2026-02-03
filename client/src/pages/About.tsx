import { motion } from "framer-motion";
import { BadgeCheck, Leaf, HeartHandshake } from "lucide-react";

export default function About() {
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
              ਕਿਸਾਨ ਮਜ਼ਦੂਰ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ ਖੇਤੀਬਾੜੀ ਭਾਈਚਾਰੇ ਲਈ ਇੱਕ ਮਜ਼ਬੂਤ ਥੰਮ੍ਹ ਵਾਂਗ ਖੜ੍ਹੀ ਹੈ।
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-12">
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
                ਅਸੀਂ ਪੰਜਾਬ ਦੇ ਕਿਸਾਨਾਂ ਅਤੇ ਮਜ਼ਦੂਰਾਂ ਦੇ ਹਿੱਤਾਂ ਦੀ ਰਾਖੀ ਲਈ ਵਚਨਬੱਧ ਹਾਂ। ਏਕਤਾ ਅਤੇ ਸ਼ਾਂਤਮਈ ਸੰਘਰਸ਼ ਰਾਹੀਂ, ਅਸੀਂ ਖੇਤੀਬਾੜੀ ਖੇਤਰ ਦੇ ਭਖਦੇ ਮਸਲਿਆਂ ਨੂੰ ਹੱਲ ਕਰਨ ਦਾ ਟੀਚਾ ਰੱਖਦੇ ਹਾਂ।
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
            
            <div className="relative">
              {/* Decorative image placeholder using a gradient div since we don't have a specific image */}
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/50 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#065f46_1px,transparent_1px)] [background-size:16px_16px]"></div>
                 <div className="text-center p-8">
                   <h3 className="text-2xl font-display font-bold text-primary mb-2">ਅਗਵਾਈ</h3>
                   <p className="font-semibold">ਸੁਖਦੇਵ ਸਿੰਘ ਮੰਡ</p>
                   <p className="text-sm text-muted-foreground">ਸੂਬਾ ਮੀਤ ਪ੍ਰਧਾਨ</p>
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-16 text-center max-w-2xl mx-auto">
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
