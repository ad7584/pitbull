import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Loader2, LayoutDashboard, LogOut, Menu, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/brand/Wordmark";
import { usePit } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { shortKey, fmtSol, fmtCompact } from "@/lib/format";
import { isConfigured } from "@/lib/env";
import { authBridge } from "@/lib/authBridge";
import { useWalletBalances } from "@/lib/useWalletBalances";
import { cn } from "@/lib/cn";

const LINKS = [
  { to: "/about", label: "How it works" },
  { to: "/about#ansem", label: "$ANSEM" },
];

export function Nav() {
  const auth = usePit((s) => s.auth);
  const signOut = usePit((s) => s.signOut);
  const { openSignIn, soundOn, toggleSound } = useUI();
  const { balances, loading: balLoading } = useWalletBalances(auth.pubkey || undefined);

  const connect = () => (isConfigured ? authBridge.login() : openSignIn());
  const disconnect = () => (isConfigured ? authBridge.logout() : signOut());
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
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "border-b border-white/[0.08] bg-ink-950/80 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="transition-opacity hover:opacity-80">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = loc.pathname + loc.hash === l.to || (l.to === "/about" && loc.pathname === "/about" && !loc.hash);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active ? "text-paper" : "text-mute hover:text-paper",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleSound}
            aria-label={soundOn ? "Mute" : "Unmute"}
            className="hidden h-9 w-9 place-items-center rounded-md text-faint transition hover:bg-white/[0.05] hover:text-mute sm:grid"
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {auth.status === "guest" ? (
            <Button size="sm" variant="primary" onClick={connect}>
              Connect
            </Button>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenu((m) => !m)}
                className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] py-1.5 pl-1.5 pr-2.5 transition hover:bg-white/[0.06]"
              >
                <Avatar seed={auth.pubkey} label={auth.displayName} size={26} />
                <span className="hidden text-sm font-medium sm:block">@{auth.handle}</span>
                <ChevronDown className={cn("h-4 w-4 text-mute transition", menu && "rotate-180")} />
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-white/[0.08] bg-ink-850 p-1.5 shadow-pop"
                  >
                    <div className="px-3 py-2.5">
                      <div className="text-sm font-semibold">@{auth.handle}</div>
                      <div className="mt-0.5 font-mono text-xs text-mute">{shortKey(auth.pubkey, 6)}</div>
                    </div>
                    {isConfigured && (
                      <div className="mx-1.5 mb-1 grid grid-cols-2 gap-1.5">
                        <BalanceChip label="SOL" value={balances ? fmtSol(balances.sol * 1e9) : null} loading={balLoading && !balances} />
                        <BalanceChip label="ANSEM" value={balances ? fmtCompact(balances.ansem) : null} loading={balLoading && !balances} />
                      </div>
                    )}
                    <div className="divider my-1" />
                    <MenuItem icon={LayoutDashboard} label="Dashboard" onClick={() => nav("/dashboard")} />
                    <MenuItem icon={LogOut} label="Sign out" onClick={disconnect} danger />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((m) => !m)}
            aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-md text-mute transition hover:bg-white/[0.05] hover:text-paper md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-white/[0.08] bg-ink-950/95 backdrop-blur-xl md:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3 sm:px-8">
              {LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-paper transition hover:bg-white/[0.05]"
                >
                  {l.label}
                </Link>
              ))}
              <button
                onClick={() => (auth.status === "guest" ? connect() : nav("/dashboard"))}
                className="mt-1 rounded-md bg-piggy px-3 py-2.5 text-left text-sm font-semibold text-white transition hover:bg-piggy-400"
              >
                {auth.status === "guest" ? "Connect" : "Dashboard"}
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function BalanceChip({ label, value, loading }: { label: string; value: string | null; loading: boolean }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5">
      <div className="text-[10px] font-medium uppercase tracking-wide text-faint">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-semibold tnum text-paper">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-mute" /> : (value ?? "—")}
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof LogOut;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition",
        danger ? "text-danger hover:bg-danger/10" : "text-paper hover:bg-white/[0.05]",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
