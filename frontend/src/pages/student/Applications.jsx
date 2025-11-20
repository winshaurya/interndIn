import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiClient } from "@/lib/api";
import DataState from "@/components/common/DataState";

const fallbackApplications = [
  {
    id: "mock-1",
    jobTitle: "Frontend Engineer",
    company: "Aurora Labs",
    status: "review",
    updatedAt: "2025-01-18",
    location: "Remote",
    type: "Internship",
  },
  {
    id: "mock-2",
    jobTitle: "Product Analyst",
    company: "InSight",
    status: "interview",
    updatedAt: "2025-01-12",
    location: "Mumbai",
    type: "Full-time",
  },
  {
    id: "mock-3",
    jobTitle: "Backend Developer",
    company: "StackForge",
    status: "offer",
    updatedAt: "2025-01-05",
    location: "Bengaluru",
    type: "Full-time",
  },
];

const statusMeta = {
  review: { label: "Under review", tone: "bg-primary/10 text-primary" },
  interview: { label: "Interview", tone: "bg-amber-100 text-amber-800" },
  offer: { label: "Offer", tone: "bg-green-100 text-green-700" },
  rejected: { label: "Declined", tone: "bg-red-100 text-red-700" },
};

export default function StudentApplications() {
  const outletContext = useOutletContext();
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    outletContext?.setHeaderMeta?.({
      title: "Applications",
      description: "Manage every job you have applied to and follow up with recruiters.",
    });
  }, [outletContext]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-applications"],
    queryFn: async () => {
      try {
        const response = await apiClient.request("/job/applications/me", { method: "GET" });
        return response?.data || [];
      } catch (error) {
        console.warn("Falling back to mock applications", error);
        return fallbackApplications;
      }
    },
  });

  const applications = data || [];

  const filteredApplications = useMemo(() => {
    if (activeTab === "all") return applications;
    return applications.filter((app) => app.status === activeTab);
  }, [activeTab, applications]);

  if (isLoading && applications.length === 0) {
    return <DataState state="loading" message="Fetching applications" />;
  }

  if (isError && applications.length === 0) {
    return <DataState state="error" message="Unable to load applications" />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Application summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["all", "review", "interview", "offer"].map((key) => {
            const label = key === "all" ? "Total" : statusMeta[key]?.label;
            const count =
              key === "all"
                ? applications.length
                : applications.filter((app) => app.status === key).length;
            return (
              <div key={key} className="rounded-xl border px-4 py-3">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
                <p className="text-2xl font-semibold">{count}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="review">Under review</TabsTrigger>
          <TabsTrigger value="interview">Interviews</TabsTrigger>
          <TabsTrigger value="offer">Offers</TabsTrigger>
          <TabsTrigger value="rejected">Declined</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <Card className="border-border/60">
            <CardContent className="p-0">
              {filteredApplications.length === 0 ? (
                <DataState state="empty" message="No applications" description="Apply to more roles and track them here." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => {
                      const status = statusMeta[app.status] || statusMeta.review;
                      return (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div className="font-medium">{app.jobTitle || app.job_title}</div>
                            <p className="text-xs text-muted-foreground">{app.location || "Remote"}</p>
                          </TableCell>
                          <TableCell>{app.company}</TableCell>
                          <TableCell>
                            <Badge className={status.tone}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>{app.updatedAt || app.updated_at}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="ghost" size="sm">
                              Message recruiter
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
