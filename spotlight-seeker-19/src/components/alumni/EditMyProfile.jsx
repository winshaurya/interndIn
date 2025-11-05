import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function EditMyProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    email: "john.doe@alumni.sgsits.ac.in",
    phoneNumber: "+91 9876543210",
    dateOfBirth: "1995-08-15",
    graduationYear: "2018",
    currentJobTitle: "Senior Software Engineer",
    companyName: "TechCorp Inc.",
    companyWebsite: "https://techcorp.com",
    companyIndustry: "Information Technology",
    companySize: "201-500 employees",
    companyAbout: "Leading technology solutions provider",
    dataConsent: true,
  });

  const [openSections, setOpenSections] = useState({
    personal: true,
    company: true,
    declaration: true,
  });

  // Calculate profile completion percentage
  const calculateProgress = () => {
    let progress = 0;
    
    // Personal Information (20%)
    const personalFields = [formData.fullName, formData.email, formData.phoneNumber, formData.dateOfBirth, formData.graduationYear];
    const personalCompleted = personalFields.filter(field => field.trim() !== '').length;
    progress += (personalCompleted / personalFields.length) * 20;
    
    // Company Details (25%)
    const companyFields = [formData.currentJobTitle, formData.companyName, formData.companyWebsite, formData.companyIndustry, formData.companySize, formData.companyAbout];
    const companyCompleted = companyFields.filter(field => field.trim() !== '').length;
    progress += (companyCompleted / companyFields.length) * 25;
    
    // Declaration & Consent (10%)
    if (formData.dataConsent) {
      progress += 10;
    }
    
    // Remaining sections (45%) - placeholder for future sections
    progress += 45;
    
    return Math.round(progress);
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const progressPercentage = calculateProgress();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Edit My Profile</h1>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm font-medium text-primary">{progressPercentage}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Personal Information Section */}
      <Card>
        <Collapsible open={openSections.personal} onOpenChange={() => toggleSection('personal')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Personal Information (20%)</CardTitle>
                {openSections.personal ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateFormData('fullName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Read-only)</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    value={formData.graduationYear}
                    onChange={(e) => updateFormData('graduationYear', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Company Details Section */}
      <Card>
        <Collapsible open={openSections.company} onOpenChange={() => toggleSection('company')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Company Details (25%)</CardTitle>
                {openSections.company ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentJobTitle">Current Job Title</Label>
                  <Input
                    id="currentJobTitle"
                    value={formData.currentJobTitle}
                    onChange={(e) => updateFormData('currentJobTitle', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateFormData('companyName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Company Website</Label>
                  <Input
                    id="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={(e) => updateFormData('companyWebsite', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyIndustry">Company Industry</Label>
                  <Select value={formData.companyIndustry} onValueChange={(value) => updateFormData('companyIndustry', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Information Technology">Information Technology</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select value={formData.companySize} onValueChange={(value) => updateFormData('companySize', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10 employees">1-10 employees</SelectItem>
                      <SelectItem value="11-50 employees">11-50 employees</SelectItem>
                      <SelectItem value="51-200 employees">51-200 employees</SelectItem>
                      <SelectItem value="201-500 employees">201-500 employees</SelectItem>
                      <SelectItem value="501-1000 employees">501-1000 employees</SelectItem>
                      <SelectItem value="1000+ employees">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAbout">Company About</Label>
                <Textarea
                  id="companyAbout"
                  value={formData.companyAbout}
                  onChange={(e) => updateFormData('companyAbout', e.target.value)}
                  placeholder="Brief description about your company..."
                  rows={3}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Declaration & Consent Section */}
      <Card>
        <Collapsible open={openSections.declaration} onOpenChange={() => toggleSection('declaration')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Declaration & Consent (10%)</CardTitle>
                {openSections.declaration ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="dataConsent"
                  checked={formData.dataConsent}
                  onCheckedChange={(checked) => updateFormData('dataConsent', checked === true)}
                />
                <Label htmlFor="dataConsent" className="text-sm leading-relaxed">
                  I agree to the data usage terms and code of conduct. I understand that my profile information may be shared with potential employers and used for job matching purposes.
                </Label>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button>
          Save Changes
        </Button>
      </div>
    </div>
  );
}