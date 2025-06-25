import { useEffect } from "react";
import { useQuiz } from "@/context/QuizContext";
import { toast } from "@/components/ui/use-toast";
import { Header } from "@/components/Header";
import QuizComponent from "@/components/Quiz/QuizComponent";
import QuizGrid from "@/components/Quiz/QuizGrid";
import { motion } from "framer-motion";

const Quiz = () => {
  const { userStats, checkAchievements, isQuizActive, showResults } = useQuiz();
  
  useEffect(() => {
    // Check for achievements on page load
    checkAchievements();
    
    // Show welcome toast if not shown before
    const hasSeenWelcome = localStorage.getItem("vocabguru-quiz-welcome");
    if (!hasSeenWelcome) {
      toast({
        title: "Welcome to VocabGuru Quiz!",
        description: "Test your vocabulary knowledge with various quiz types and earn points and achievements!",
      });
      localStorage.setItem("vocabguru-quiz-welcome", "true");
    }
  }, [checkAchievements]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black bg-fixed">
      {/* Starry background overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-40">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            initial={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random()
            }}
            animate={{ 
              opacity: [Math.random(), Math.random() * 0.5, Math.random()]
            }}
            transition={{ 
              duration: Math.random() * 5 + 3, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>
      
      <Header />
      
      <main className="container-inner py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {isQuizActive || showResults ? (
            <QuizComponent />
          ) : (
            <QuizGrid />
          )}
        </div>
      </main>
      
      <footer className="border-t border-white/10 mt-12 py-6 relative z-10">
        <div className="container-inner text-center text-sm text-muted-foreground">
          <p>© 2024 VocabGuru. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Quiz;
