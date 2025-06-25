
import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function Breadcrumbs() {
  const location = useLocation();
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname;
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Home", path: "/", icon: Home }
    ];

    if (path === "/") return breadcrumbs;

    const segments = path.split("/").filter(Boolean);
    
    segments.forEach((segment, index) => {
      const currentPath = "/" + segments.slice(0, index + 1).join("/");
      
      switch (segment) {
        case "discovery":
          breadcrumbs.push({ label: "Discovery", path: "/discovery" });
          break;
        case "study":
          breadcrumbs.push({ label: "Study Center", path: "/study" });
          break;
        case "quiz":
          breadcrumbs.push({ label: "Quiz", path: "/quiz" });
          break;
        case "calvern":
          breadcrumbs.push({ label: "Calvern AI", path: "/calvern" });
          break;
        case "profile":
          breadcrumbs.push({ label: "Profile", path: "/profile" });
          break;
        case "integrations":
          breadcrumbs.push({ label: "Settings", path: "/integrations" });
          break;
        case "word":
          breadcrumbs.push({ label: "Word Details", path: currentPath });
          break;
        default:
          // For dynamic segments like word IDs, show a generic label
          if (segments[index - 1] === "word") {
            breadcrumbs[breadcrumbs.length - 1].label = `Word: ${segment}`;
          } else {
            breadcrumbs.push({ 
              label: segment.charAt(0).toUpperCase() + segment.slice(1), 
              path: currentPath 
            });
          }
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-1 mb-4 text-sm">
      {breadcrumbs.map((item, index) => (
        <div key={item.path} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
          )}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-white font-medium flex items-center gap-1">
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </span>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white p-1 h-auto"
            >
              <Link to={item.path} className="flex items-center gap-1">
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </Link>
            </Button>
          )}
        </div>
      ))}
    </nav>
  );
}
