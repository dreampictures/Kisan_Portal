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
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
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
              Voice of the Farmers
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-primary leading-tight">
              Kisan Mazdoor <br/>
              <span className="text-foreground">Sangharsh Committee</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Uniting farmers across Punjab to protect our rights, our land, and our future. Join the movement today.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/contact">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 hover:shadow-2xl hover:-translate-y-1 transition-all">
                  Get Membership Card
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-secondary/50">
                  Learn More
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
            <motion.div variants={item} className="p-8 rounded-2xl bg-white border border-border shadow-lg shadow-black/5 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">United Strength</h3>
              <p className="text-muted-foreground leading-relaxed">
                We bring together farmers from every district to form a powerful collective voice that cannot be ignored.
              </p>
            </motion.div>

            <motion.div variants={item} className="p-8 rounded-2xl bg-white border border-border shadow-lg shadow-black/5 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Rights Protection</h3>
              <p className="text-muted-foreground leading-relaxed">
                Defending land ownership rights, fair crop prices, and fighting against unjust agricultural policies.
              </p>
            </motion.div>

            <motion.div variants={item} className="p-8 rounded-2xl bg-white border border-border shadow-lg shadow-black/5 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Official Identity</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get your official membership identity card instantly through our digital portal to verify your affiliation.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Quote/Banner */}
      <section className="py-20 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-white">
            "Kisan Jagao Desh Bachao"
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Awaken the farmer to save the country. Our struggle is not just for us, but for the food security of the entire nation.
          </p>
        </div>
      </section>
    </div>
  );
}
