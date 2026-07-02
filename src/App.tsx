import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Aurora } from "@/components/brand/Aurora";
import { SignInModal } from "@/components/auth/SignInModal";
import { FillModal } from "@/components/pens/FillModal";
import { ShareModal } from "@/components/pens/ShareModal";
import { SmashModal } from "@/components/pens/SmashModal";
import { Toasts } from "@/components/ui/Toasts";
import Landing from "@/pages/Landing";
import CreatePen from "@/pages/CreatePen";
import Dashboard from "@/pages/Dashboard";
import Explore from "@/pages/Explore";
import PenView from "@/pages/PenView";
import About from "@/pages/About";
import Terms from "@/pages/Terms";
import { usePit } from "@/lib/store";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const tickMarket = usePit((s) => s.tickMarket);
  const setNow = usePit((s) => s.setNow);

  useEffect(() => {
    const market = window.setInterval(tickMarket, 2200);
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(market);
      clearInterval(clock);
    };
  }, [tickMarket, setNow]);

  return (
    <div className="grain relative flex min-h-screen flex-col">
      <Aurora />
      <Nav />
      <main className="flex-1">
        <ScrollManager />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/create" element={<CreatePen />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/pen/:handle" element={<PenView />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      <Footer />

      {/* global modals */}
      <SignInModal />
      <FillModal />
      <ShareModal />
      <SmashModal />
      <Toasts />
    </div>
  );
}
