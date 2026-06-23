import { Switch, Route, useLocation } from "wouter";
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
  const isVerifyPage = location.startsWith("/verify");

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPage && !isVerifyPage && <Navbar />}
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
      {!isAdminPage && !isVerifyPage && <Footer />}
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
