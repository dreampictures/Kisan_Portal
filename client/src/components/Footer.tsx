import { Link } from "wouter";
import logoSrc from "@assets/image_1781776016550.png";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src={logoSrc} alt="Logo" className="h-10 w-10 rounded-full object-cover" />
              <span className="font-display font-bold text-base">ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ ( ਕੋਟ ਬੁੱਢਾ)</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ਕਿਸਾਨਾਂ ਦੇ ਹੱਕਾਂ ਅਤੇ ਭਲਾਈ ਲਈ ਸਮਰਪਿਤ। ਸਾਡੀ ਲਹਿਰ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ।
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-base mb-4">ਸੰਪਰਕ</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>ਫ਼ੋਨ: +91 81465 54106</li>
              <li>Email: Sukdev3689@gmail.com</li>
              <li>ਜ਼ਿਲ੍ਹਾ: ਤਰਨ ਤਾਰਨ, ਪੰਜਾਬ</li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-base mb-4">ਲਿੰਕ</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/"><span className="hover:text-primary cursor-pointer transition-colors">ਮੁੱਖ ਪੰਨਾ</span></Link></li>
              <li><Link href="/about"><span className="hover:text-primary cursor-pointer transition-colors">ਯੂਨੀਅਨ ਬਾਰੇ</span></Link></li>
              <li><Link href="/updates"><span className="hover:text-primary cursor-pointer transition-colors">ਤਾਜ਼ੀਆਂ ਖ਼ਬਰਾਂ</span></Link></li>
              <li><Link href="/contact"><span className="hover:text-primary cursor-pointer transition-colors">ਆਈਡੀ ਕਾਰਡ ਲਓ</span></Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ਕਿਸਾਨ ਸੰਘਰਸ਼ ਕਮੇਟੀ ਪੰਜਾਬ ( ਕੋਟ ਬੁੱਢਾ)। ਸਾਰੇ ਅਧਿਕਾਰ ਸੁਰੱਖਿਅਤ।</p>
          <p>
            Managed by{" "}
            <a href="https://thedreampictures.com" target="_blank" rel="noopener noreferrer"
              className="text-primary hover:underline font-medium">
              Dream Pictures
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
