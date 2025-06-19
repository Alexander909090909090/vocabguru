
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import WordDetail from "./pages/WordDetail";
import Quiz from "./pages/Quiz";
import Discovery from "./pages/Discovery";
import Calvern from "./pages/Calvern";
import Integrations from "./pages/Integrations";
import WordRepository from "./pages/WordRepository";
import NotFound from "./pages/NotFound";
import { WordsProvider } from "./context/WordsContext";
import { AuthProvider } from "./context/AuthContext";
import { QuizProvider } from "./context/QuizContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <AuthProvider>
          <WordsProvider>
            <QuizProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/word/:id" element={<WordDetail />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/discovery" element={<Discovery />} />
                  <Route path="/calvern" element={<Calvern />} />
                  <Route path="/integrations" element={<Integrations />} />
                  <Route path="/repository" element={<WordRepository />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </QuizProvider>
          </WordsProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
