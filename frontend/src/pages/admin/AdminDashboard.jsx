import { Users, Building2, FileText, ClipboardList } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { StatCard } from "@/components/admin/StatCard";
import { UserManagement } from "@/components/admin/UserManagement";
import { useShellHeader } from "@/hooks/useShellHeader";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiClient.request('/admin/dashboard'),
  });

  useShellHeader({
    title: "Admin Dashboard",
    description: "Platform health, pending approvals, and moderation at a glance.",
  });

  return (
    <div className="space-y-8">
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

      <UserManagement />
    </div>
  );
}