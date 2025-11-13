import { AlumniSidebar } from "@/components/alumni/AlumniSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, User } from "lucide-react";
import { Outlet } from "react-router-dom";

export function AlumniLayout() {
  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <AlumniSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border px-6 bg-card shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search postings, applicants..."
                className="w-64 pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="relative text-foreground hover:text-primary-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive"></span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-foreground hover:text-primary-foreground"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-6 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
