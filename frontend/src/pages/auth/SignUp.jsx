import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, GraduationCap, Building } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    studentId: "",
    branch: "",
    gradYear: "",
    currentTitle: "",
    acceptTerms: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (userType === "student" && !formData.email.endsWith("@sgsits.ac.in")) {
      toast({
        title: "Invalid email",
        description: "Students must use their SGSITS institute email address.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (userType === "student" && !formData.branch) {
      toast({
        title: "Branch required",
        description: "Please select your branch.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (userType === "alumni" && !formData.currentTitle) {
      toast({
        title: "Job title required",
        description: "Please enter your current job title.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: "Terms not accepted",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      let response;
      if (userType === "student") {
        response = await apiClient.request('/auth/register/student', {
          method: 'POST',
          body: JSON.stringify({
            name: formData.name,
            role: 'student',
            email: formData.email,
            password_hash: formData.password,
            branch: formData.branch,
            gradYear: formData.gradYear,
            student_id: formData.studentId,
          }),
        });
      } else {
        response = await apiClient.request('/auth/register/alumni', {
          method: 'POST',
          body: JSON.stringify({
            name: formData.name,
            role: 'alumni',
            email: formData.email,
            password_hash: formData.password,
            current_title: formData.currentTitle,
            grad_year: formData.gradYear,
          }),
        });
      }

      toast({
        title: "Account created successfully!",
        description: "Please login to continue.",
        variant: "default",
      });

      // Redirect to login after registration
      navigate("/login");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            <CardTitle className="text-2xl font-bold">Join SGSITS Alumni Portal</CardTitle>
            <CardDescription>Connect with opportunities and build your career</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* User Type Selection */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={userType === "student" ? "default" : "outline"}
                onClick={() => setUserType("student")}
                className="flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                Student
              </Button>
              <Button
                type="button"
                variant={userType === "alumni" ? "default" : "outline"}
                onClick={() => setUserType("alumni")}
                className="flex items-center gap-2"
              >
                <Building className="w-4 h-4" />
                Alumni
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email {userType === "student" && "(Institute Email)"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={userType === "student" ? "yourname@sgsits.ac.in" : "your.email@example.com"}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
                {userType === "student" && (
                  <p className="text-xs text-muted-foreground">
                    Use your official SGSITS email address
                  </p>
                )}
              </div>

              {/* Student ID (for students only) */}
              {userType === "student" && (
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    type="text"
                    placeholder="Enter your student ID"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange("studentId", e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Branch (for students only) */}
              {userType === "student" && (
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select onValueChange={(value) => handleInputChange("branch", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSE">Computer Science & Engineering</SelectItem>
                      <SelectItem value="IT">Information Technology</SelectItem>
                      <SelectItem value="ECE">Electronics & Communication Engineering</SelectItem>
                      <SelectItem value="EE">Electrical Engineering</SelectItem>
                      <SelectItem value="ME">Mechanical Engineering</SelectItem>
                      <SelectItem value="CE">Civil Engineering</SelectItem>
                      <SelectItem value="CHE">Chemical Engineering</SelectItem>
                      <SelectItem value="MCA">Master of Computer Applications</SelectItem>
                      <SelectItem value="MBA">Master of Business Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Graduation Year (for alumni) */}
              {userType === "alumni" && (
                <div className="space-y-2">
                  <Label htmlFor="gradYear">Graduation Year</Label>
                  <Select onValueChange={(value) => handleInputChange("gradYear", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select graduation year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Current Title (for alumni) */}
              {userType === "alumni" && (
                <div className="space-y-2">
                  <Label htmlFor="currentTitle">Current Job Title</Label>
                  <Input
                    id="currentTitle"
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={formData.currentTitle}
                    onChange={(e) => handleInputChange("currentTitle", e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
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
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with 1 number and 1 letter
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleInputChange("acceptTerms", checked)}
                />
                <Label htmlFor="acceptTerms" className="text-sm font-normal">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              {/* Submit Button */}
              <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
