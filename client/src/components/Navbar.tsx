import { Link, useLocation } from "wouter";
import { Menu, X, LogIn, Search, Shield } from "lucide-react";
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

  const actionLinks = [
    { href: "/track", label: "ਟਰੈਕ ਕਰੋ", icon: Search, color: "text-blue-600" },
    { href: "/verify", label: "ਵੈਰੀਫਾਈ", icon: Shield, color: "text-green-600" },
    { href: "/admin", label: "ਲੌਗਇਨ", icon: LogIn, color: "text-orange-600" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <img src={logoSrc} alt="Logo"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all" />
          <span className="font-display font-bold text-sm md:text-base text-foreground leading-tight">
            ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ ( ਕੋਟ ਬੁੱਢਾ)
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer rounded-md hover:bg-muted ${
                  location === link.href
                    ? "text-primary font-bold"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}

          <div className="h-5 w-px bg-border mx-2" />

          {/* Action buttons - Track, Verify, Login */}
          {actionLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1.5 text-sm font-medium ${
                  location === link.href ? "bg-muted" : ""
                } hover:bg-muted`}
              >
                <link.icon className={`h-4 w-4 ${link.color}`} />
                <span className={link.color}>{link.label}</span>
              </Button>
            </Link>
          ))}

          <Link href="/contact">
            <Button size="sm" className="ml-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              ਮੈਂਬਰ ਬਣੋ
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
            <div className="container mx-auto px-4 py-4 space-y-1">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2.5 rounded-md text-base font-medium ${
                      location === link.href
                        ? "text-primary bg-muted"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </div>
                </Link>
              ))}

              <div className="h-px bg-border my-2" />

              {/* Action links - mobile */}
              {actionLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-base font-medium ${
                      location === link.href ? "bg-muted" : "hover:bg-muted"
                    }`}
                  >
                    <link.icon className={`h-5 w-5 ${link.color}`} />
                    <span className={link.color}>{link.label}</span>
                  </div>
                </Link>
              ))}

              <div className="pt-2">
                <Link href="/contact">
                  <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => setIsOpen(false)}>
                    ਮੈਂਬਰ ਬਣੋ
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
