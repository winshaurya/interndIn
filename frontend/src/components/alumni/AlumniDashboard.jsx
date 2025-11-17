import { Building2, Users, Briefcase, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { MetricCard } from "./MetricCard";
import { ApplicationChart } from "./ApplicationChart";
import { TopApplicants } from "./TopApplicants";
import { QuickAccess } from "./QuickAccess";
import "../../alumni.css"; // Keep if you have other alumni-specific styles

const AlumniDashboard = () => {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['alumni-dashboard'],
    queryFn: () => apiClient.request('/alumni/dashboard'),
  });

  return (
    <div className="alumni-theme space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.email?.split('@')[0] || 'Alumni'}</h1>
        <p className="text-muted-foreground">
          Manage your job postings and connect with talented SGSITS students.
        </p>
      </div>

      {/* Metrics */}
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

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart and Applicants */}
        <div className="space-y-6 lg:col-span-2">
          <ApplicationChart />
          <TopApplicants />
        </div>

        {/* Quick Access Sidebar */}
        <div className="space-y-6 bg-sidebar-alumni p-4 rounded-lg">
          <QuickAccess />
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;
