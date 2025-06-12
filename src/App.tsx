
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WordsProvider } from "@/context/WordsContext";
import Header from "@/components/Header";
import Index from "./pages/Index";
import WordDetail from "./pages/WordDetail";
import Quiz from "./pages/Quiz";
import Integrations from "./pages/Integrations";
import Discovery from "./pages/Discovery";
import Calvern from "./pages/Calvern";
import WordProfileAdmin from "./components/Admin/WordProfileAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WordsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
              <Header />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/word/:id" element={<WordDetail />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/discovery" element={<Discovery />} />
                <Route path="/calvern" element={<Calvern />} />
                <Route path="/admin/word-profiles" element={<WordProfileAdmin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </WordsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
