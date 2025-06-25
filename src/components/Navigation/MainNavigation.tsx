
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Brain, BookOpen, Search, User, Settings, BarChart3 } from 'lucide-react';

const navigationItems = [
  { href: '/', label: 'Discovery', icon: Search },
  { href: '/linguistic-analysis', label: 'Linguistic Analysis', icon: Brain },
  { href: '/calvern', label: 'Calvern AI', icon: BookOpen },
  { href: '/quiz', label: 'Quiz', icon: BarChart3 },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export const MainNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
