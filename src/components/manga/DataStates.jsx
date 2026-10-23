import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GridSkeleton({ count = 10, heading }) {
  return (
    <div>
      {heading && <div className="h-8 w-56 bg-muted rounded-lg mb-10 animate-pulse" />}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function InlineLoader({ label = "Loading from the manga database..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function LoadError({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <div>
        <div className="font-semibold text-foreground">Could not reach the manga database</div>
        <div className="text-sm text-muted-foreground mt-1 max-w-md">{message}</div>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="rounded-xl">
          <RefreshCw className="h-4 w-4 mr-2" /> Try again
        </Button>
      )}
    </div>
  );
}