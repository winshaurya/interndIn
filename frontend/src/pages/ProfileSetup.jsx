import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const ProfileSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    studentId: "",
    branch: "",
    gradYear: "",
    currentTitle: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare profile data based on role
      const profileData = user.role === "student" ? {
        name: formData.name,
        phone: formData.phone,
        student_id: formData.studentId,
        branch: formData.branch,
        grad_year: parseInt(formData.gradYear),
      } : {
        name: formData.name,
        phone: formData.phone,
        current_title: formData.currentTitle,
        grad_year: parseInt(formData.gradYear),
      };

      // Use the correct API endpoint
      const endpoint = user.role === "student" ? '/profile/student' : '/profile/alumni';

      const response = await apiClient.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      if (response.success) {
        toast({
          title: "Profile completed!",
          description: "Welcome to the platform.",
          variant: "default",
        });

        // Redirect to dashboard
        navigate(user.role === "student" ? "/student" : "/alumni");
      } else {
        throw new Error(response.error || 'Profile update failed');
      }
    } catch (error) {
      console.error("Profile setup failed:", error);

      // Show specific error message if available
      const errorMessage = error.details?.[0]?.message ||
                          error.message ||
                          "Profile setup failed";

      toast({
        title: "Profile setup failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Don't redirect on error - let user try again
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
            <CardTitle className="text-2xl font-heading">Complete Your Profile</CardTitle>
            <CardDescription>
              Please fill in your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
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

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>

              {user.role === "student" && (
                <>
                  {/* Student ID */}
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

                  {/* Branch */}
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select onValueChange={(value) => handleInputChange("branch", value)} value={formData.branch}>
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

                  {/* Graduation Year */}
                  <div className="space-y-2">
                    <Label htmlFor="gradYear">Graduation Year</Label>
                    <Select onValueChange={(value) => handleInputChange("gradYear", value)} value={formData.gradYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select graduation year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() + 4 - i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {user.role === "alumni" && (
                <>
                  {/* Current Title */}
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

                  {/* Graduation Year */}
                  <div className="space-y-2">
                    <Label htmlFor="gradYear">Graduation Year</Label>
                    <Select onValueChange={(value) => handleInputChange("gradYear", value)} value={formData.gradYear}>
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
                </>
              )}

              {/* Submit Button */}
              <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Complete Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;
