import { LayoutDashboard, Briefcase, BookmarkCheck, FileText, UserRound, Building2, Users, ShieldCheck, Settings2, BarChart3, Mail } from "lucide-react";

export const navigation = {
  student: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", to: "/student", icon: LayoutDashboard },
        { title: "Jobs", to: "/jobs", icon: Briefcase },
        { title: "Applications", to: "/student/applications", icon: FileText },
        { title: "Profile", to: "/student/profile", icon: UserRound },
      ],
    },
    {
      label: "Resources",
      items: [
        { title: "Bookmarks", to: "/student/bookmarks", icon: BookmarkCheck },
      ],
    },
  ],
  alumni: [
    {
      label: "Workspace",
      items: [
        { title: "Overview", to: "/alumni", icon: LayoutDashboard },
        { title: "Postings", to: "/alumni/postings", icon: Briefcase },
        { title: "Applicants", to: "/alumni/applications", icon: Users },
        { title: "Company", to: "/alumni/company-profile", icon: Building2 },
      ],
    },
  ],
  admin: [
    {
      label: "Control",
      items: [
        { title: "Dashboard", to: "/admin", icon: LayoutDashboard },
        { title: "Users", to: "/admin/companies", icon: Users },
        { title: "Postings", to: "/admin/postings", icon: Briefcase },
        { title: "Taxonomies", to: "/admin/taxonomies", icon: Settings2 },
        { title: "Reports", to: "/admin/analytics", icon: BarChart3 },
        { title: "Audit", to: "/admin/audit-logs", icon: ShieldCheck },
        { title: "Broadcasts", to: "/admin/settings", icon: Mail },
      ],
    },
  ],
};

export default navigation;
