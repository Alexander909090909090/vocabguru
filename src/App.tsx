
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { WordsProvider } from "@/context/WordsContext";
import { QuizProvider } from "@/context/QuizContext";
import Index from "./pages/Index";
import WordDetail from "./pages/WordDetail";
import Quiz from "./pages/Quiz";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import StudyCenter from "./pages/StudyCenter";
import Discovery from "./pages/Discovery";
import Integrations from "./pages/Integrations";
import Calvern from "./pages/Calvern";
import WordAnalysis from "./pages/WordAnalysis";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WordsProvider>
          <QuizProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/word/:id" element={<WordDetail />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/study" element={<StudyCenter />} />
                  <Route path="/discovery" element={<Discovery />} />
                  <Route path="/integrations" element={<Integrations />} />
                  <Route path="/calvern" element={<Calvern />} />
                  <Route path="/analysis" element={<WordAnalysis />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </QuizProvider>
        </WordsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
