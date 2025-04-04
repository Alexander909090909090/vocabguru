
import { useState } from "react";
import { useQuiz, QuizDifficulty, QuizType } from "@/context/QuizContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Award, Trophy, Star, Medal, Check, Clock, 
  BookOpen, Puzzle, Shuffle, Languages, FileText, 
  GitBranch, Brain, Dices, Zap, Lightbulb
} from "lucide-react";
import { motion } from "framer-motion";

const quizTypeIcons: Record<QuizType, React.ReactNode> = {
  "standard": <BookOpen className="h-5 w-5" />,
  "wordBuilder": <Puzzle className="h-5 w-5" />,
  "synonymAntonym": <Shuffle className="h-5 w-5" />,
  "etymology": <Languages className="h-5 w-5" />,
  "contextual": <FileText className="h-5 w-5" />,
  "transformation": <GitBranch className="h-5 w-5" />
};

const iconMap: Record<string, React.ReactNode> = {
  "award": <Award className="h-4 w-4" />,
  "trophy": <Trophy className="h-4 w-4" />,
  "star": <Star className="h-4 w-4" />,
  "medal": <Medal className="h-4 w-4" />,
  "check": <Check className="h-4 w-4" />,
  "zap": <Zap className="h-4 w-4" />,
  "clock": <Clock className="h-4 w-4" />
};

type QuizCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  type: QuizType;
  difficulty: QuizDifficulty;
  onClick: (type: QuizType, difficulty: QuizDifficulty) => void;
};

