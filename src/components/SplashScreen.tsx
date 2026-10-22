// ============================================================
// SplashScreen — design screen 1 (ExamPrep branding)
// Shows once per browser session, auto-dismisses, tap to skip.
// ============================================================

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/SettingsContext";

const SPLASH_KEY = "mivav1.splashShown";
const AUTO_DISMISS_MS = 2400;

export default function SplashScreen() {
  const { settings } = useSettings();
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem(SPLASH_KEY);
    } catch {
      return true;
    }
  });

  const dismiss = () => {
    try {
      sessionStorage.setItem(SPLASH_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => dismiss(), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.35 }}
          onClick={dismiss}
          className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center gap-6 bg-gradient-to-br from-emerald-50 via-background to-teal-50 px-8 text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 16 }}
            className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-lg"
          >
            <GraduationCap className="h-10 w-10 text-white" />
          </motion.div>

          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="space-y-2"
          >
            <h1 className="text-4xl font-bold tracking-tight">ExamPrep</h1>
            <p className="text-base text-muted-foreground">Study Smarter. Score Higher.</p>
          </motion.div>

          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <p className="text-sm font-medium text-emerald-700">{settings.userName}</p>
            <Button size="lg" className="rounded-full px-8" onClick={dismiss}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
