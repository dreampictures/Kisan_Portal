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
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">About Our Union</h1>
            <p className="text-lg text-muted-foreground">
              Kisan Mazdoor Sangharsh Committee Punjab stands as a pillar of strength for the agricultural community.
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
              <h2 className="text-3xl font-display font-bold text-foreground">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                We are dedicated to safeguarding the interests of farmers and laborers in Punjab. Through unity and peaceful struggle, we aim to resolve the pressing issues facing our agricultural sector.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <BadgeCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Official Recognition</h4>
                    <p className="text-sm text-muted-foreground">Recognized body fighting for farmers' rights.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Leaf className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Sustainable Future</h4>
                    <p className="text-sm text-muted-foreground">Promoting policies that ensure long-term viability.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Community Support</h4>
                    <p className="text-sm text-muted-foreground">Standing together in times of crisis and need.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Decorative image placeholder using a gradient div since we don't have a specific image */}
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/50 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#065f46_1px,transparent_1px)] [background-size:16px_16px]"></div>
                 <div className="text-center p-8">
                   <h3 className="text-2xl font-display font-bold text-primary mb-2">Leadership</h3>
                   <p className="font-semibold">Sukhdev Singh Mand</p>
                   <p className="text-sm text-muted-foreground">State Vice President</p>
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">Contact Information</h3>
          <p className="text-muted-foreground mb-8">
            For any queries or assistance, please reach out to our headquarters.
          </p>
          <div className="p-6 bg-secondary/20 rounded-xl border border-secondary">
             <p className="font-bold text-primary text-lg">Helpline: 81465 54106</p>
             <p className="text-muted-foreground mt-2">Email: Sukdev3689@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
