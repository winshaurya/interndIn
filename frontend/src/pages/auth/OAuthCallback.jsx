import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/api";
import { determineRedirectAfterAuth } from "@/lib/auth";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [status, setStatus] = useState("Processing your sign in...");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus("Verifying authentication...");

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw new Error('No valid session found');
        }

        const role = searchParams.get('role') || 'student';

        setStatus("Creating your account...");

        // Exchange the session for our backend session data
        const callbackData = await apiClient.request('/auth/oauth/callback', {
          method: 'POST',
          body: JSON.stringify({
            code: session.access_token, // Use access token as code for simplicity
            role
          })
        });

        setStatus("Setting up your profile...");

        // Create user object for redirection
        const userForRedirect = {
          id: callbackData.user.id,
          email: callbackData.user.email,
          role: callbackData.user.role,
          profile: callbackData.profile,
          isNewUser: callbackData.isNewUser
        };

        const redirectPath = determineRedirectAfterAuth(userForRedirect, callbackData.isNewUser);

        setStatus("Welcome! Redirecting to your dashboard...");
        setTimeout(() => navigate(redirectPath, { replace: true }), 1000);

      } catch (err) {
        console.error("Callback handling error:", err);
        setStatus("Authentication failed. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold">Signing you in...</CardTitle>
          <CardDescription>{status}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          {isProcessing && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
          {!isProcessing && (
            <div className="text-center">
              <div className="text-green-600 font-medium">✓ Complete</div>
              <p className="text-sm text-muted-foreground mt-2">Redirecting...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
