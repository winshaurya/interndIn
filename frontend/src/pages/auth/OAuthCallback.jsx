import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
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
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          setStatus("Authentication failed. Redirecting to login...");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        if (data?.session?.user) {
          const user = data.session.user;
          const roleFromUrl = searchParams.get('role') || 'student';

          setStatus("Checking user profile...");

          // Check if user exists in our database
          let { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

          let isNewUser = false;

          if (userError && userError.code === 'PGRST116') {
            // User doesn't exist, create profile with role from URL
            setStatus("Creating your profile...");
            isNewUser = true;

            try {
              const response = await fetch('/api/auth/create-profile', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  id: user.id,
                  email: user.email,
                  role: roleFromUrl,
                }),
              });

              if (!response.ok) {
                throw new Error('Failed to create profile');
              }

              // Reload user data
              const { data: newUserData } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

              userData = newUserData;
            } catch (createError) {
              console.error("Error creating user profile:", createError);
              setStatus("Profile creation failed. Redirecting to login...");
              setTimeout(() => navigate("/login"), 2000);
              return;
            }
          }

          setStatus("Loading your dashboard...");

          // Create user object for redirection logic
          const userForRedirect = {
            id: user.id,
            email: user.email,
            role: userData?.role || roleFromUrl,
            profile: null, // Will be loaded by AuthContext
          };

          const redirectPath = determineRedirectAfterAuth(userForRedirect, isNewUser);

          // Successfully authenticated, redirect to appropriate page
          setStatus("Welcome! Redirecting to your dashboard...");
          setTimeout(() => navigate(redirectPath, { replace: true }), 1000);
        } else {
          // No session, redirect to login
          setStatus("No active session found. Redirecting to login...");
          setTimeout(() => navigate("/login"), 2000);
        }
      } catch (err) {
        console.error("Callback handling error:", err);
        setStatus("An error occurred. Redirecting to login...");
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
