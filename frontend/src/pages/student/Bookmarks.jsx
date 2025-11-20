import { useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataState from "@/components/common/DataState";

const bookmarkedRoles = [
  {
    id: "bk-1",
    title: "Mobile Engineer",
    company: "Pulse",
    type: "Full-time",
    location: "Remote",
  },
  {
    id: "bk-2",
    title: "Data Science Intern",
    company: "Quantify",
    type: "Internship",
    location: "Indore",
  },
];

export default function StudentBookmarks() {
  const outletContext = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    outletContext?.setHeaderMeta?.({
      title: "Bookmarks",
      description: "Roles you have saved for later."
    });
  }, [outletContext]);

  if (!bookmarkedRoles.length) {
    return (
      <DataState
        state="empty"
        message="No bookmarked roles yet"
        description="Tap the bookmark icon on a job card to save it for quick access."
        action={
          <Button onClick={() => navigate("/jobs")}>
            Explore jobs
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-6">
      {bookmarkedRoles.map((role) => (
        <Card key={role.id} className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">{role.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{role.company}</p>
            </div>
            <Badge variant="secondary">{role.type}</Badge>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{role.location}</div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigate(`/jobs`)}>
                View details
              </Button>
              <Button size="sm" onClick={() => navigate(`/jobs`)}>
                Apply now
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
