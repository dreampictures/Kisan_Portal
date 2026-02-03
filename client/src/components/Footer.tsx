import { Tractor } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Tractor className="h-6 w-6 text-primary" />
              <span className="font-display font-bold text-lg">Kisan Union Punjab</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dedicated to the welfare and rights of farmers in Punjab. Join us in our struggle for justice and prosperity.
            </p>
          </div>
          
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Phone: +91 81465 54106</li>
              <li>Email: Sukdev3689@gmail.com</li>
              <li>District: Tarn Taran, Punjab</li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="/about" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-primary transition-colors">Get ID Card</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Kisan Mazdoor Sangharsh Committee Punjab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
