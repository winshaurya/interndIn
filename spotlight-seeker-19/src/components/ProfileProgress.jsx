import { CheckCircle, Circle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

export default function ProfileProgress({ profileData }) {
  const navigate = useNavigate();

  const tasks = [
    { id: 1, text: "Upload your resume", completed: profileData.resumeUploaded },
    { id: 2, text: "Fill out work experience", completed: profileData.experiences.length > 0 },
    { id: 3, text: "Add 3 key skills", completed: profileData.skills.length >= 3, action: "Add" },
    { id: 4, text: "Write a professional summary", completed: profileData.summary?.length > 0, action: "Add" },
  ];

  const completionPercentage = Math.round(
    (tasks.filter(task => task.completed).length / tasks.length) * 100
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold mb-2">Your Profile Progress</CardTitle>
            <p className="text-muted-foreground text-sm">
              Complete your profile to unlock more opportunities!
            </p>
          </div>
          <Button
            onClick={() => navigate("/student/profile")}
            className="bg-primary hover:bg-primary-hover"
          >
            Complete Profile
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {task.completed ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={task.completed ? "text-foreground" : "text-muted-foreground"}>
                  {task.text}
                </span>
              </div>
              {task.action && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-primary p-0 h-auto"
                  onClick={() => navigate("/student/profile")}
                >
                  {task.action}
                </Button>
              )}
            </div>
          ))}

          <div className="mt-4">
            <Progress value={completionPercentage} className="h-3" />
            <p className="mt-1 text-sm">{completionPercentage}% completed</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
