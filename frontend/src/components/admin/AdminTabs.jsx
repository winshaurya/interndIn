import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";

const tabItems = [
  { label: "Users", value: "users", path: "/admin" },
  { label: "Companies", value: "companies", path: "/admin/companies" },
  { label: "Postings", value: "postings", path: "/admin/postings" },
  { label: "Applications", value: "applications", path: "/admin/applications" },
  { label: "Taxonomies", value: "taxonomies", path: "/admin/taxonomies" },
  { label: "Settings", value: "settings", path: "/admin/settings" },
  { label: "Analytics", value: "analytics", path: "/admin/analytics" },
  { label: "Audit Logs", value: "audit-logs", path: "/admin/audit-logs" },
];

export function AdminTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentTab = () => {
    const currentTab = tabItems.find(tab => {
      if (tab.path === "/admin") {
        return location.pathname === "/admin";
      }
      return location.pathname.startsWith(tab.path);
    });
    return currentTab?.value || "users";
  };

  const handleTabChange = (value) => {
    const tab = tabItems.find(t => t.value === value);
    if (tab) {
      navigate(tab.path);
    }
  };

  return (
    <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-8 bg-muted/50 p-1 h-auto">
        {tabItems.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="px-4 py-2.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}