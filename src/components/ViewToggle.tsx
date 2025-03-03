
import { Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  view: "grid" | "list";
  onChange: (view: "grid" | "list") => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            {view === "grid" ? (
              <>
                <Grid className="h-4 w-4" />
                <span className="hidden sm:inline">Change View</span>
              </>
            ) : (
              <>
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Change View</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => onChange("grid")}
            className={cn("cursor-pointer", view === "grid" && "bg-accent")}
          >
            <Grid className="mr-2 h-4 w-4" />
            <span>Grid View</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onChange("list")}
            className={cn("cursor-pointer", view === "list" && "bg-accent")}
          >
            <List className="mr-2 h-4 w-4" />
            <span>List View</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default ViewToggle;
