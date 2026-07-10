import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ message = "Analyzing..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
    <Loader2 className="size-8 text-primary animate-spin mb-4" />
    <p className="text-sm text-muted-foreground">{message}</p>
    <div className="mt-4 flex items-center gap-2">
      <div className="size-1.5 bg-primary rounded-full animate-pulse" />
      <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-semibold">
        AI Processing
      </span>
    </div>
  </div>
);

export default LoadingSpinner;
