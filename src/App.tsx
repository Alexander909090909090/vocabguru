
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import WordDetail from "./pages/WordDetail";
import NotFound from "./pages/NotFound";
import Calvern from "./pages/Calvern";
import { WordsProvider } from "./context/WordsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WordsProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/word/:id" element={<WordDetail />} />
            <Route path="/calvern" element={<Calvern />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WordsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
