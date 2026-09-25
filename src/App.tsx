import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WordsProvider } from "@/context/WordsContext";
import { QuizProvider } from "@/context/QuizContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { QuickActions } from "@/components/Navigation/QuickActions";
import Index from "./pages/Index";
import Discovery from "./pages/Discovery";
import { LegacyWordRedirect } from "./components/LegacyWordRedirect";
import WordProfile from "./pages/WordProfile";
import Quiz from "./pages/Quiz";
import Calvern from "./pages/Calvern";
import Integrations from "./pages/Integrations";
import Profile from "./pages/Profile";
import StudyCenter from "./pages/StudyCenter";
import NotFound from "./pages/NotFound";
import { SimplifiedDeepAnalysis } from "./components/DeepAnalysis/SimplifiedDeepAnalysis";
import Settings from "./pages/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WordsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/discovery" element={
                    <ProtectedRoute>
                      <Discovery />
                    </ProtectedRoute>
                  } />
                  <Route path="/word/:id" element={
                    <ProtectedRoute>
                      <LegacyWordRedirect />
                    </ProtectedRoute>
                  } />
                  <Route path="/w/:word" element={
                    <ProtectedRoute>
                      <WordProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="/quiz" element={
                    <ProtectedRoute>
                      <QuizProvider>
                        <Quiz />
                      </QuizProvider>
                    </ProtectedRoute>
                  } />
                  <Route path="/calvern" element={
                    <ProtectedRoute>
                      <Calvern />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/study" element={
                    <ProtectedRoute>
                      <StudyCenter />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <QuickActions />
              </ErrorBoundary>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </WordsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
