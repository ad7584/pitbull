import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Menu, PiggyBank, Trophy, Volume2, VolumeX, Wallet, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/brand/Wordmark";
import { usePit } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { shortKey } from "@/lib/format";
import { cn } from "@/lib/cn";

const LINKS = [
  { to: "/explore", label: "Explore", icon: Trophy },
  { to: "/about", label: "How it works", icon: PiggyBank },
];

export function Nav() {
  const auth = usePit((s) => s.auth);
  const signOut = usePit((s) => s.signOut);
  const myPen = usePit((s) => s.myPen());
  const { openSignIn, soundOn, toggleSound } = useUI();
  const nav = useNavigate();
  const loc = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setMenu(false);
    setMobileOpen(false);
  }, [loc.pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-white/10 bg-ink-950/70 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="transition hover:opacity-90">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = loc.pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "rounded-xl px-3.5 py-2 text-sm font-medium transition",
                  active ? "text-paper" : "text-mute hover:text-paper hover:bg-white/5",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen((m) => !m)}
            aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-xl text-mute transition hover:bg-white/5 hover:text-paper md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <button
            onClick={toggleSound}
            aria-label={soundOn ? "Mute" : "Unmute"}
            className="grid h-9 w-9 place-items-center rounded-xl text-mute transition hover:bg-white/5 hover:text-paper"
          >
            {soundOn ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
          </button>

          {auth.status === "guest" ? (
            <Button size="sm" variant="primary" onClick={openSignIn}>
              <Wallet className="h-4 w-4" />
              Connect
            </Button>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenu((m) => !m)}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-2.5 transition hover:bg-white/10"
              >
                <Avatar seed={auth.pubkey} label={auth.displayName} size={28} />
                <span className="hidden text-sm font-medium sm:block">
                  @{auth.handle}
                </span>
                <ChevronDown className={cn("h-4 w-4 text-mute transition", menu && "rotate-180")} />
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.16 }}
                    className="card absolute right-0 mt-2 w-60 overflow-hidden p-1.5"
                  >
                    <div className="px-3 py-2.5">
                      <div className="text-sm font-semibold">@{auth.handle}</div>
                      <div className="mt-0.5 font-mono text-xs text-mute">{shortKey(auth.pubkey, 6)}</div>
                    </div>
                    <div className="divider my-1" />
                    <MenuItem
                      icon={PiggyBank}
                      label={myPen ? "My piggy bank" : "Open a piggy bank"}
                      onClick={() => nav(myPen ? "/dashboard" : "/create")}
                    />
                    <MenuItem icon={LogOut} label="Sign out" onClick={signOut} danger />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-white/10 bg-ink-950/90 backdrop-blur-xl md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              {LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium text-paper transition hover:bg-white/5"
                >
                  <l.icon className="h-4 w-4 text-mute" />
                  {l.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  if (auth.status === "guest") openSignIn();
                  else nav(myPen ? "/dashboard" : "/create");
                }}
                className="mt-1 flex items-center gap-2.5 rounded-xl bg-piggy/15 px-3 py-3 text-sm font-semibold text-piggy-300 transition hover:bg-piggy/25"
              >
                <PiggyBank className="h-4 w-4" />
                {auth.status === "guest" ? "Connect" : myPen ? "My piggy bank" : "Open a piggy bank"}
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof PiggyBank;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",
        danger ? "text-danger hover:bg-danger/10" : "text-paper hover:bg-white/5",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
