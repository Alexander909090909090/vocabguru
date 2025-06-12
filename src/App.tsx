
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WordsProvider } from "@/context/WordsContext";
import { QuizProvider } from "@/context/QuizContext";
import Index from "./pages/Index";
import Discovery from "./pages/Discovery";
import WordDetail from "./pages/WordDetail";
import Quiz from "./pages/Quiz";
import Calvern from "./pages/Calvern";
import Integrations from "./pages/Integrations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WordsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/discovery" element={<Discovery />} />
            <Route path="/word/:id" element={<WordDetail />} />
            <Route path="/quiz" element={
              <QuizProvider>
                <Quiz />
              </QuizProvider>
            } />
            <Route path="/calvern" element={<Calvern />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WordsProvider>
  </QueryClientProvider>
);

export default App;
