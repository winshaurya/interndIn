import { Settings, Search, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tips = [
  {
    icon: Settings,
    title: "Optimize Your Profile",
    description: "Ensure all sections are complete for higher visibility.",
    action: "View Tips"
  },
  {
    icon: Search,
    title: "Refine Your Job Search",
    description: "Use advanced filters to find your ideal role.",
    action: "Set Filters"
  }
];

export default function PersonalizedTips() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Personalized Tips</CardTitle>
        <p className="text-sm text-muted-foreground">
          Improve your profile and job search strategy.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group">
              <div className="p-2 rounded-lg bg-primary/10">
                <tip.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{tip.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}