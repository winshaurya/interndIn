import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile, updateStudentProfile, updateAlumniProfile, createStudentProfile, createAlumniProfile } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";
import { User, GraduationCap, Code, Briefcase, FileText, CheckCircle } from "lucide-react";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Personal Information
    name: "",
    phone: "",
    dateOfBirth: "",
    address: "",

    // Professional Information (for alumni)
    currentTitle: "",
    companyName: "",
    experienceYears: "",
    gradYear: "",

    // Academic Information
    academics: [{
      degree: "B.Tech",
      branch: "",
      year: new Date().getFullYear().toString(),
      gpa: "",
      institution: "SGSITS"
    }],

    // Skills
    skills: [],

    // Preferences
    preferences: {
      jobTypes: [],
      preferredLocations: [],
      workMode: "hybrid"
    },

    // Consent
    consent: {
      termsConditions: false,
      dataSharing: false,
      profileVisibility: true,
      marketingEmails: false
    }
  });

  const userRole = user?.role || 'student';

  const steps = userRole === 'alumni' ? [
    { title: "Personal Info", icon: User, required: true },
    { title: "Professional Info", icon: Briefcase, required: true },
    { title: "Skills", icon: Code, required: false },
    { title: "Preferences", icon: Briefcase, required: false },
    { title: "Consent", icon: FileText, required: true }
  ] : [
    { title: "Personal Info", icon: User, required: true },
    { title: "Academics", icon: GraduationCap, required: true },
    { title: "Skills", icon: Code, required: false },
    { title: "Preferences", icon: Briefcase, required: false },
    { title: "Consent", icon: FileText, required: true }
  ];

  const calculateProgress = () => {
    let completed = 0;
    let total = 0;

    // Personal Info
    total += 4;
    if (formData.name) completed++;
    if (formData.phone) completed++;
    if (formData.dateOfBirth) completed++;
    if (formData.address) completed++;

    if (userRole === 'student') {
      // Academics
      total += 3;
      if (formData.academics[0].branch) completed++;
      if (formData.academics[0].year) completed++;
      if (formData.academics[0].gpa) completed++;
    } else {
      // Professional Info for alumni
      total += 4;
      if (formData.currentTitle) completed++;
      if (formData.companyName) completed++;
      if (formData.experienceYears) completed++;
      if (formData.gradYear) completed++;
    }

    // Skills
    total += 1;
    if (formData.skills.length > 0) completed++;

    // Preferences
    total += 1;
    if (formData.preferences.jobTypes.length > 0) completed++;

    // Consent
    total += 2;
    if (formData.consent.termsConditions) completed++;
    if (formData.consent.dataSharing) completed++;

    return Math.round((completed / total) * 100);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const role = user?.role || 'student';

      // Separate profile data from role-specific data
      const profileUpdates = {
        full_name: formData.name,
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth,
        address: formData.address,
      };

      if (role === 'alumni') {
        const alumniUpdates = {
          current_title: formData.currentTitle,
          company_name: formData.companyName,
          experience_years: parseInt(formData.experienceYears) || 0,
          grad_year: parseInt(formData.gradYear) || new Date().getFullYear(),
          academics: formData.academics,
          skills: formData.skills,
          preferences: formData.preferences,
          consent: formData.consent,
        };

        // Update profiles table
        await updateUserProfile(user.id, profileUpdates);
        // Create alumni profile
        await createAlumniProfile({ id: user.id, ...alumniUpdates });
        navigate('/alumni');
      } else {
        const studentUpdates = {
          academics: formData.academics,
          skills: formData.skills,
          preferences: formData.preferences,
          consent: formData.consent,
        };

        // Update profiles table
        await updateUserProfile(user.id, profileUpdates);
        // Create student profile
        await createStudentProfile({ id: user.id, ...studentUpdates });
        navigate('/student');
      }

      toast({
        title: "Profile setup complete!",
        description: "Welcome to the platform. Your profile has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateAcademic = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      academics: prev.academics.map((academic, i) =>
        i === index ? { ...academic, [field]: value } : academic
      )
    }));
  };

  const addSkill = (skill) => {
    if (skill && !formData.skills.find(s => s.name === skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, { name: skill, proficiency: 3, experience: 1 }]
      }));
    }
  };

  const removeSkill = (skillName) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.name !== skillName)
    }));
  };

  const toggleJobType = (jobType) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        jobTypes: prev.preferences.jobTypes.includes(jobType)
          ? prev.preferences.jobTypes.filter(type => type !== jobType)
          : [...prev.preferences.jobTypes, jobType]
      }
    }));
  };

  const toggleLocation = (location) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        preferredLocations: prev.preferences.preferredLocations.includes(location)
          ? prev.preferences.preferredLocations.filter(loc => loc !== location)
          : [...prev.preferences.preferredLocations, location]
      }
    }));
  };

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
            <p className="text-muted-foreground">
              Let's set up your profile to help you find the perfect opportunities.
            </p>
          </div>

          {/* Progress Bar */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Setup Progress</span>
                <span className="text-sm font-medium text-primary">{progress}% Complete</span>
              </div>
              <Progress value={progress} className="h-2 mb-4" />

              {/* Step Indicators */}
              <div className="flex justify-between">
                {steps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                      index < currentStep ? 'bg-primary text-primary-foreground' :
                      index === currentStep ? 'bg-primary/20 text-primary border-2 border-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    <span className={`text-xs ${index === currentStep ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const IconComponent = steps[currentStep].icon;
                  return <IconComponent className="w-5 h-5" />;
                })()}
                {steps[currentStep].title}
                {steps[currentStep].required && (
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information Step */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth *</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => updateFormData('address', e.target.value)}
                        placeholder="Enter your complete address"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Academics or Professional Info */}
              {currentStep === 1 && userRole === 'student' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Degree</Label>
                      <Select
                        value={formData.academics[0].degree}
                        onValueChange={(value) => updateAcademic(0, 'degree', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B.Tech">B.Tech</SelectItem>
                          <SelectItem value="M.Tech">M.Tech</SelectItem>
                          <SelectItem value="BCA">BCA</SelectItem>
                          <SelectItem value="MCA">MCA</SelectItem>
                          <SelectItem value="B.Sc">B.Sc</SelectItem>
                          <SelectItem value="M.Sc">M.Sc</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Branch/Specialization *</Label>
                      <Input
                        value={formData.academics[0].branch}
                        onChange={(e) => updateAcademic(0, 'branch', e.target.value)}
                        placeholder="e.g., Computer Science Engineering"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Year of Graduation *</Label>
                      <Input
                        type="number"
                        value={formData.academics[0].year}
                        onChange={(e) => updateAcademic(0, 'year', e.target.value)}
                        placeholder="2024"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GPA/Percentage *</Label>
                      <Input
                        value={formData.academics[0].gpa}
                        onChange={(e) => updateAcademic(0, 'gpa', e.target.value)}
                        placeholder="8.5 CGPA or 85%"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && userRole === 'alumni' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Current Job Title *</Label>
                      <Input
                        value={formData.currentTitle}
                        onChange={(e) => updateFormData('currentTitle', e.target.value)}
                        placeholder="e.g., Software Engineer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company Name *</Label>
                      <Input
                        value={formData.companyName}
                        onChange={(e) => updateFormData('companyName', e.target.value)}
                        placeholder="e.g., Google"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Years of Experience</Label>
                      <Input
                        type="number"
                        value={formData.experienceYears}
                        onChange={(e) => updateFormData('experienceYears', e.target.value)}
                        placeholder="e.g., 3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Graduation Year *</Label>
                      <Input
                        type="number"
                        value={formData.gradYear}
                        onChange={(e) => updateFormData('gradYear', e.target.value)}
                        placeholder="e.g., 2020"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Step */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Add your skills</Label>
                    <Select onValueChange={addSkill}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a skill to add" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="React">React</SelectItem>
                        <SelectItem value="Node.js">Node.js</SelectItem>
                        <SelectItem value="Python">Python</SelectItem>
                        <SelectItem value="JavaScript">JavaScript</SelectItem>
                        <SelectItem value="Java">Java</SelectItem>
                        <SelectItem value="C++">C++</SelectItem>
                        <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                        <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                        <SelectItem value="DevOps">DevOps</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Badge key={skill.name} variant="secondary" className="flex items-center gap-1">
                          {skill.name}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeSkill(skill.name)}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Preferences Step */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Job Types (Select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {["Full-time", "Part-time", "Internship", "Contract", "Freelance"].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={type}
                            checked={formData.preferences.jobTypes.includes(type)}
                            onCheckedChange={() => toggleJobType(type)}
                          />
                          <Label htmlFor={type} className="text-sm">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Preferred Locations</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {["Indore", "Bangalore", "Mumbai", "Delhi", "Remote"].map((location) => (
                        <div key={location} className="flex items-center space-x-2">
                          <Checkbox
                            id={location}
                            checked={formData.preferences.preferredLocations.includes(location)}
                            onCheckedChange={() => toggleLocation(location)}
                          />
                          <Label htmlFor={location} className="text-sm">{location}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Consent Step */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={formData.consent.termsConditions}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          consent: { ...prev.consent, termsConditions: checked }
                        }))}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="terms" className="font-medium">
                          Terms and Conditions *
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          I agree to the platform's terms and conditions for using the placement services.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="dataSharing"
                        checked={formData.consent.dataSharing}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          consent: { ...prev.consent, dataSharing: checked }
                        }))}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="dataSharing" className="font-medium">
                          Data Sharing with Companies *
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow sharing my profile data with potential employers and recruiters.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="profileVisibility"
                        checked={formData.consent.profileVisibility}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          consent: { ...prev.consent, profileVisibility: checked }
                        }))}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="profileVisibility" className="font-medium">
                          Profile Visibility
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Make my profile visible to registered recruiters and employers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !formData.consent.termsConditions || !formData.consent.dataSharing}
              >
                {isLoading ? "Setting up..." : "Complete Setup"}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
