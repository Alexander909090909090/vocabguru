
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Brain, Trophy, BookOpen, Compass, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface QuickActionsProps {
  currentPage?: string;
  userProgress?: {
    wordsStudied: number;
    quizzesCompleted: number;
    currentStreak: number;
  };
}

export function QuickActions({ currentPage, userProgress }: QuickActionsProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const getContextualActions = () => {
    switch (currentPage) {
      case 'word-detail':
        return [
          { label: "Take Quiz", icon: Trophy, action: () => navigate("/quiz"), color: "bg-purple-500" },
          { label: "Study More", icon: BookOpen, action: () => navigate("/study"), color: "bg-blue-500" },
          { label: "Ask Calvern", icon: Brain, action: () => navigate("/calvern"), color: "bg-green-500" }
        ];
      case 'quiz':
        return [
          { label: "Study Words", icon: BookOpen, action: () => navigate("/study"), color: "bg-blue-500" },
          { label: "Discover More", icon: Compass, action: () => navigate("/discovery"), color: "bg-orange-500" }
        ];
      case 'discovery':
        return [
          { label: "Start Study", icon: Play, action: () => navigate("/study"), color: "bg-green-500" },
          { label: "Quick Quiz", icon: Trophy, action: () => navigate("/quiz"), color: "bg-purple-500" }
        ];
      default:
        return [
          { label: "Search Words", icon: Search, action: () => navigate("/?search=true"), color: "bg-blue-500" },
          { label: "Take Quiz", icon: Trophy, action: () => navigate("/quiz"), color: "bg-purple-500" },
          { label: "Ask Calvern", icon: Brain, action: () => navigate("/calvern"), color: "bg-green-500" }
        ];
    }
  };

  const actions = getContextualActions();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 space-y-2"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  onClick={action.action}
                  className={`${action.color} hover:opacity-90 text-white shadow-lg flex items-center gap-2`}
                  size="sm"
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              </motion.div>
            ))}
            
            {userProgress && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: actions.length * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-3">
                    <div className="flex gap-2 text-xs text-white">
                      <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                        {userProgress.wordsStudied} words
                      </Badge>
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {userProgress.quizzesCompleted} quizzes
                      </Badge>
                      <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                        {userProgress.currentStreak} day streak
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-14 w-14 shadow-lg"
        size="icon"
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded ? <Brain className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </motion.div>
      </Button>
    </div>
  );
}
