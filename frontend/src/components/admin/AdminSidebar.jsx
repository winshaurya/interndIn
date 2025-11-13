import { 
  Users, 
  Building2, 
  FileText, 
  ClipboardList, 
  Tags, 
  Settings, 
  BarChart3, 
  Shield 
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Users", url: "/admin", icon: Users },
  { title: "Companies", url: "/admin/companies", icon: Building2 },
  { title: "Postings", url: "/admin/postings", icon: FileText },
  { title: "Applications", url: "/admin/applications", icon: ClipboardList },
  { title: "Taxonomies", url: "/admin/taxonomies", icon: Tags },
  { title: "Settings", url: "/admin/settings", icon: Settings },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Audit Logs", url: "/admin/audit-logs", icon: Shield },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const getNavClassName = ({ isActive }) =>
    `flex items-center w-full px-3 py-2.5 text-sm transition-colors ${
      isActive
        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
    }`;

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar-background border-r border-sidebar-border">
        <div className="p-6 border-b border-sidebar-border">
          <h1
            className={`font-bold text-sidebar-primary-foreground ${
              isCollapsed ? "text-lg text-center" : "text-xl"
            }`}
          >
            {isCollapsed ? "SAC" : "Super Admin Console"}
          </h1>
        </div>

        <SidebarGroup className="px-3 py-4">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className={getNavClassName}
                    >
                      <item.icon
                        className={`h-5 w-5 ${
                          isCollapsed ? "mx-auto" : "mr-3"
                        }`}
                      />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
