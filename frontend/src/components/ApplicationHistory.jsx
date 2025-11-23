import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import DataState from "@/components/common/DataState";

const statusColors = {
  "Reviewed": "bg-blue-100 text-blue-800 border-blue-200",
  "Applied": "bg-orange-100 text-orange-800 border-orange-200",
  "Interview": "bg-green-100 text-green-800 border-green-200",
  "Rejected": "bg-red-100 text-red-800 border-red-200",
  "Accepted": "bg-green-100 text-green-800 border-green-200"
};

export default function ApplicationHistory() {
  const { data: applicationsResponse, isLoading, isError } = useQuery({
    queryKey: ["applied-jobs"],
    queryFn: () => apiClient.getAppliedJobs(),
  });

  const applications = applicationsResponse?.data || [];

  if (isLoading) return <DataState type="loading" />;
  if (isError) return <DataState type="error" message="Failed to load applications" />;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Applications</CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="text-muted-foreground">No applications yet.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
                <div>
                  <h4 className="font-medium">{app.jobs?.job_title || app.title}</h4>
                  <p className="text-sm text-muted-foreground">{app.jobs?.companies?.name || app.company}</p>
                  <p className="text-xs text-muted-foreground mt-1">Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className={statusColors[app.status] || "bg-gray-100 text-gray-800"}>
                    {app.status || "Applied"}
                  </Badge>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}