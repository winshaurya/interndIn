import { Building2, Users, Briefcase, TrendingUp, FilePlus2, Rocket, UserCheck, CalendarClock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { MetricCard } from "./MetricCard";
import { ApplicationChart } from "./ApplicationChart";
import { TopApplicants } from "./TopApplicants";
import { QuickAccess } from "./QuickAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const pipelineBlueprint = [
  {
    key: "draftPostings",
    label: "Drafts",
    fallback: 2,
    subtext: "Needs final details",
    icon: FilePlus2,
    accent: "bg-muted",
  },
  {
    key: "livePostings",
    label: "Live roles",
    fallback: 3,
    subtext: "Collecting applicants",
    icon: Rocket,
    accent: "bg-primary/10 text-primary",
  },
  {
    key: "applicantsInReview",
    label: "Review queue",
    fallback: 27,
    subtext: "Awaiting feedback",
    icon: Users,
    accent: "bg-warning/10 text-warning",
  },
  {
    key: "interviewsScheduled",
    label: "Interviews",
    fallback: 6,
    subtext: "Next 7 days",
    icon: UserCheck,
    accent: "bg-success/10 text-success",
  },
];

const insightBlueprint = [
  {
    label: "Avg response time",
    key: "avgResponseTime",
    fallback: "12h",
    helper: "-2h vs last week",
  },
  {
    label: "Offer acceptance",
    key: "offerAcceptance",
    fallback: "78%",
    helper: "+6% MoM",
  },
  {
    label: "Top source",
    key: "topSource",
    fallback: "Referral program",
    helper: "58% of applicants",
  },
];

const upcomingActions = [
  {
    title: "Interview sync with Ruchi",
    time: "Tomorrow · 4:00 PM",
    detail: "Full Stack Internship",
  },
  {
    title: "Share shortlist with placement cell",
    time: "Friday · 11:30 AM",
    detail: "Product Analyst role",
  },
  {
    title: "Feedback reminder",
    time: "Monday · 9:00 AM",
    detail: "7 candidates pending notes",
  },
];

const checklistItems = [
  {
    title: "Update stipend band for UI/UX internship",
    priority: "High",
  },
  {
    title: "Record intro video for company profile",
    priority: "Medium",
  },
  {
    title: "Invite co-founders to reviewer workspace",
    priority: "Low",
  },
];

const AlumniDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["alumni-dashboard"],
    queryFn: () => apiClient.request("/alumni/dashboard"),
  });

  const pipeline = pipelineBlueprint.map((stage) => ({
    ...stage,
    value: stats?.[stage.key] ?? stage.fallback,
  }));

  const insightTiles = insightBlueprint.map((insight) => ({
    ...insight,
    value: stats?.[insight.key] ?? insight.fallback,
  }));

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Jobs Posted"
          value={isLoading ? "..." : stats?.jobsPosted || 0}
          change={{ value: 12, type: "increase" }}
          icon={Briefcase}
          description="Active postings"
        />
        <MetricCard
          title="Applications Received"
          value={isLoading ? "..." : stats?.applicationsReceived || 0}
          change={{ value: 8, type: "increase" }}
          icon={Users}
          description="This month"
        />
        <MetricCard
          title="Company Views"
          value={isLoading ? "..." : stats?.companyViews || 0}
          change={{ value: 15, type: "increase" }}
          icon={Building2}
          description="Profile visits"
        />
        <MetricCard
          title="Response Rate"
          value={isLoading ? "..." : `${stats?.responseRate || 0}%`}
          change={{ value: 5, type: "increase" }}
          icon={TrendingUp}
          description="Avg response time"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Hiring pipeline</CardTitle>
            <p className="text-sm text-muted-foreground">Track how postings move from drafts to offers.</p>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em]">
            {pipeline[1]?.value || 0} live roles
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {pipeline.map((stage) => (
              <div key={stage.label} className="rounded-xl border bg-muted/30 p-4">
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full ${stage.accent}`}>
                  <stage.icon className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground">{stage.label}</p>
                <p className="text-3xl font-semibold tracking-tight">{stage.value}</p>
                <p className="text-xs text-muted-foreground/80">{stage.subtext}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ApplicationChart />

          <Card>
            <CardHeader>
              <CardTitle>Insights & signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {insightTiles.map((insight) => (
                  <div key={insight.label} className="rounded-lg border p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{insight.label}</p>
                    <p className="text-2xl font-semibold tracking-tight">{insight.value}</p>
                    <p className="text-xs text-muted-foreground/80">{insight.helper}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <TopApplicants />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming actions</CardTitle>
              <Badge variant="outline" className="text-xs">
                Sync calendar
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingActions.map((action) => (
                <div key={action.title} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    {action.title}
                  </div>
                  <p className="text-xs text-muted-foreground">{action.time}</p>
                  <p className="text-xs text-muted-foreground/80">{action.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Launch checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklistItems.map((item) => (
                <div key={item.title} className="flex items-start justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">Due this week</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <QuickAccess />
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;
