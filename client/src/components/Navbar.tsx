import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import logoSrc from "@assets/image_1781776016550.png";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "ਮੁੱਖ ਪੰਨਾ" },
    { href: "/about", label: "ਯੂਨੀਅਨ ਬਾਰੇ" },
    { href: "/updates", label: "ਤਾਜ਼ੀਆਂ ਖ਼ਬਰਾਂ" },
    { href: "/contact", label: "ਸੰਪਰਕ ਕਰੋ" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <img src={logoSrc} alt="Logo"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all" />
          <span className="font-display font-bold text-sm md:text-base text-foreground leading-tight">
            ਕਿਸਾਨ ਮਜ਼ਦੂਰ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ ( ਕੋਟ ਬੁੱਢਾ)
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                  location === link.href
                    ? "text-primary font-bold"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}
          <Link href="/contact">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              ਆਈਡੀ ਕਾਰਡ ਪ੍ਰਾਪਤ ਕਰੋ
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div
                    onClick={() => setIsOpen(false)}
                    className={`block py-2 text-base font-medium ${
                      location === link.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {link.label}
                  </div>
                </Link>
              ))}
              <Link href="/contact">
                <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => setIsOpen(false)}>
                  ਆਈਡੀ ਕਾਰਡ ਪ੍ਰਾਪਤ ਕਰੋ
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
