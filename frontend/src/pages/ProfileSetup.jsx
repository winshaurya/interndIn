import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
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
  const [savingField, setSavingField] = useState(null);
  const [branches, setBranches] = useState([]);
  const [gradYears, setGradYears] = useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    studentId: "",
    branch: "",
    gradYear: "",
    currentTitle: "",
  });

  // Redirect if not authenticated (protect against public route) and show loader while we wait
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Load existing profile data if available
  useEffect(() => {
    if (user?.profile) {
      setFormData({
        name: user.profile.name || "",
        phone: user.profile.phone || "",
        studentId: user.profile.student_id || "",
        branch: user.profile.branch || "",
        gradYear: user.profile.grad_year?.toString() || "",
        currentTitle: user.profile.current_title || "",
      });
    }
  }, [user]);

  // Load branches and grad years
  useEffect(() => {
    const loadData = async () => {
      try {
        const [branchesData, gradYearsData] = await Promise.all([
          apiClient.getBranches(),
          apiClient.getGradYears(),
        ]);
        setBranches(branchesData);
        setGradYears(gradYearsData);
      } catch (error) {
        // Fallback to hardcoded if needed
        setBranches([
          { value: "CSE", label: "Computer Science & Engineering" },
          { value: "IT", label: "Information Technology" },
          { value: "ECE", label: "Electronics & Communication Engineering" },
          { value: "EE", label: "Electrical Engineering" },
          { value: "ME", label: "Mechanical Engineering" },
          { value: "CE", label: "Civil Engineering" },
          { value: "CHE", label: "Chemical Engineering" },
          { value: "MCA", label: "Master of Computer Applications" },
          { value: "MBA", label: "Master of Business Administration" },
        ]);
        setGradYears(Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + 4 - i));
      }
    };
    loadData();
  }, []);

  // Auto-save individual fields
  const saveField = async (fieldName, value) => {
    if (!value || savingField === fieldName) return;

    setSavingField(fieldName);
    try {
      // Prepare the data to save based on field
      let dataToSave = {};

      switch (fieldName) {
        case 'name':
          dataToSave = { name: value };
          break;
        case 'phone':
          dataToSave = { phone: value };
          break;
        case 'studentId':
          dataToSave = { student_id: value };
          break;
        case 'branch':
          dataToSave = { branch: value };
          break;
        case 'gradYear':
          dataToSave = { grad_year: parseInt(value) };
          break;
        case 'currentTitle':
          dataToSave = { current_title: value };
          break;
        default:
          return;
      }

      const endpoint = user.role === "student" ? '/profile/student' : '/profile/alumni';

      await apiClient.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(dataToSave),
      });

      // Show subtle success feedback

    } catch (error) {
      // Don't show toast for auto-save failures to avoid spam
    } finally {
      setSavingField(null);
    }
  };

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
                  onBlur={(e) => saveField("name", e.target.value)}
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
                  onBlur={(e) => saveField("phone", e.target.value)}
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
                      onBlur={(e) => saveField("studentId", e.target.value)}
                      required
                    />
                  </div>

                  {/* Branch */}
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select
                      onValueChange={(value) => {
                        handleInputChange("branch", value);
                        saveField("branch", value);
                      }}
                      value={formData.branch}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.value} value={branch.value}>
                            {branch.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Graduation Year */}
                  <div className="space-y-2">
                    <Label htmlFor="gradYear">Graduation Year</Label>
                    <Select
                      onValueChange={(value) => {
                        handleInputChange("gradYear", value);
                        saveField("gradYear", value);
                      }}
                      value={formData.gradYear}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select graduation year" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
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
                      onBlur={(e) => saveField("currentTitle", e.target.value)}
                      required
                    />
                  </div>

                  {/* Graduation Year */}
                  <div className="space-y-2">
                    <Label htmlFor="gradYear">Graduation Year</Label>
                    <Select
                      onValueChange={(value) => {
                        handleInputChange("gradYear", value);
                        saveField("gradYear", value);
                      }}
                      value={formData.gradYear}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select graduation year" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
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
