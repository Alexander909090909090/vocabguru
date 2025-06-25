
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Trophy, BookOpen, Brain, Compass, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NextStepsProps {
  context: 'word-detail' | 'quiz-complete' | 'study-complete' | 'discovery' | 'profile';
  data?: {
    wordId?: string;
    quizScore?: number;
    wordsStudied?: number;
    suggestedWords?: string[];
  };
}

export function NextSteps({ context, data = {} }: NextStepsProps) {
  const navigate = useNavigate();

  const getNextSteps = () => {
    switch (context) {
      case 'word-detail':
        return {
          title: "Continue Learning",
          steps: [
            {
              title: "Test Your Knowledge",
              description: "Take a quiz to reinforce this word",
              icon: Trophy,
              action: () => navigate("/quiz"),
              primary: true
            },
            {
              title: "Study Related Words",
              description: "Explore similar vocabulary",
              icon: BookOpen,
              action: () => navigate("/discovery")
            },
            {
              title: "Ask Calvern",
              description: "Get personalized explanations",
              icon: Brain,
              action: () => navigate("/calvern")
            }
          ]
        };

      case 'quiz-complete':
        const score = data.quizScore || 0;
        return {
          title: score >= 70 ? "Great Job! What's Next?" : "Keep Learning!",
          steps: [
            {
              title: score >= 70 ? "Try Harder Quiz" : "Study Missed Words",
              description: score >= 70 ? "Challenge yourself further" : "Review and strengthen weak areas",
              icon: score >= 70 ? Trophy : BookOpen,
              action: () => navigate(score >= 70 ? "/quiz" : "/study"),
              primary: true
            },
            {
              title: "Discover New Words",
              description: "Expand your vocabulary",
              icon: Compass,
              action: () => navigate("/discovery")
            },
            {
              title: "Ask Calvern for Tips",
              description: "Get personalized study advice",
              icon: Brain,
              action: () => navigate("/calvern")
            }
          ]
        };

      case 'study-complete':
        return {
          title: "Ready to Test Yourself?",
          steps: [
            {
              title: "Take a Quiz",
              description: "Test your newly learned words",
              icon: Trophy,
              action: () => navigate("/quiz"),
              primary: true
            },
            {
              title: "Study More Words",
              description: "Continue your learning journey",
              icon: BookOpen,
              action: () => navigate("/study")
            },
            {
              title: "Track Progress",
              description: "See how far you've come",
              icon: Target,
              action: () => navigate("/profile")
            }
          ]
        };

      case 'discovery':
        return {
          title: "Start Your Learning Journey",
          steps: [
            {
              title: "Begin Study Session",
              description: "Learn these words systematically",
              icon: BookOpen,
              action: () => navigate("/study"),
              primary: true
            },
            {
              title: "Quick Quiz",
              description: "Test current knowledge",
              icon: Trophy,
              action: () => navigate("/quiz")
            },
            {
              title: "Get AI Guidance",
              description: "Ask Calvern for learning strategies",
              icon: Brain,
              action: () => navigate("/calvern")
            }
          ]
        };

      case 'profile':
        return {
          title: "Recommended Actions",
          steps: [
            {
              title: "Continue Studying",
              description: "Pick up where you left off",
              icon: BookOpen,
              action: () => navigate("/study"),
              primary: true
            },
            {
              title: "Take Daily Quiz",
              description: "Maintain your learning streak",
              icon: Trophy,
              action: () => navigate("/quiz")
            },
            {
              title: "Explore New Words",
              description: "Discover vocabulary for your level",
              icon: Compass,
              action: () => navigate("/discovery")
            }
          ]
        };

      default:
        return {
          title: "What would you like to do?",
          steps: [
            {
              title: "Start Learning",
              description: "Begin with curated words",
              icon: BookOpen,
              action: () => navigate("/study"),
              primary: true
            },
            {
              title: "Take a Quiz",
              description: "Test your current knowledge",
              icon: Trophy,
              action: () => navigate("/quiz")
            },
            {
              title: "Discover Words",
              description: "Explore new vocabulary",
              icon: Compass,
              action: () => navigate("/discovery")
            }
          ]
        };
    }
  };

  const { title, steps } = getNextSteps();

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, index) => (
          <Button
            key={index}
            variant={step.primary ? "default" : "outline"}
            className={`w-full justify-start gap-3 h-auto p-4 ${
              step.primary 
                ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                : "bg-white/5 hover:bg-white/10 text-white border-white/20"
            }`}
            onClick={step.action}
          >
            <step.icon className="h-5 w-5 flex-shrink-0" />
            <div className="text-left">
              <div className="font-medium">{step.title}</div>
              <div className="text-sm opacity-80">{step.description}</div>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto flex-shrink-0" />
          </Button>
        ))}
        
        {data.suggestedWords && data.suggestedWords.length > 0 && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-sm text-white/70 mb-2">Suggested words to study:</p>
            <div className="flex flex-wrap gap-1">
              {data.suggestedWords.slice(0, 3).map((word, index) => (
                <Badge key={index} variant="outline" className="bg-primary/20 text-primary-foreground border-primary/30">
                  {word}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
