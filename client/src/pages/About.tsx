import { motion } from "framer-motion";
import { BadgeCheck, Leaf, HeartHandshake, Wheat, Zap, Users, Shield, MapPin, Scale, Train, Flame } from "lucide-react";
import inderjitPhoto from "@assets/IMG_1715_1781841729335.jpeg";
import sukhdevPhoto from "@assets/IMG_1716_1781843047103.jpeg";
import { useSEO } from "@/hooks/use-seo";

export default function About() {
  useSEO({
    title: "ਯੂਨੀਅਨ ਬਾਰੇ - Inderjit Singh Kot Budha & Sukhdev Singh Mand | Kisan Union Punjab",
    description: "Learn about Kisan Mazdoor Sangharsh Committee Punjab (Kot Budha). Led by Inderjit Singh Kot Budha and Sukhdev Singh Mand. Fighting for farmers rights, MSP, and agricultural justice in Punjab.",
    keywords: "Inderjit Singh Kot Budha, Sukhdev Singh Mand, Kisan Union Punjab about, KMSC Punjab leaders, Kot Budha kisan union, ਇੰਦਰਜੀਤ ਸਿੰਘ ਕੋਟ ਬੁੱਢਾ, ਸੁਖਦੇਵ ਸਿੰਘ ਮਾਂਡ",
    canonical: "https://kscpkotbudha.org/about",
  });
  const works = [
    {
      icon: Scale,
      title: "੧. ਕਿਸਾਨਾਂ ਦੇ ਹੱਕਾਂ ਲਈ ਸੰਘਰਸ਼",
      desc: "ਜਥੇਬੰਦੀ ਫਸਲਾਂ ਦੇ ਰੇਟ, ਐਮ.ਐਸ.ਪੀ. (ਘੱਟੋ-ਘੱਟ ਸਮਰਥਨ ਮੁੱਲ), ਮੰਡੀ ਪ੍ਰਬੰਧ, ਫਸਲ ਖਰੀਦ ਅਤੇ ਕਿਸਾਨਾਂ ਦੀਆਂ ਹੋਰ ਮੰਗਾਂ ਨੂੰ ਲੈ ਕੇ ਸਰਕਾਰਾਂ ਨਾਲ ਸਿੱਧੀ ਗੱਲਬਾਤ ਕਰਦੀ ਹੈ। ਜਦੋਂ ਗੱਲਬਾਤ ਨਾਲ ਕੰਮ ਨਹੀਂ ਚੱਲਦਾ, ਤਾਂ ਲੋੜ ਪੈਣ 'ਤੇ ਵੱਡੇ ਧਰਨੇ, ਰੈਲੀਆਂ ਅਤੇ ਮੋਰਚੇ ਲਗਾਏ ਜਾਂਦੇ ਹਨ ਤਾਂ ਜੋ ਸਰਕਾਰ ਕਿਸਾਨਾਂ ਦੀ ਆਵਾਜ਼ ਸੁਣਨ ਲਈ ਮਜਬੂਰ ਹੋਵੇ।",
    },
    {
      icon: Wheat,
      title: "੨. ਮੰਡੀਆਂ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ ਉਠਾਉਣਾ",
      desc: "ਜਦੋਂ ਪੰਜਾਬ ਦੀਆਂ ਮੰਡੀਆਂ ਵਿੱਚ ਝੋਨਾ, ਕਣਕ ਜਾਂ ਹੋਰ ਫਸਲਾਂ ਦੀ ਖਰੀਦ ਵਿੱਚ ਦੇਰੀ ਹੁੰਦੀ ਹੈ ਜਾਂ ਕਿਸਾਨਾਂ ਨੂੰ ਫਸਲ ਵੇਚਣ ਵਿੱਚ ਮੁਸ਼ਕਲਾਂ ਆਉਂਦੀਆਂ ਹਨ, ਤਾਂ ਜਥੇਬੰਦੀ ਤੁਰੰਤ ਕਿਸਾਨਾਂ ਦੀ ਆਵਾਜ਼ ਬਣਦੀ ਹੈ। ਪ੍ਰਸ਼ਾਸਨ 'ਤੇ ਦਬਾਅ ਪਾ ਕੇ ਫਸਲ ਦੀ ਖਰੀਦ ਅਤੇ ਲਿਫਟਿੰਗ ਸਮੇਂ ਸਿਰ ਕਰਵਾਉਣਾ ਸੁਨਿਸ਼ਚਿਤ ਕੀਤਾ ਜਾਂਦਾ ਹੈ। ਕਮੇਟੀ ਨੇ ਕਈ ਵਾਰ ਸਰਕਾਰ ਨੂੰ ਚੇਤਾਵਨੀ ਦਿੱਤੀ ਹੈ ਕਿ ਜੇ ਫਸਲ ਨਾ ਚੁੱਕੀ ਗਈ ਤਾਂ ਵੱਡਾ ਸੰਘਰਸ਼ ਕੀਤਾ ਜਾਵੇਗਾ।",
    },
    {
      icon: MapPin,
      title: "੩. ਜ਼ਮੀਨ ਅਤੇ ਕਿਸਾਨੀ ਹੱਕਾਂ ਦੀ ਰਾਖੀ",
      desc: "ਜੇ ਕਿਸਾਨਾਂ ਦੀ ਜ਼ਮੀਨ ਗਮਾਡਾ ਜਾਂ ਹੋਰ ਸਰਕਾਰੀ ਏਜੰਸੀਆਂ ਵੱਲੋਂ ਐਕਵਾਇਰ ਕੀਤੀ ਜਾਂਦੀ ਹੈ ਜਾਂ ਜ਼ਮੀਨੀ ਹੱਕਾਂ ਨੂੰ ਕਿਸੇ ਵੀ ਤਰ੍ਹਾਂ ਦਾ ਖ਼ਤਰਾ ਹੁੰਦਾ ਹੈ, ਤਾਂ ਜਥੇਬੰਦੀ ਪ੍ਰਭਾਵਿਤ ਕਿਸਾਨਾਂ ਦੇ ਨਾਲ ਖੜ੍ਹਦੀ ਹੈ ਅਤੇ ਕਾਨੂੰਨੀ ਅਤੇ ਸੰਘਰਸ਼ੀ ਦੋਵਾਂ ਤਰੀਕਿਆਂ ਨਾਲ ਲੜਾਈ ਲੜਦੀ ਹੈ। ਕਮੇਟੀ ਨੇ 'ਇਨਸਾਫ਼ ਮੋਰਚੇ' ਵਿੱਚ ਵੀ ਸਰਗਰਮੀ ਨਾਲ ਭਾਗ ਲਿਆ ਹੈ।",
    },
    {
      icon: Zap,
      title: "੪. ਬਿਜਲੀ, ਪਾਣੀ ਅਤੇ ਖੇਤੀ ਨੀਤੀਆਂ",
      desc: "ਕਮੇਟੀ ਬਿਜਲੀ ਖੇਤਰ ਦੇ ਨਿੱਜੀਕਰਨ, ਸਮਾਰਟ ਮੀਟਰਾਂ, ਬਿਜਲੀ ਐਕਟ 2025, ਨਹਿਰੀ ਪਾਣੀ ਅਤੇ ਟਿਊਬਵੈੱਲ ਬਿਜਲੀ ਨਾਲ ਜੁੜੇ ਮਾਮਲਿਆਂ 'ਤੇ ਆਪਣਾ ਸਪੱਸ਼ਟ ਸਟੈਂਡ ਲੈਂਦੀ ਹੈ। ਕਮੇਟੀ ਦਾ ਮੰਨਣਾ ਹੈ ਕਿ ਬਿਜਲੀ ਨਿੱਜੀਕਰਨ ਨਾਲ ਕਿਸਾਨਾਂ ਅਤੇ ਆਮ ਲੋਕਾਂ 'ਤੇ ਬੋਝ ਵਧੇਗਾ, ਇਸ ਲਈ ਪਿੰਡ ਪੱਧਰ 'ਤੇ ਮੀਟਿੰਗਾਂ ਅਤੇ ਪ੍ਰਦਰਸ਼ਨ ਕੀਤੇ ਜਾਂਦੇ ਹਨ।",
    },
    {
      icon: Shield,
      title: "੫. ਟੋਲ ਅਤੇ ਕਾਰਪੋਰੇਟ ਨੀਤੀਆਂ ਵਿਰੁੱਧ",
      desc: "ਕਮੇਟੀ ਹੋਰ ਕਿਸਾਨ ਜਥੇਬੰਦੀਆਂ ਨਾਲ ਮਿਲ ਕੇ ਟੋਲ ਪਲਾਜ਼ੇ ਮੁਫ਼ਤ ਕਰਵਾਉਣ ਅਤੇ ਕਾਰਪੋਰੇਟ ਨੀਤੀਆਂ ਦਾ ਵਿਰੋਧ ਕਰਦੀ ਆਈ ਹੈ। ਕਿਸਾਨਾਂ ਦੀ ਮਿਹਨਤ ਦਾ ਫਾਇਦਾ ਕਾਰਪੋਰੇਟ ਕੰਪਨੀਆਂ ਨੂੰ ਨਾ ਮਿਲੇ, ਇਸ ਮੰਤਵ ਨਾਲ ਜਥੇਬੰਦੀ ਸਰਗਰਮੀ ਨਾਲ ਧਰਨੇ ਅਤੇ ਰੋਸ ਮਾਰਚ ਕਰਦੀ ਰਹਿੰਦੀ ਹੈ।",
    },
    {
      icon: HeartHandshake,
      title: "੬. ਕੁਦਰਤੀ ਆਫ਼ਤਾਂ ਕਾਰਨ ਮੁਆਵਜ਼ਾ",
      desc: "ਗੜੇਮਾਰੀ, ਹੜ੍ਹ, ਬਹੁਤ ਜ਼ਿਆਦਾ ਮੀਂਹ ਜਾਂ ਹੋਰ ਕੁਦਰਤੀ ਆਫ਼ਤਾਂ ਕਾਰਨ ਜਦੋਂ ਕਿਸਾਨਾਂ ਦੀਆਂ ਫਸਲਾਂ ਦਾ ਨੁਕਸਾਨ ਹੁੰਦਾ ਹੈ, ਤਾਂ ਜਥੇਬੰਦੀ ਸਰਕਾਰ ਤੋਂ ਉਚਿਤ ਮੁਆਵਜ਼ੇ ਦੀ ਮੰਗ ਕਰਦੀ ਹੈ। ਕਮੇਟੀ ਪ੍ਰਭਾਵਿਤ ਖੇਤਰਾਂ ਦਾ ਸਰਵੇਖਣ ਕਰਵਾਉਣ ਅਤੇ ਮੁਆਵਜ਼ਾ ਤੁਰੰਤ ਦਿਵਾਉਣ ਲਈ ਸਰਕਾਰ 'ਤੇ ਦਬਾਅ ਬਣਾਉਂਦੀ ਹੈ।",
    },
    {
      icon: Flame,
      title: "੭. ਵੱਡੇ ਕਿਸਾਨ ਅੰਦੋਲਨਾਂ ਵਿੱਚ ਭਾਗ",
      desc: "ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ (ਕੋਟ ਬੁੱਢਾ) ਨੇ ਸ਼ੰਭੂ ਬਾਰਡਰ ਅਤੇ ਖਨੌਰੀ ਮੋਰਚਿਆਂ ਵਿੱਚ ਵੱਡੀ ਗਿਣਤੀ ਵਿੱਚ ਕਿਸਾਨਾਂ ਦੀ ਸ਼ਮੂਲੀਅਤ ਕਰਵਾਈ। ਕੇਂਦਰ ਸਰਕਾਰ ਤੋਂ MSP ਦੀ ਕਾਨੂੰਨੀ ਗਾਰੰਟੀ ਸਮੇਤ ਹੋਰ ਕਿਸਾਨ ਮੰਗਾਂ ਲਈ ਡੱਟ ਕੇ ਸੰਘਰਸ਼ ਕੀਤਾ। ਤਰਨ ਤਾਰਨ ਵਿੱਚ ਜ਼ਿਲ੍ਹਾ ਪ੍ਰਸ਼ਾਸਕੀ ਕੰਪਲੈਕਸ ਅੱਗੇ ਭੁੱਖ ਹੜਤਾਲਾਂ ਵੀ ਕੀਤੀਆਂ ਗਈਆਂ।",
    },
    {
      icon: Users,
      title: "੮. ਪਿੰਡ ਪੱਧਰ 'ਤੇ ਸੰਗਠਨ ਮਜ਼ਬੂਤ ਕਰਨਾ",
      desc: "ਕਮੇਟੀ ਪੰਜਾਬ ਦੇ ਵੱਖ-ਵੱਖ ਜ਼ਿਲ੍ਹਿਆਂ, ਬਲਾਕਾਂ ਅਤੇ ਪਿੰਡਾਂ ਵਿੱਚ ਨਵੀਆਂ ਇਕਾਈਆਂ ਬਣਾਉਂਦੀ ਹੈ, ਨਿਯਮਿਤ ਮੀਟਿੰਗਾਂ ਕਰਦੀ ਹੈ ਅਤੇ ਕਿਸਾਨਾਂ ਨੂੰ ਇੱਕਜੁੱਟ ਕਰਕੇ ਸੰਗਠਨ ਨੂੰ ਮਜ਼ਬੂਤ ਕਰਦੀ ਹੈ। ਕਈ ਥਾਵਾਂ 'ਤੇ ਸੈਂਕੜਿਆਂ ਮੈਂਬਰਾਂ ਵਾਲੀਆਂ ਕਮੇਟੀਆਂ ਗਠਿਤ ਕੀਤੀਆਂ ਗਈਆਂ ਹਨ।",
    },
    {
      icon: BadgeCheck,
      title: "੯. ਪੰਜਾਬ ਦੇ ਹੱਕਾਂ ਦੀ ਲੜਾਈ",
      desc: "ਭਾਖੜਾ ਬਿਆਸ ਮੈਨੇਜਮੈਂਟ ਬੋਰਡ (BBMB), ਦਰਿਆਈ ਪਾਣੀਆਂ ਦੇ ਮੁੱਦੇ ਅਤੇ ਪੰਜਾਬ ਦੇ ਆਮ ਹਿੱਤਾਂ ਨਾਲ ਸੰਬੰਧਤ ਮਾਮਲਿਆਂ 'ਤੇ ਜਥੇਬੰਦੀ ਆਪਣਾ ਸਪੱਸ਼ਟ ਪੱਖ ਰੱਖਦੀ ਹੈ ਅਤੇ ਲੋੜ ਪੈਣ 'ਤੇ ਪ੍ਰਦਰਸ਼ਨ ਵੀ ਕਰਦੀ ਹੈ। ਮਹਿੰਗਾਈ ਵਿਰੁੱਧ — ਡੀਜ਼ਲ, ਖਾਦਾਂ, ਖੇਤੀ ਲਾਗਤਾਂ ਵਿੱਚ ਵਾਧੇ ਦੇ ਖ਼ਿਲਾਫ਼ ਵੀ ਕਮੇਟੀ ਹਮੇਸ਼ਾ ਖੜ੍ਹਦੀ ਹੈ।",
    },
    {
      icon: Train,
      title: "੧੦. ਰੇਲ ਰੋਕੋ ਅਤੇ ਰਾਜ ਪੱਧਰੀ ਅੰਦੋਲਨ",
      desc: "ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਨੇ ਕਿਸਾਨ ਮਜ਼ਦੂਰ ਮੋਰਚੇ ਅਤੇ ਹੋਰ ਜਥੇਬੰਦੀਆਂ ਨਾਲ ਮਿਲ ਕੇ ਰੇਲ ਰੋਕੋ ਅੰਦੋਲਨਾਂ ਅਤੇ ਸੂਬਾ ਪੱਧਰੀ ਪ੍ਰਦਰਸ਼ਨਾਂ ਵਿੱਚ ਭਾਗ ਲਿਆ ਹੈ। ਕਈ ਥਾਵਾਂ 'ਤੇ ਪੰਜਾਬ ਅਤੇ ਕੇਂਦਰ ਸਰਕਾਰ ਦੀਆਂ ਕਿਸਾਨ ਵਿਰੋਧੀ ਨੀਤੀਆਂ ਦੇ ਵਿਰੁੱਧ SDM ਦਫ਼ਤਰਾਂ ਅੱਗੇ ਪੁਤਲੇ ਫੂਕੇ ਗਏ ਅਤੇ ਜ਼ੋਰਦਾਰ ਰੋਸ ਮਾਰਚ ਕੀਤੇ ਗਏ।",
    },
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
            <p className="text-lg text-muted-foreground leading-relaxed">
              ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ (ਕੋਟ ਬੁੱਢਾ) ਪੰਜਾਬ ਦੇ ਕਿਸਾਨਾਂ ਲਈ ਇੱਕ ਮਜ਼ਬੂਤ ਅਤੇ ਭਰੋਸੇਯੋਗ ਜਥੇਬੰਦੀ ਵਜੋਂ ਉੱਭਰੀ ਹੈ। ਇਹ ਕਮੇਟੀ ਖੇਤੀਬਾੜੀ ਭਾਈਚਾਰੇ ਦੇ ਹਰ ਦਰਦ ਅਤੇ ਹਰ ਮੁੱਦੇ ਲਈ ਇੱਕ ਥੰਮ੍ਹ ਵਾਂਗ ਖੜ੍ਹਦੀ ਹੈ।
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
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <h2 className="text-3xl font-display font-bold text-foreground">ਸਾਡਾ ਮਿਸ਼ਨ</h2>
              <p className="text-muted-foreground leading-relaxed text-base">
                ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ (ਕੋਟ ਬੁੱਢਾ) ਇੱਕ ਅਜਿਹੀ ਜਥੇਬੰਦੀ ਹੈ ਜੋ ਸਿਰਫ਼ ਫਸਲਾਂ ਦੇ ਰੇਟਾਂ ਤੱਕ ਸੀਮਿਤ ਨਹੀਂ — ਇਹ ਕਿਸਾਨਾਂ ਦੀ ਜ਼ਮੀਨ, ਪਾਣੀ, ਬਿਜਲੀ, ਮੰਡੀਆਂ, ਮੁਆਵਜ਼ੇ ਅਤੇ ਸਰਕਾਰੀ ਨੀਤੀਆਂ ਨਾਲ ਜੁੜੇ ਹਰ ਮੁੱਦੇ 'ਤੇ ਕਿਸਾਨਾਂ ਦੀ ਆਵਾਜ਼ ਬਣਦੀ ਹੈ।
              </p>
              <p className="text-muted-foreground leading-relaxed text-base">
                ਅਸੀਂ ਏਕਤਾ ਅਤੇ ਸ਼ਾਂਤਮਈ ਸੰਘਰਸ਼ ਰਾਹੀਂ ਖੇਤੀਬਾੜੀ ਖੇਤਰ ਦੇ ਭਖਦੇ ਮਸਲਿਆਂ ਨੂੰ ਹੱਲ ਕਰਨ ਲਈ ਵਚਨਬੱਧ ਹਾਂ। ਸਾਡਾ ਵਿਸ਼ਵਾਸ ਹੈ ਕਿ ਜਦੋਂ ਕਿਸਾਨ ਇੱਕਜੁੱਟ ਹੁੰਦੇ ਹਨ, ਕੋਈ ਵੀ ਸਰਕਾਰ ਉਨ੍ਹਾਂ ਦੀ ਆਵਾਜ਼ ਨੂੰ ਨਜ਼ਰਅੰਦਾਜ਼ ਨਹੀਂ ਕਰ ਸਕਦੀ।
              </p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <BadgeCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">ਸਰਕਾਰੀ ਮਾਨਤਾ</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">ਕਿਸਾਨਾਂ ਦੇ ਹੱਕਾਂ ਲਈ ਲੜਨ ਵਾਲੀ ਮਾਨਤਾ ਪ੍ਰਾਪਤ ਜਥੇਬੰਦੀ ਜੋ ਸਰਕਾਰਾਂ ਅਤੇ ਪ੍ਰਸ਼ਾਸਨ ਨਾਲ ਸਿੱਧੀ ਗੱਲਬਾਤ ਕਰਦੀ ਹੈ।</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Leaf className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">ਸੁਨਹਿਰੀ ਭਵਿੱਖ</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">ਅਜਿਹੀਆਂ ਨੀਤੀਆਂ ਨੂੰ ਉਤਸ਼ਾਹਿਤ ਕਰਨਾ ਜੋ ਕਿਸਾਨਾਂ ਦੀ ਆਉਣ ਵਾਲੀ ਪੀੜ੍ਹੀ ਲਈ ਲੰਬੇ ਸਮੇਂ ਦੀ ਖੁਸ਼ਹਾਲੀ ਅਤੇ ਖੇਤੀਬਾੜੀ ਦੀ ਸਥਿਰਤਾ ਯਕੀਨੀ ਬਣਾਉਣ।</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">ਭਾਈਚਾਰਕ ਸਾਂਝ</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">ਸੰਕਟ ਅਤੇ ਲੋੜ ਦੇ ਸਮੇਂ ਕਿਸਾਨਾਂ ਦੇ ਨਾਲ ਇੱਕਜੁੱਟ ਹੋ ਕੇ ਖੜੇ ਹੋਣਾ ਅਤੇ ਪਿੰਡਾਂ ਵਿੱਚ ਸੰਗਠਨ ਨੂੰ ਮਜ਼ਬੂਤ ਕਰਨਾ।</p>
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
          <h2 className="text-2xl font-display font-bold text-center mb-2">ਕਮੇਟੀ ਦੇ ਸੰਸਥਾਪਕ</h2>
          <p className="text-center text-muted-foreground mb-8 text-sm">ਜਿਨ੍ਹਾਂ ਦੀ ਅਗਵਾਈ ਵਿੱਚ ਕਿਸਾਨ ਸੰਘਰਸ਼ ਦੀ ਇਹ ਲਹਿਰ ਅੱਗੇ ਵਧ ਰਹੀ ਹੈ</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-b from-primary/10 to-primary/5 border border-primary/20">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-primary/40 shadow-lg">
                <img src={inderjitPhoto} alt="ਇੰਦਰਜੀਤ ਸਿੰਘ" className="w-full h-full object-cover object-top" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground">ਇੰਦਰਜੀਤ ਸਿੰਘ</h3>
                <p className="text-primary font-semibold mt-1">ਸੂਬਾ ਪ੍ਰਧਾਨ</p>
                <p className="text-sm text-muted-foreground mt-2">ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ ( ਕੋਟ ਬੁੱਢਾ)</p>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">ਕਿਸਾਨ ਅੰਦੋਲਨਾਂ ਵਿੱਚ ਸਰਗਰਮ ਭੂਮਿਕਾ ਨਿਭਾਉਂਦੇ ਹੋਏ ਕਮੇਟੀ ਨੂੰ ਸੂਬਾ ਪੱਧਰ 'ਤੇ ਮਜ਼ਬੂਤ ਕੀਤਾ।</p>
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
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">ਪਿੰਡ ਪੱਧਰ 'ਤੇ ਕਿਸਾਨਾਂ ਨੂੰ ਇੱਕਜੁੱਟ ਕਰਨ ਅਤੇ ਸੰਗਠਨ ਦਾ ਵਿਸਥਾਰ ਕਰਨ ਵਿੱਚ ਅਹਿਮ ਭੂਮਿਕਾ।</p>
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
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ (ਕੋਟ ਬੁੱਢਾ) ਆਪਣੇ ਆਪ ਨੂੰ ਸਿਰਫ਼ ਫਸਲਾਂ ਦੇ ਰੇਟਾਂ ਤੱਕ ਸੀਮਿਤ ਨਹੀਂ ਰੱਖਦੀ, ਸਗੋਂ ਕਿਸਾਨਾਂ ਦੀ ਜ਼ਮੀਨ, ਪਾਣੀ, ਬਿਜਲੀ, ਮੰਡੀਆਂ, ਮੁਆਵਜ਼ੇ, ਸਰਕਾਰੀ ਨੀਤੀਆਂ ਅਤੇ ਪੰਜਾਬ ਦੇ ਹੱਕਾਂ ਨਾਲ ਜੁੜੇ ਹਰ ਮੁੱਦੇ ਲਈ ਡੱਟ ਕੇ ਲੜਦੀ ਹੈ।
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {works.map((w, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl bg-secondary/20 border border-border hover:border-primary/30 hover:bg-secondary/30 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <w.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm leading-tight mb-2">{w.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-primary/5 rounded-2xl border border-primary/20">
            <h3 className="text-center font-bold text-foreground mb-3">ਸੰਖੇਪ ਵਿੱਚ</h3>
            <p className="text-sm text-foreground leading-relaxed text-center max-w-3xl mx-auto">
              ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ (ਕੋਟ ਬੁੱਢਾ) ਨੇ MSP ਅਤੇ ਕਿਸਾਨੀ ਮੰਗਾਂ ਲਈ ਮੋਰਚੇ ਲਾਏ, ਸ਼ੰਭੂ-ਖਨੌਰੀ ਅੰਦੋਲਨਾਂ ਵਿੱਚ ਭਾਗ ਲਿਆ, ਜ਼ਮੀਨ ਬਚਾਉਣ ਲਈ ਸੰਘਰਸ਼ ਕੀਤਾ, ਮੰਡੀਆਂ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ ਉਠਾਈਆਂ, ਬਿਜਲੀ ਨਿੱਜੀਕਰਨ ਦਾ ਵਿਰੋਧ ਕੀਤਾ, ਮੁਆਵਜ਼ਿਆਂ ਲਈ ਲੜਾਈ ਲੜੀ, ਰੇਲ ਰੋਕੋ, ਧਰਨੇ, ਭੁੱਖ ਹੜਤਾਲਾਂ ਅਤੇ ਰੋਸ ਮਾਰਚ ਕੀਤੇ — ਅਤੇ ਪਿੰਡ ਪੱਧਰ 'ਤੇ ਕਿਸਾਨਾਂ ਨੂੰ ਸੰਗਠਿਤ ਕਰਕੇ ਇੱਕ ਮਜ਼ਬੂਤ ਲਹਿਰ ਖੜ੍ਹੀ ਕੀਤੀ।
            </p>
          </div>
        </motion.div>

        {/* Contact */}
        <div className="mt-10 text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">ਸੰਪਰਕ ਜਾਣਕਾਰੀ</h3>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            ਕਿਸੇ ਵੀ ਪੁੱਛਗਿੱਛ, ਸ਼ਿਕਾਇਤ ਜਾਂ ਸਹਾਇਤਾ ਲਈ ਸਾਡੇ ਮੁੱਖ ਦਫਤਰ ਨਾਲ ਸੰਪਰਕ ਕਰੋ। ਅਸੀਂ ਹਰ ਕਿਸਾਨ ਦੀ ਸਮੱਸਿਆ ਸੁਣਨ ਲਈ ਤਿਆਰ ਹਾਂ।
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
