
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, MessageSquare, BookOpen, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function FloatingActionButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      icon: MessageSquare,
      label: "Ask Calvern",
      action: () => navigate("/calvern"),
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      icon: Search,
      label: "Quick Search",
      action: () => {
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      icon: BookOpen,
      label: "Study Center",
      action: () => navigate("/study"),
      color: "bg-green-500 hover:bg-green-600"
    }
  ];

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-16 right-0 flex flex-col gap-3"
            >
              {actions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: index * 0.1 }
                  }}
                  exit={{ 
                    opacity: 0, 
                    x: 20,
                    transition: { delay: (actions.length - index) * 0.05 }
                  }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        className={`h-12 w-12 rounded-full shadow-lg ${action.color}`}
                        onClick={() => {
                          action.action();
                          setIsExpanded(false);
                        }}
                      >
                        <action.icon className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>{action.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isExpanded ? (
                <X className="h-6 w-6" />
              ) : (
                <Plus className="h-6 w-6" />
              )}
            </motion.div>
          </Button>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}

export default FloatingActionButton;
