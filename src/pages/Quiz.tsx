
import { useEffect } from "react";
import { useQuiz } from "@/context/QuizContext";
import { toast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import QuizComponent from "@/components/Quiz/QuizComponent";

const Quiz = () => {
  const { userStats, checkAchievements } = useQuiz();
  
  useEffect(() => {
    // Check for achievements on page load
    const hasUnlockedAchievements = checkAchievements();
    
    // Show welcome toast if not shown before
    const hasSeenWelcome = localStorage.getItem("vocabguru-quiz-welcome");
    if (!hasSeenWelcome) {
      toast({
        title: "Welcome to VocabGuru Quiz!",
        description: "Test your vocabulary knowledge and earn points and achievements!",
      });
      localStorage.setItem("vocabguru-quiz-welcome", "true");
    }
  }, [checkAchievements]);
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container-inner py-8">
        <div className="max-w-3xl mx-auto">
          <QuizComponent />
        </div>
      </main>
      
      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="container-inner text-center text-sm text-muted-foreground">
          <p>© 2024 VocabGuru. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Quiz;
