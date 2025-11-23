import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut, User, Menu, Home, Briefcase, Building2, Users, Settings, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email || 'User';
  };

  const getProfilePictureUrl = () => {
    return user?.profilePictureUrl ||
           user?.profile?.profilePictureUrl ||
           user?.profile_picture_url;
  };

  const getNavigationItems = () => {
    const baseItems = [
      { to: '/jobs', label: 'Jobs', icon: Briefcase },
    ];

    if (user?.role === 'alumni') {
      baseItems.push(
        { to: '/alumni', label: 'Dashboard', icon: Home },
        { to: '/alumni/postings', label: 'Postings', icon: Briefcase },
        { to: '/alumni/applications', label: 'Applicants', icon: Users },
        { to: '/alumni/company-profile', label: 'Company', icon: Building2 }
      );
    } else if (user?.role === 'student') {
      baseItems.push(
        { to: '/student', label: 'Dashboard', icon: Home },
        { to: '/student/applications', label: 'Applications', icon: FileText },
        { to: '/student/profile', label: 'Profile', icon: User }
      );
    } else {
      baseItems.push(
        { to: '/jobs', label: 'Jobs', icon: Briefcase }
      );
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const isActiveLink = (path) => {
    if (path === '/jobs' && location.pathname.startsWith('/jobs')) return true;
    if (path === '/student' && location.pathname.startsWith('/student')) return true;
    if (path === '/alumni' && location.pathname.startsWith('/alumni')) return true;
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline-block">interndIn</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navigationItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActiveLink(item.to)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted/50 transition-colors">
                  <Avatar className="h-10 w-10 ring-2 ring-transparent hover:ring-primary/20 transition-all">
                    <AvatarImage
                      src={getProfilePictureUrl()}
                      alt={getUserDisplayName()}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(getUserDisplayName())}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <div className="flex items-center justify-start gap-3 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getProfilePictureUrl()} alt={getUserDisplayName()} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(getUserDisplayName())}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{getUserDisplayName()}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user?.role || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/${user?.role || 'student'}`} className="cursor-pointer">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/${user?.role || 'student'}/profile`} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-primary-foreground" />
                  </div>
                  interndIn
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActiveLink(item.to)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}

                {!isAuthenticated && (
                  <>
                    <div className="border-t my-4"></div>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Sign In
                    </Link>
                    <Button asChild className="mt-2">
                      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                        Get Started
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
