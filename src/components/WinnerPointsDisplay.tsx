import { Trophy, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserCredits } from "@/hooks/useUserCredits";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WinnerPointsDisplayProps {
  variant?: "header" | "compact" | "full";
  className?: string;
}

export const WinnerPointsDisplay = ({ 
  variant = "header",
  className = "" 
}: WinnerPointsDisplayProps) => {
  const { balance, balanceInSoles, isLoading, isAuthenticated } = useUserCredits();

  // Don't show anything if not authenticated
  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-accent" />
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link 
              to="/mi-billetera"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-accent/10 rounded-full cursor-pointer hover:bg-accent/20 transition-colors ${className}`}
            >
              <Trophy className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-accent">{balance.toLocaleString()}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{balance.toLocaleString()} WinnerPoints</p>
            <p className="text-xs text-accent mt-1">Click para ver tu billetera</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "full") {
    return (
      <Link 
        to="/mi-billetera"
        className={`flex flex-col items-center p-4 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl border border-accent/20 hover:from-accent/25 hover:to-accent/10 transition-all cursor-pointer ${className}`}
      >
        <Trophy className="w-8 h-8 text-accent mb-2" />
        <span className="text-2xl font-bold text-foreground">{balance.toLocaleString()}</span>
        <span className="text-sm font-medium text-accent">WinnerPoints</span>
      </Link>
    );
  }

  // Default header variant
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link 
            to="/mi-billetera"
            className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-accent/15 to-accent/5 rounded-full border border-accent/20 cursor-pointer transition-all hover:from-accent/20 hover:to-accent/10 hover:border-accent/30 ${className}`}
          >
            <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center">
              <Trophy className="w-3 h-3 text-accent-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">{balance.toLocaleString()}</span>
            <span className="text-xs font-medium text-accent hidden sm:inline">WP</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-3">
          <div className="text-center">
            <p className="font-bold text-base">{balance.toLocaleString()} WinnerPoints</p>
            <p className="text-xs text-accent mt-2">Click para ver tu billetera</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