const QuizCard = ({ title, description, icon, gradient, type, difficulty, onClick }: QuizCardProps) => {
  return (
    <motion.div
      className={`p-5 rounded-lg border border-white/10 bg-gradient-to-br ${gradient} hover:shadow-lg cursor-pointer relative overflow-hidden group`}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(type, difficulty)}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-white/10 backdrop-blur-md">
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-white text-lg">{title}</h3>
          <p className="text-sm text-gray-300">{description}</p>
          <div className="flex items-center gap-2 mt-3">
            <Badge 
              variant="outline" 
              className={`${
                difficulty === 'easy'
                  ? 'bg-green-500/20 text-green-300 border-green-500/30'
                  : difficulty === 'medium'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-red-500/20 text-red-300 border-red-500/30'
              }`}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const QuizGrid = () => {
  const { userStats, startQuiz, toggleTimedMode } = useQuiz();
  const [isTimedMode, setIsTimedMode] = useState(false);
  
  // Define quiz types with their details
  const quizTypes = [
    {
      id: "wordBuilder" as QuizType,
      title: "Word Builder",
      description: "Build words by selecting the correct morpheme components.",
      icon: <Puzzle className="h-6 w-6 text-white" />,
      gradient: "from-purple-500 to-pink-600",
      difficulties: ["easy", "medium", "hard"] as QuizDifficulty[]
    },
    {
      id: "synonymAntonym" as QuizType,
      title: "Synonym & Antonym",
      description: "Match words with their synonyms and antonyms.",
      icon: <Shuffle className="h-6 w-6 text-white" />,
      gradient: "from-blue-500 to-teal-400",
      difficulties: ["easy", "medium", "hard"] as QuizDifficulty[]
    },
    {
      id: "etymology" as QuizType,
      title: "Etymology Explorer",
      description: "Test your knowledge of word origins and history.",
      icon: <Languages className="h-6 w-6 text-white" />,
      gradient: "from-amber-500 to-orange-600",
      difficulties: ["easy", "medium", "hard"] as QuizDifficulty[]
    },
    {
      id: "contextual" as QuizType,
      title: "Contextual Usage",
      description: "Complete sentences with the appropriate vocabulary.",
      icon: <FileText className="h-6 w-6 text-white" />,
      gradient: "from-green-500 to-teal-500",
      difficulties: ["easy", "medium", "hard"] as QuizDifficulty[]
    },
    {
      id: "transformation" as QuizType,
      title: "Word Transformation",
      description: "Transform words from one form to another.",
      icon: <GitBranch className="h-6 w-6 text-white" />,
      gradient: "from-cyan-500 to-blue-600",
      difficulties: ["easy", "medium", "hard"] as QuizDifficulty[]
    },
    {
      id: "standard" as QuizType,
      title: "Standard Quiz",
      description: "Test your vocabulary knowledge with a variety of question types.",
      icon: <BookOpen className="h-6 w-6 text-white" />,
      gradient: "from-indigo-500 to-purple-600",
      difficulties: ["easy", "medium", "hard"] as QuizDifficulty[]
    },
    {
      id: "brainTeaser" as QuizType,
      title: "Brain Teaser",
      description: "Challenge your mind with vocabulary-based puzzles and riddles.",
      icon: <Brain className="h-6 w-6 text-white" />,
      gradient: "from-pink-500 to-rose-600",
      difficulties: ["medium", "hard"] as QuizDifficulty[]
    },
    {
      id: "randomChallenge" as QuizType,
      title: "Random Challenge",
      description: "Test your knowledge with a random mix of question types.",
      icon: <Dices className="h-6 w-6 text-white" />,
      gradient: "from-violet-500 to-fuchsia-600",
      difficulties: ["easy", "medium", "hard"] as QuizDifficulty[]
    },
    {
      id: "speedDrill" as QuizType,
      title: "Speed Drill",
      description: "Answer as many questions as possible within a time limit.",
      icon: <Clock className="h-6 w-6 text-white" />,
      gradient: "from-red-500 to-pink-600",
      difficulties: ["easy", "medium", "hard"] as QuizDifficulty[]
    },
    {
      id: "mnemonicMaster" as QuizType,
      title: "Mnemonic Master",
      description: "Create and use memory aids to remember vocabulary.",
      icon: <Lightbulb className="h-6 w-6 text-white" />,
      gradient: "from-yellow-500 to-amber-600",
      difficulties: ["medium", "hard"] as QuizDifficulty[]
    }
  ];
  
  const handleToggleTimedMode = () => {
    setIsTimedMode(!isTimedMode);
    toggleTimedMode();
  };
  
  const handleStartQuiz = (type: QuizType, difficulty: QuizDifficulty) => {
    startQuiz(difficulty, type, undefined, isTimedMode);
  };
  
  const renderAchievements = () => {
    return (
      <div className="space-y-2 mt-6">
        <h3 className="text-lg font-semibold text-white">Your Achievements</h3>
        <div className="flex flex-wrap gap-2">
          {userStats.achievements.map((achievement) => (
            <Badge
              key={achievement.id}
              variant={achievement.unlocked ? "achievement" : "outline"}
              className={`flex items-center gap-1 py-1 px-3 ${achievement.unlocked ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-800/50 text-gray-300 backdrop-blur-md'}`}
            >
              {iconMap[achievement.icon] || <Award className="h-4 w-4" />}
              <span>{achievement.title}</span>
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <motion.h1 
          className="text-3xl font-bold text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Quizzes & Puzzles
        </motion.h1>
        <motion.p 
          className="text-gray-300 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Test your vocabulary knowledge with various quiz types and earn points and achievements!
        </motion.p>
      </div>
      
      {/* User Stats */}
      <motion.div 
        className="p-6 bg-gray-900/70 backdrop-blur-md rounded-lg shadow-md border border-white/10 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Your Stats</h3>
            <p className="text-sm text-muted-foreground">Level {userStats.level} Scholar</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-white">{userStats.pointsEarned} Points</p>
            <p className="text-sm text-muted-foreground">{userStats.streakDays} Day Streak</p>
          </div>
        </div>
        
        <Progress value={userStats.pointsEarned % 100} className="h-2 bg-gray-800" />
        
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="text-center p-2 bg-indigo-500/20 rounded">
            <p className="text-2xl font-bold text-white">{userStats.totalQuizzesTaken}</p>
            <p className="text-xs text-muted-foreground">Quizzes</p>
          </div>
          <div className="text-center p-2 bg-green-500/20 rounded">
            <p className="text-2xl font-bold text-white">{userStats.totalCorrect}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="text-center p-2 bg-red-500/20 rounded">
            <p className="text-2xl font-bold text-white">{userStats.totalIncorrect}</p>
            <p className="text-xs text-muted-foreground">Incorrect</p>
          </div>
        </div>
      </motion.div>
      
      {/* Timed Mode Toggle */}
      <motion.div 
        className="flex items-center space-x-2 pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Switch
          id="timed-mode"
          checked={isTimedMode}
          onCheckedChange={handleToggleTimedMode}
          className="data-[state=checked]:bg-pink-500"
        />
        <Label htmlFor="timed-mode" className="text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-pink-400" />
          Timed Mode
          <span className="text-xs text-gray-400">(+25% points, less time per question)</span>
        </Label>
      </motion.div>
      
      {/* Quiz Types Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {quizTypes.map((quizType) => (
          <QuizCard
            key={quizType.id}
            title={quizType.title}
            description={quizType.description}
            icon={quizType.icon}
            gradient={quizType.gradient}
            type={quizType.id}
            difficulty={"medium"}
            onClick={handleStartQuiz}
          />
        ))}
      </motion.div>
      
      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {renderAchievements()}
      </motion.div>
      
      {/* High Scores */}
      <motion.div 
        className="p-4 bg-gray-900/70 backdrop-blur-md rounded-lg border border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <h3 className="font-semibold text-white mb-3">High Scores</h3>
        <div className="space-y-2">
          {Object.entries(userStats.highScores).map(([type, scores]) => {
            if (scores.easy === 0 && scores.medium === 0 && scores.hard === 0) return null;
            
            return (
              <div key={type} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {quizTypeIcons[type as QuizType]}
                  <span className="text-gray-200">{type}</span>
                </div>
                <div className="flex gap-2">
                  {scores.easy > 0 && (
                    <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                      Easy: {Math.round(scores.easy)}%
                    </Badge>
                  )}
                  {scores.medium > 0 && (
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                      Medium: {Math.round(scores.medium)}%
                    </Badge>
                  )}
                  {scores.hard > 0 && (
                    <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
                      Hard: {Math.round(scores.hard)}%
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default QuizGrid;
