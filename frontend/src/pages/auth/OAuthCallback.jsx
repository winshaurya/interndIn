import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleHome } from "@/lib/auth";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { syncUserFromSession } = useAuth();

  useEffect(() => {
    const fragment = window.location.hash?.replace(/^#/, "") ?? "";
    const params = new URLSearchParams(fragment);
    const refreshToken = params.get("refresh_token");

    if (!refreshToken) {
      toast({
        title: "Missing OAuth token",
        description: "We couldn't complete the Google sign-in flow.",
        variant: "destructive",
      });
      navigate("/login", { replace: true });
      return;
    }

    const finalize = async () => {
      try {
        const session = await apiClient.refreshSession(refreshToken);
        if (!session?.user) {
          throw new Error("OAuth session missing user payload");
        }

        syncUserFromSession(session.user);
        toast({
          title: "Welcome back!",
          description: "Google sign-in completed successfully.",
        });

        const landing = getRoleHome(session.user.role) || "/";
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`
        );
        navigate(landing, { replace: true });
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

    finalize();
  }, [navigate, syncUserFromSession, toast]);

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
};

export default OAuthCallback;
