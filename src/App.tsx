
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WordsProvider } from "./context/WordsContext";
import { QuizProvider } from "./context/QuizContext";
import Index from "./pages/Index";
import WordDetail from "./pages/WordDetail";
import Quiz from "./pages/Quiz";
import Discovery from "./pages/Discovery";
import StudyCenter from "./pages/StudyCenter";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Integrations from "./pages/Integrations";
import Calvern from "./pages/Calvern";
import VocabularyTable from "./pages/VocabularyTable";
import NotFound from "./pages/NotFound";
import { Header } from "./components/Header";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WordsProvider>
            <QuizProvider>
              <Toaster />
              <BrowserRouter>
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/word/:id" element={<WordDetail />} />
                      <Route path="/quiz" element={<Quiz />} />
                      <Route path="/discovery" element={<Discovery />} />
                      <Route path="/study" element={<StudyCenter />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/integrations" element={<Integrations />} />
                      <Route path="/calvern" element={<Calvern />} />
                      <Route path="/vocabulary-table" element={<VocabularyTable />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </BrowserRouter>
            </QuizProvider>
          </WordsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
