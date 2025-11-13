import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setEmailSent(true);
      toast({
        title: "Reset link sent!",
        description: "Check your email for password reset instructions.",
      });
      setIsLoading(false);
    }, 2000);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-elegant">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-success rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-success-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
              <CardDescription>
                We've sent a password reset link to {email}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click the link in the email to reset your password. 
                  The link will expire in 30 minutes for security.
                </p>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Sign In
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => setEmailSent(false)}
                  >
                    Didn't receive the email? Try again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-elegant">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a reset link
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use the email address associated with your account
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            {/* Back to Login */}
           <Button variant="outline" className="w-full" asChild>
            <Link
              to="/login"
              className="w-full flex items-center justify-center text-primary hover:bg-primary hover:text-white font-medium"
            >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
            </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;