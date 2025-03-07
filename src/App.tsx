
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { WordsProvider } from './context/WordsContext';
import { QuizProvider } from './context/QuizContext';
import Index from './pages/Index';
import WordDetail from './pages/WordDetail';
import Calvern from './pages/Calvern';
import Quiz from './pages/Quiz';
import NotFound from './pages/NotFound';
import { AnimatePresence } from 'framer-motion';

import "./App.css";

// AnimatedRoutes component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/word/:id" element={<WordDetail />} />
        <Route path="/calvern" element={<Calvern />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <WordsProvider>
      <QuizProvider>
        <Router>
          <AnimatedRoutes />
          <Toaster />
        </Router>
      </QuizProvider>
    </WordsProvider>
  );
}

export default App;
