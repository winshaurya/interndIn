import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import SidebarNav from "./SidebarNav";
import { useAuth } from "@/contexts/AuthContext";

function RoleBadge({ role }) {
  if (!role) return null;
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
      {role}
    </span>
  );
}

export function AppShell({
  role = "student",
  navSections = [],
  pageTitle = "Dashboard",
  pageDescription = "",
  children,
  headerActions = null,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Unable to logout:", error);
    }
  };

  const displayName = user?.name || user?.email || "Welcome";

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <div className="flex h-screen overflow-hidden">
        <aside className="hidden lg:flex w-72 flex-shrink-0 flex-col border-r bg-background/90 backdrop-blur">
          <div className="px-6 py-5 border-b">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-primary" />
              <div>
                <p className="text-lg font-semibold leading-tight">interndIn</p>
                <RoleBadge role={role} />
              </div>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <SidebarNav sections={navSections} />
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex flex-col gap-4 px-4 py-4 lg:px-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {displayName}
                  </p>
                  <h1 className="text-2xl font-semibold leading-tight">{pageTitle}</h1>
                  {pageDescription ? (
                    <p className="text-sm text-muted-foreground/80">{pageDescription}</p>
                  ) : null}
                </div>
                <div className="flex-1" />
                {headerActions}
                <div className="hidden md:flex items-center gap-3">
                  <div className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
                  </div>
                  <div className="text-right leading-tight">
                    <p className="text-sm font-medium">{displayName}</p>
                    <RoleBadge role={role} />
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative w-full md:max-w-sm">
                  <Input
                    placeholder="Search everything..."
                    className="pl-4 pr-4"
                    type="search"
                  />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10">
            {children}
          </main>

          <footer className="border-t bg-background/70 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} interndIn · Built for SGSITS community</p>
              <div className="flex items-center gap-4">
                <Link to="/privacy" className="hover:text-primary">Privacy</Link>
                <Link to="/" className="hover:text-primary">Public site</Link>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="p-4 border-b text-left">
            <SheetTitle className="text-lg font-semibold">interndIn</SheetTitle>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{role} menu</p>
          </SheetHeader>
          <div className="p-4">
            <SidebarNav sections={navSections} onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default AppShell;
