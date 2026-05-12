import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PageErrorProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function PageError({
  title = "Unable to load this page",
  message = "Please refresh after the server is ready.",
  onRetry,
}: PageErrorProps) {
  return (
    <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
      <CardContent className="p-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
          <div>
            <p className="font-semibold text-destructive">{title}</p>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="sm:ml-4">
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
