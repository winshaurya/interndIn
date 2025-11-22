import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data.session?.user) {
          // Validate email domain - only allow work emails, no Gmail
          const email = data.session.user.email;
          const emailDomain = email.split('@')[1]?.toLowerCase();

          // Block personal email domains
          const blockedDomains = [
            'gmail.com',
            'yahoo.com',
            'hotmail.com',
            'outlook.com',
            'live.com',
            'icloud.com',
            'aol.com',
            'protonmail.com',
            'mail.com'
          ];

          if (!emailDomain || blockedDomains.includes(emailDomain)) {
            // Sign out the user and show error
            await supabase.auth.signOut();
            toast({
              title: "Sign-in not allowed",
              description: "Please use your work or educational email address. Personal email accounts (Gmail, Yahoo, etc.) are not permitted.",
              variant: "destructive",
            });
            navigate("/login", { replace: true });
            return;
          }

          toast({
            title: "Welcome!",
            description: "Google sign-in completed successfully.",
          });

          // Navigation will be handled by auth state change in context
          // Just clean up the URL
          window.history.replaceState(
            null,
            "",
            window.location.pathname
          );
        } else {
          throw new Error("No session found");
        }
      } catch (error) {
        console.error("OAuth callback error", error);
        toast({
          title: "Google sign-in failed",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
        navigate("/login", { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  // Show loading while processing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold">Signing you in with Google…</p>
          <p className="text-sm text-muted-foreground">
            Please wait while we secure your session.
          </p>
        </div>
      </div>
    );
  }

  // If user is loaded, check if profile is complete
  if (user) {
    const hasProfile = user.role === 'student'
      ? user.profile?.name && user.profile?.student_id
      : user.role === 'alumni'
      ? user.profile?.name && user.profile?.current_title
      : true; // admin doesn't need profile completion

    if (!hasProfile) {
      // Redirect to profile setup for incomplete profiles
      navigate("/profile-setup", { replace: true });
      return null;
    }

    // Profile is complete, redirect to home
    navigate("/", { replace: true });
    return null;
  }

  // If no user and not loading, redirect to login
  navigate("/login", { replace: true });
  return null;
};

export default OAuthCallback;
