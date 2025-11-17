import { Users, Building2, FileText, ClipboardList } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { StatCard } from "@/components/admin/StatCard";
import { UserManagement } from "@/components/admin/UserManagement";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiClient.request('/admin/dashboard'),
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 space-y-8 p-8">
        {/* Dashboard Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage your SGSITS alumni platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="New Users"
            value={isLoading ? "..." : stats?.newUsers || 0}
            icon={Users}
            variant="default"
          />
          <StatCard
            title="Active Companies"
            value={isLoading ? "..." : stats?.activeCompanies || 0}
            icon={Building2}
            variant="success"
          />
          <StatCard
            title="Live Postings"
            value={isLoading ? "..." : stats?.livePostings || 0}
            icon={FileText}
            variant="warning"
          />
          <StatCard
            title="Applications"
            value={isLoading ? "..." : stats?.applicationsToday || 0}
            subtitle="Today"
            icon={ClipboardList}
            variant="default"
          />
        </div>

        {/* User Management Section */}
        <UserManagement />
      </div>
    </div>
  );
}