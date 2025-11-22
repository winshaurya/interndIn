import { useEffect, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowUpRight, Sparkles, Target, FileText, BookMarked } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import DataState from "@/components/common/DataState";
import ApplicationHistory from "@/components/ApplicationHistory";

const quickActions = [
  { label: "Update Profile", to: "/student/profile" },
  { label: "Browse Jobs", to: "/jobs" },
  { label: "View Applications", to: "/student/applications" },
];

const defaultTimeline = [
  { title: "Profile created", date: "Jan 06", status: "completed" },
  { title: "First application", date: "Jan 10", status: "completed" },
  { title: "Upcoming interview", date: "Jan 24", status: "upcoming" },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const outletContext = useOutletContext();

  useEffect(() => {
    outletContext?.setHeaderMeta?.({
      title: "Student Command Center",
      description: "Track your progress, applications, and curated opportunities.",
    });
  }, [outletContext]);

  const {
    data: profileResponse,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => apiClient.getStudentProfile(),
  });

  const {
    data: jobsResponse,
    isLoading: jobsLoading,
  } = useQuery({
    queryKey: ["jobs", "recommended"],
    queryFn: () => apiClient.getJobs(),
  });

  const profile = profileResponse?.data || profileResponse || {};
  const jobs = jobsResponse?.data?.jobs || jobsResponse?.data || [];

  const completion = useMemo(() => {
    const checkpoints = [
      Boolean(profile?.resume_url),
      Boolean(profile?.skills && profile.skills.length),
      Boolean(profile?.branch),
      Boolean(profile?.grad_year),
    ];
    const filled = checkpoints.filter(Boolean).length;
    return Math.round((filled / checkpoints.length) * 100) || 0;
  }, [profile]);

  useEffect(() => {
    if (!profileLoading && !profileError && !profile?.profile) {
      navigate('/profile-setup');
    }
  }, [profileLoading, profileError, profile, navigate]);

  useEffect(() => {
    if (profileError) {
      toast({
        title: "Unable to load profile",
        description: "Please refresh or try again later.",
        variant: "destructive",
      });
    }
  }, [profileError, toast]);

  if (profileLoading && jobsLoading) {
    return <DataState state="loading" message="Loading your workspace" />;
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="border-border/60 shadow-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <p className="text-sm text-muted-foreground/80 uppercase tracking-[0.3em]">
                Profile completeness
              </p>
              <CardTitle className="text-2xl font-semibold">{completion}% complete</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {profile?.branch || "Branch TBD"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={completion} className="h-2" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Resume", done: Boolean(profile?.resume_url) },
                { label: "Skills", done: Boolean(profile?.skills && profile.skills.length) },
                { label: "Branch", done: Boolean(profile?.branch) },
                { label: "Graduation", done: Boolean(profile?.grad_year) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className={item.done ? "text-green-500" : "text-muted-foreground"}>
                    {item.done ? "Complete" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="secondary" onClick={() => navigate("/student/profile")}>
              Complete profile
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="ghost"
                className="w-full justify-between px-3"
                onClick={() => navigate(action.to)}
              >
                {action.label}
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {["Applications", "Interviews", "Offers", "Bookmarks"].map((label, index) => {
          const value = [
            profile?.applications_count,
            profile?.interviews_count,
            profile?.offers_count,
            profile?.bookmarks_count,
          ][index] || 0;
          const Icon = [FileText, Target, Sparkles, BookMarked][index];
          return (
            <Card key={label} className="border-border/60">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
                  <p className="text-2xl font-semibold">{value}</p>
                </div>
                <Icon className="h-5 w-5 text-primary" />
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Recommended roles</CardTitle>
              <p className="text-sm text-muted-foreground">Based on your skills & interests</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/jobs")}>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Fetching jobs
              </div>
            ) : jobs.length === 0 ? (
              <DataState
                state="empty"
                message="No recommendations yet"
                description="Update your skills to receive curated roles."
              />
            ) : (
              <div className="grid gap-4">
                {jobs.slice(0, 4).map((job) => (
                  <div
                    key={job.id || job.job_id}
                    className="rounded-xl border p-4 hover:border-primary/60 hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-semibold">{job.job_title || job.title}</p>
                        <p className="text-sm text-muted-foreground">{job.company_name || job.company}</p>
                      </div>
                      <Badge variant="secondary">{job.work_mode || "Remote"}</Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{job.location || "Flexible"}</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>{job.job_type || job.type || "Full-time"}</span>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/jobs/${job.id || job.job_id}`)}>
                        View details
                      </Button>
                      <Button size="sm">Apply now</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Journey timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {defaultTimeline.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className={`mt-1 h-2.5 w-2.5 rounded-full ${item.status === "completed" ? "bg-primary" : "bg-muted-foreground/60"}`} />
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <ApplicationHistory />
    </div>
  );
}
