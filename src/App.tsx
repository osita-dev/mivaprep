// ============================================================
// mivaQuiz — app root: providers + routes
// Shell routes (with bottom nav): Home · Practice · Review ·
// Missed · Progress · Settings
// Fullscreen routes (no nav): /quiz · /results/:attemptId
// ============================================================

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import AppShell from "@/components/AppShell";
import HomePage from "@/pages/HomePage";
import QuizPage from "@/pages/QuizPage";
import ResultsPage from "@/pages/ResultsPage";
import PracticePage from "@/pages/PracticePage";
import ReviewPage from "@/pages/ReviewPage";
import MissedPage from "@/pages/MissedPage";
import ProgressPage from "@/pages/ProgressPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "./pages/NotFound";

import { BankProvider } from "@/context/BankContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { SettingsProvider } from "@/context/SettingsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SettingsProvider>
        <BankProvider>
          <ProgressProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<AppShell />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/practice" element={<PracticePage />} />
                  <Route path="/review" element={<ReviewPage />} />
                  <Route path="/missed" element={<MissedPage />} />
                  <Route path="/progress" element={<ProgressPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
                {/* Fullscreen — outside the shell (no bottom nav) */}
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/results/:attemptId" element={<ResultsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ProgressProvider>
        </BankProvider>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
