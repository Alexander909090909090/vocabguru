
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  BookOpen, 
  Brain, 
  Target,
  Compass,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface NavigationAction {
  icon: React.ReactNode;
  label: string;
  href: string;
  description: string;
  primary?: boolean;
}

interface ContextualNavigationProps {
  currentContext?: string;
  previousPage?: { label: string; href: string };
  nextSteps?: NavigationAction[];
  quickActions?: NavigationAction[];
}

export const ContextualNavigation: React.FC<ContextualNavigationProps> = ({
  currentContext,
  previousPage,
  nextSteps,
  quickActions
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getDefaultNavigation = (): { nextSteps: NavigationAction[], quickActions: NavigationAction[] } => {
    const pathname = location.pathname;
    
    if (pathname === '/') {
      return {
        nextSteps: [
          {
            icon: <Compass className="h-4 w-4" />,
            label: 'Explore Discovery',
            href: '/discovery',
            description: 'Find new words with AI recommendations',
            primary: true
          },
          {
            icon: <Brain className="h-4 w-4" />,
            label: 'Ask Calvern AI',
            href: '/calvern',
            description: 'Get personalized learning assistance'
          },
          {
            icon: <Target className="h-4 w-4" />,
            label: 'Take a Quiz',
            href: '/quiz',
            description: 'Test your vocabulary knowledge'
          }
        ],
        quickActions: [
          {
            icon: <BookOpen className="h-4 w-4" />,
            label: 'Study Center',
            href: '/study-center',
            description: 'Structured learning sessions'
          },
          {
            icon: <Brain className="h-4 w-4" />,
            label: 'Linguistic Analysis',
            href: '/linguistic-analysis',
            description: 'Deep word analysis tools'
          }
        ]
      };
    }

    if (pathname === '/discovery') {
      return {
        nextSteps: [
          {
            icon: <BookOpen className="h-4 w-4" />,
            label: 'Start Study Session',
            href: '/study-center',
            description: 'Practice with selected words',
            primary: true
          },
          {
            icon: <Target className="h-4 w-4" />,
            label: 'Quick Quiz',
            href: '/quiz',
            description: 'Test your knowledge'
          },
          {
            icon: <Brain className="h-4 w-4" />,
            label: 'Deep Analysis',
            href: '/linguistic-analysis',
            description: 'Analyze word structure'
          }
        ],
        quickActions: [
          {
            icon: <Home className="h-4 w-4" />,
            label: 'Home',
            href: '/',
            description: 'Return to dashboard'
          },
          {
            icon: <Brain className="h-4 w-4" />,
            label: 'Ask Calvern',
            href: '/calvern',
            description: 'Get AI assistance'
          }
        ]
      };
    }

    if (pathname.startsWith('/word/')) {
      return {
        nextSteps: [
          {
            icon: <BookOpen className="h-4 w-4" />,
            label: 'Add to Study List',
            href: '/study-center',
            description: 'Practice this word later',
            primary: true
          },
          {
            icon: <Compass className="h-4 w-4" />,
            label: 'Find Similar Words',
            href: '/discovery',
            description: 'Discover related vocabulary'
          },
          {
            icon: <Brain className="h-4 w-4" />,
            label: 'Deep Analysis',
            href: '/linguistic-analysis',
            description: 'Comprehensive breakdown'
          }
        ],
        quickActions: [
          {
            icon: <Target className="h-4 w-4" />,
            label: 'Quiz Mode',
            href: '/quiz',
            description: 'Test this word'
          },
          {
            icon: <Brain className="h-4 w-4" />,
            label: 'Ask Calvern',
            href: '/calvern',
            description: 'Learn more about this word'
          }
        ]
      };
    }

    // Default fallback
    return {
      nextSteps: [
        {
          icon: <Home className="h-4 w-4" />,
          label: 'Dashboard',
          href: '/',
          description: 'View your learning progress',
          primary: true
        },
        {
          icon: <Compass className="h-4 w-4" />,
          label: 'Discovery',
          href: '/discovery',
          description: 'Find new words to learn'
        }
      ],
      quickActions: [
        {
          icon: <Brain className="h-4 w-4" />,
          label: 'Calvern AI',
          href: '/calvern',
          description: 'AI learning assistant'
        },
        {
          icon: <Target className="h-4 w-4" />,
          label: 'Quiz',
          href: '/quiz',
          description: 'Test your knowledge'
        }
      ]
    };
  };

  const defaultNav = getDefaultNavigation();
  const effectiveNextSteps = nextSteps || defaultNav.nextSteps;
  const effectiveQuickActions = quickActions || defaultNav.quickActions;

  return (
    <div className="space-y-4">
      {/* Back Navigation */}
      {previousPage && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {previousPage.label && (
            <span className="text-sm text-muted-foreground">
              to {previousPage.label}
            </span>
          )}
        </motion.div>
      )}

      {/* Context Indicator */}
      {currentContext && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <Badge variant="outline" className="gap-1">
            <Compass className="h-3 w-3" />
            {currentContext}
          </Badge>
        </motion.div>
      )}

      {/* Next Steps */}
      {effectiveNextSteps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Next Steps
              </h3>
              <div className="grid gap-2">
                {effectiveNextSteps.map((action, index) => (
                  <motion.div
                    key={action.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Link to={action.href}>
                      <Button
                        variant={action.primary ? "default" : "ghost"}
                        className="w-full justify-start h-auto p-3"
                      >
                        <div className="flex items-start gap-3 w-full">
                          {action.icon}
                          <div className="flex-1 text-left">
                            <div className="font-medium">{action.label}</div>
                            <div className="text-sm opacity-75">{action.description}</div>
                          </div>
                        </div>
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      {effectiveQuickActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {effectiveQuickActions.map((action, index) => (
                  <motion.div
                    key={action.href}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                  >
                    <Link to={action.href}>
                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto p-3"
                      >
                        <div className="flex items-center gap-2 w-full">
                          {action.icon}
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm">{action.label}</div>
                            <div className="text-xs opacity-75">{action.description}</div>
                          </div>
                        </div>
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
