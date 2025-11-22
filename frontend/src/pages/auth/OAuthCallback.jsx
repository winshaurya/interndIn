import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getRoleHome } from "@/lib/auth";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          navigate("/login");
          return;
        }

        if (data?.session?.user) {
          // Get user role from metadata or database
          const user = data.session.user;
          let role = user.user_metadata?.role;

          // If role not in metadata, try to fetch from database
          if (!role) {
            try {
              const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();
              role = userData?.role;
            } catch (err) {
              console.error("Error fetching user role:", err);
            }
          }

          // Default to student if no role found
          const homeRoute = getRoleHome(role || 'student');

          // Successfully authenticated, redirect to appropriate dashboard
          navigate(homeRoute, { replace: true });
        } else {
          // No session, redirect to login
          navigate("/login");
        }
      } catch (err) {
        console.error("Callback handling error:", err);
        navigate("/login");
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold">Completing sign in...</CardTitle>
          <CardDescription>Please wait while we finish setting up your account</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          {isProcessing && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
