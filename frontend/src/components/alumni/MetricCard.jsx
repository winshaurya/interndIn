import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  description,
  className 
}) {
  return (
    <Card className={cn("gradient-card shadow-glow hover:shadow-lg transition-all duration-300", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {change && (
                <span
                  className={cn(
                    "text-sm font-medium",
                    change.type === "increase" ? "text-success" : "text-destructive"
                  )}
                >
                  {change.type === "increase" ? "+" : "-"}{Math.abs(change.value)}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}