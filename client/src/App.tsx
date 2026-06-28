import { Switch, Route, useLocation } from "wouter";
import { useEffect, useRef } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Admin from "@/pages/Admin";
import Verify from "@/pages/Verify";
import VerifySearch from "@/pages/VerifySearch";
import Updates from "@/pages/Updates";
import Track from "@/pages/Track";

function Router() {
  const [location] = useLocation();
  const isAdminPage = location.startsWith("/admin");
  const lastTracked = useRef<string>("");

  useEffect(() => {
    if (location === lastTracked.current) return;
    lastTracked.current = location;
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: location }),
    }).catch(() => {});
  }, [location]);

  const isPublicPage = !isAdminPage;

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Global blurred field background — public pages only */}
      {isPublicPage && (
        <>
          <div
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: -10,
              backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(7px) brightness(0.45)",
              transform: "scale(1.06)",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: -9,
              background: "linear-gradient(to bottom, rgba(0,60,20,0.35) 0%, rgba(255,255,255,0.72) 60%, rgba(255,255,255,0.90) 100%)",
            }}
          />
        </>
      )}

      {!isAdminPage && <Navbar />}
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/updates" component={Updates} />
          <Route path="/contact" component={Contact} />
          <Route path="/track" component={Track} />
          <Route path="/admin" component={Admin} />
          <Route path="/verify" component={VerifySearch} />
          <Route path="/verify/:cardNumber" component={Verify} />
          <Route component={NotFound} />
        </Switch>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
