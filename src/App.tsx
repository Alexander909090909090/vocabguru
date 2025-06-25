
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { WordsProvider } from "@/context/WordsContext";
import { QuizProvider } from "@/context/QuizContext";
import Header from "@/components/Header";
import Index from "@/pages/Index";
import WordDetail from "@/pages/WordDetail";
import Quiz from "@/pages/Quiz";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Calvern from "@/pages/Calvern";
import StudyCenter from "@/pages/StudyCenter";
import Integrations from "@/pages/Integrations";
import Discovery from "@/pages/Discovery";
import LinguisticAnalysis from "@/pages/LinguisticAnalysis";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WordsProvider>
          <QuizProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <Header />
                <main className="pt-16">
                  <Routes>
                    <Route path="/" element={<Discovery />} />
                    <Route path="/index" element={<Index />} />
                    <Route path="/word/:word" element={<WordDetail />} />
                    <Route path="/quiz" element={<Quiz />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/calvern" element={<Calvern />} />
                    <Route path="/study-center" element={<StudyCenter />} />
                    <Route path="/integrations" element={<Integrations />} />
                    <Route path="/linguistic-analysis" element={<LinguisticAnalysis />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Toaster />
              </div>
            </Router>
          </QuizProvider>
        </WordsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
