// ============================================================
// AppShell — persistent bottom nav (Home · Practice · Review ·
// Progress · Settings) + first-launch splash (screen 1).
// Hidden during the active quiz — QuizPage runs outside the shell.
// ============================================================

import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Target, Layers, BarChart3, Settings as SettingsIcon } from "lucide-react";
import SplashScreen from "./SplashScreen";

const TABS = [
  { to: "/", label: "Home", Icon: Home, end: true },
  { to: "/practice", label: "Practice", Icon: Target, end: false },
  { to: "/review", label: "Review", Icon: Layers, end: false },
  { to: "/progress", label: "Progress", Icon: BarChart3, end: false },
  { to: "/settings", label: "Settings", Icon: SettingsIcon, end: false },
];

export default function AppShell() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <SplashScreen />

      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mx-auto w-full max-w-md px-4 pt-6 pb-32"
      >
        <Outlet />
      </motion.main>

      {/* Bottom navigation — design screens 2–14 */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-md items-stretch justify-between px-2 py-2">
          {TABS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <Icon className="h-5 w-5" strokeWidth={2.2} />
              <span className="text-[11px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
