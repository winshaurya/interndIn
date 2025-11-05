import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, AlertCircle } from "lucide-react";

const ProfileCompletionMeter = ({ sections, completionPercentage }) => {
  const getStatusIcon = (completed) => {
    return completed ? (
      <CheckCircle className="w-4 h-4 text-success" />
    ) : (
      <Circle className="w-4 h-4 text-muted-foreground" />
    );
  };

  const getStatusBadge = () => {
    if (completionPercentage === 100) {
      return <Badge variant="default" className="bg-success text-success-foreground">Complete</Badge>;
    } else if (completionPercentage >= 80) {
      return <Badge variant="default" className="bg-warning text-warning-foreground">Almost Complete</Badge>;
    } else {
      return <Badge variant="outline">In Progress</Badge>;
    }
  };

  const canApply = completionPercentage === 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Profile Completion</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </div>

        {/* Apply Status */}
        <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
          {canApply ? (
            <>
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-success">
                Profile complete! You can now apply to job postings.
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-warning" />
              <span className="text-sm text-muted-foreground">
                Complete all sections below to unlock job applications.
              </span>
            </>
          )}
        </div>

        {/* Section Checklist */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Required Sections
          </h4>
          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30 transition-colors">
                {getStatusIcon(section.completed)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${section.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {section.title}
                    </span>
                    <span className="text-xs text-muted-foreground">+{section.weight}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionMeter;