import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import GraduationCap from '@/components/icons/GraduationCap';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleHome } from "@/lib/auth";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      const pendingPath = location.state?.from;
      const fallbackRoute = getRoleHome(response.user.role) || "/";
      const destination = pendingPath || fallbackRoute;

      toast({
        title: "Welcome back!",
        description: "Redirecting you to your workspace",
        variant: "default",
      });
      navigate(destination, { replace: true });

    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { url } = await apiClient.getGoogleOAuthUrl(redirectTo);
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Unable to start Google OAuth");
      }
    } catch (error) {
      toast({
        title: "Google sign-in failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-elegant">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Sign in to your SGSITS Portal account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => handleInputChange("rememberMe", checked)}
                  />
                  <Label htmlFor="rememberMe" className="text-sm font-normal">Remember me</Label>
                </div>
                <Link to="/reset-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
              </div>

              <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : <>Sign In <ArrowRight className="w-4 h-4 ml-2"/></>}
              </Button>
            </form>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
            >
              <svg width="20" height="20" viewBox="0 0 533.5 544.3" aria-hidden="true">
                <path fill="#4285f4" d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.4H272v95.3h146.9c-6.3 34-25.1 62.8-53.6 82.1v68h86.7c50.7-46.7 81.5-115.4 81.5-194.9z" />
                <path fill="#34a853" d="M272 544.3c72.4 0 133.2-23.9 177.6-64.9l-86.7-68c-24 16.1-54.7 25.5-90.9 25.5-69.9 0-129-47.2-150.1-110.7H32.4v69.7C77.1 483.2 168.4 544.3 272 544.3z" />
                <path fill="#fbbc04" d="M121.9 326.2c-10.6-31.9-10.6-66.5 0-98.4V158.1H32.4c-43.2 85.5-43.2 186.1 0 271.6z" />
                <path fill="#ea4335" d="M272 107.7c39.4-.6 77.4 14.5 106.2 41.9l79.3-79.3C404.9 24.5 339.6-.4 272 0 168.4 0 77.1 61.1 32.4 158.1l89.5 69.7C142.9 154.9 202.1 107.7 272 107.7z" />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t"/></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Don't have an account?</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <Link to="/signup">Create new account</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need help accessing your account?{" "}
            <Link to="/privacy" className="text-primary hover:underline">Contact Privacy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
