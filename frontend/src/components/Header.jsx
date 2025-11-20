import { useState } from "react";
import { Search, Bell, MessageSquare, User, LifeBuoy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, loading, getHomeRoute } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isAuthenticated = Boolean(user);
  const homeRoute = getHomeRoute();

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="bg-primary text-primary-foreground p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-2xl font-bold">interndIn</Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs, companies..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
              disabled={loading}
            />
          </div>
        </div>

        {/* Action Icons & Profile */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-3 text-sm">
            <Link to="/privacy" className="flex items-center gap-1 text-white/80 hover:text-white">
              <LifeBuoy className="h-4 w-4" />
              Privacy
            </Link>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" title="Search">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" title="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 bg-white/10" title="Messages">
            <MessageSquare className="h-5 w-5" />
          </Button>

          {loading ? (
            <div className="flex items-center text-white/80 text-sm">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Restoring session…
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Button variant="secondary" size="sm" className="text-primary" asChild>
                <Link to={homeRoute}>Go to dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={handleLogout}
                title="Logout"
                disabled={isSigningOut}
              >
                {isSigningOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <User className="h-5 w-5" />}
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button variant="default" className="bg-white text-primary hover:bg-white/90" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}