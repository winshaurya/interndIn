import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const applications = [
  { id: "1", title: "Backend Developer", company: "CodeCraft Solutions", status: "Reviewed", daysAgo: 2 },
  { id: "2", title: "UI/UX Designer", company: "Design Hub", status: "Applied", daysAgo: 5 },
  { id: "3", title: "Software Engineer I", company: "TechCorp", status: "Interview", daysAgo: 7 },
];

const statusColors = {
  "Reviewed": "bg-blue-100 text-blue-800 border-blue-200",
  "Applied": "bg-orange-100 text-orange-800 border-orange-200",
  "Interview": "bg-green-100 text-green-800 border-green-200"
};

export default function ApplicationHistory() {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
              <div>
                <h4 className="font-medium">{app.title}</h4>
                <p className="text-sm text-muted-foreground">{app.company}</p>
                <p className="text-xs text-muted-foreground mt-1">Applied {app.daysAgo} days ago</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className={statusColors[app.status]}>
                  {app.status}
                </Badge>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}