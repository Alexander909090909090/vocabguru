
import { 
  Home, 
  BookOpen, 
  Compass, 
  Brain, 
  MessageSquare, 
  Trophy, 
  User, 
  Settings,
  Target,
  TrendingUp
} from 'lucide-react';

export interface NavigationItem {
  href: string;
  label: string;
  icon: any;
  description?: string;
  primary?: boolean;
}

export const primaryNavigationItems: NavigationItem[] = [
  { 
    href: "/", 
    label: "Dashboard", 
    icon: Home,
    description: "View your learning progress and stats"
  },
  { 
    href: "/discovery", 
    label: "Discovery", 
    icon: Compass,
    description: "Find new words with AI recommendations"
  },
  { 
    href: "/study-center", 
    label: "Study Center", 
    icon: Brain,
    description: "Structured learning sessions and practice"
  },
  { 
    href: "/calvern", 
    label: "Calvern AI", 
    icon: MessageSquare,
    description: "Get personalized learning assistance"
  },
  { 
    href: "/quiz", 
    label: "Quiz", 
    icon: Trophy,
    description: "Test your vocabulary knowledge"
  },
  { 
    href: "/linguistic-analysis", 
    label: "Analysis", 
    icon: Target,
    description: "Deep word analysis and morphology"
  },
  { 
    href: "/profile", 
    label: "Profile", 
    icon: User,
    description: "View achievements and analytics"
  },
  { 
    href: "/settings", 
    label: "Settings", 
    icon: Settings,
    description: "Customize your learning experience"
  }
];

export const getNavigationItemByPath = (path: string): NavigationItem | undefined => {
  return primaryNavigationItems.find(item => item.href === path);
};

export const getContextualNavigation = (currentPath: string) => {
  const currentItem = getNavigationItemByPath(currentPath);
  
  switch (currentPath) {
    case '/':
      return {
        nextSteps: [
          {
            ...primaryNavigationItems.find(item => item.href === '/discovery')!,
            primary: true
          },
          primaryNavigationItems.find(item => item.href === '/calvern')!,
          primaryNavigationItems.find(item => item.href === '/quiz')!
        ],
        quickActions: [
          primaryNavigationItems.find(item => item.href === '/study-center')!,
          primaryNavigationItems.find(item => item.href === '/linguistic-analysis')!
        ]
      };
    
    case '/discovery':
      return {
        nextSteps: [
          {
            ...primaryNavigationItems.find(item => item.href === '/study-center')!,
            primary: true
          },
          primaryNavigationItems.find(item => item.href === '/quiz')!,
          primaryNavigationItems.find(item => item.href === '/linguistic-analysis')!
        ],
        quickActions: [
          primaryNavigationItems.find(item => item.href === '/')!,
          primaryNavigationItems.find(item => item.href === '/calvern')!
        ]
      };
    
    case '/study-center':
      return {
        nextSteps: [
          {
            ...primaryNavigationItems.find(item => item.href === '/discovery')!,
            primary: true
          },
          primaryNavigationItems.find(item => item.href === '/profile')!
        ],
        quickActions: [
          primaryNavigationItems.find(item => item.href === '/quiz')!,
          primaryNavigationItems.find(item => item.href === '/calvern')!
        ]
      };
    
    case '/profile':
      return {
        nextSteps: [
          {
            ...primaryNavigationItems.find(item => item.href === '/study-center')!,
            primary: true
          },
          {
            ...primaryNavigationItems.find(item => item.href === '/profile')!,
            label: 'View Achievements',
            description: 'See all earned badges'
          }
        ],
        quickActions: [
          primaryNavigationItems.find(item => item.href === '/discovery')!
        ]
      };
    
    default:
      return {
        nextSteps: [
          {
            ...primaryNavigationItems.find(item => item.href === '/')!,
            primary: true
          },
          primaryNavigationItems.find(item => item.href === '/discovery')!
        ],
        quickActions: [
          primaryNavigationItems.find(item => item.href === '/calvern')!,
          primaryNavigationItems.find(item => item.href === '/quiz')!
        ]
      };
  }
};
