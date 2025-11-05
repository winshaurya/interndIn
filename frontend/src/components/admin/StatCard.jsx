import { Card, CardContent } from "@/components/ui/card";
export function StatCard({ title, value, icon: Icon, variant = "default", subtitle }) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "bg-gradient-to-br from-success/10 to-success/5 border-success/20";
      case "warning":
        return "bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20";
      default:
        return "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20";
    }
  };

  return (
    <Card className={`${getVariantStyles()} transition-all hover:shadow-md`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-foreground">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {Icon && (
            <div className={`p-3 rounded-full ${
              variant === "success" ? "bg-success/20" :
              variant === "warning" ? "bg-warning/20" :
              "bg-primary/20"
            }`}>
              <Icon className={`h-6 w-6 ${
                variant === "success" ? "text-success" :
                variant === "warning" ? "text-warning" :
                "text-primary"
              }`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}