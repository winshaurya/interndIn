import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  GraduationCap, 
  Code, 
  Briefcase, 
  FileText, 
  Settings, 
  Upload,
  Plus,
  X,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  Trash2,
  Save,
  Eye
} from "lucide-react";

const ProfileEditor = ({ profileData, setProfileData, onSave }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Local state for editing
  const [editData, setEditData] = useState({
    ...profileData,
    academics: profileData.academics || [
      {
        id: 1,
        degree: "B.Tech",
        branch: "Computer Science Engineering",
        year: "2024",
        gpa: "8.5",
        institution: "SGSITS"
      }
    ],
    preferences: profileData.preferences || {
      jobTypes: ["Full-time", "Internship"],
      preferredLocations: ["Indore", "Bangalore"],
      workMode: "hybrid"
    },
    consent: profileData.consent || {
      dataSharing: true,
      marketingEmails: false,
      profileVisibility: true,
      termsConditions: true
    }
  });

  const skillOptions = [
    "React", "Angular", "Vue.js", "Node.js", "Python", "Java", "JavaScript", "TypeScript",
    "C++", "C#", "PHP", "Ruby", "Go", "Rust", "Swift", "Kotlin", "Flutter", "React Native",
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP",
    "Machine Learning", "Data Science", "UI/UX Design", "DevOps", "Cybersecurity"
  ];

  const locationOptions = [
    "Indore", "Bangalore", "Mumbai", "Delhi", "Pune", "Hyderabad", "Chennai", "Kolkata",
    "Ahmedabad", "Jaipur", "Remote", "USA", "Canada", "Europe", "Singapore"
  ];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(editData);
      setProfileData(editData);
      setIsOpen(false);
      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = (skillName) => {
    if (skillName && !editData.skills.find(s => s.name === skillName)) {
      setEditData(prev => ({
        ...prev,
        skills: [...prev.skills, { name: skillName, proficiency: 3, experience: 1 }]
      }));
    }
  };

  const removeSkill = (skillName) => {
    setEditData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.name !== skillName)
    }));
  };

  const updateSkill = (skillName, field, value) => {
    setEditData(prev => ({
      ...prev,
      skills: prev.skills.map(s => 
        s.name === skillName ? { ...s, [field]: value } : s
      )
    }));
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      title: "",
      company: "",
      duration: "",
      description: "",
      link: ""
    };
    setEditData(prev => ({
      ...prev,
      experiences: [...prev.experiences, newExp]
    }));
  };

  const removeExperience = (id) => {
    setEditData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }));
  };

  const updateExperience = (id, field, value) => {
    setEditData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addAcademic = () => {
    const newAcademic = {
      id: Date.now(),
      degree: "",
      branch: "",
      year: "",
      gpa: "",
      institution: ""
    };
    setEditData(prev => ({
      ...prev,
      academics: [...prev.academics, newAcademic]
    }));
  };

  const removeAcademic = (id) => {
    setEditData(prev => ({
      ...prev,
      academics: prev.academics.filter(ac => ac.id !== id)
    }));
  };

  const updateAcademic = (id, field, value) => {
    setEditData(prev => ({
      ...prev,
      academics: prev.academics.map(ac => 
        ac.id === id ? { ...ac, [field]: value } : ac
      )
    }));
  };

  const handleLocationAdd = (location) => {
    if (location && !editData.preferences.preferredLocations.includes(location)) {
      setEditData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          preferredLocations: [...prev.preferences.preferredLocations, location]
        }
      }));
    }
  };

  const handleLocationRemove = (location) => {
    setEditData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        preferredLocations: prev.preferences.preferredLocations.filter(loc => loc !== location)
      }
    }));
  };

  const handleJobTypeToggle = (jobType) => {
    setEditData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        jobTypes: prev.preferences.jobTypes.includes(jobType)
          ? prev.preferences.jobTypes.filter(type => type !== jobType)
          : [...prev.preferences.jobTypes, jobType]
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="personal" className="text-xs">Personal</TabsTrigger>
            <TabsTrigger value="academics" className="text-xs">Academics</TabsTrigger>
            <TabsTrigger value="skills" className="text-xs">Skills</TabsTrigger>
            <TabsTrigger value="experience" className="text-xs">Experience</TabsTrigger>
            <TabsTrigger value="resume" className="text-xs">Resume</TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs">Preferences</TabsTrigger>
            <TabsTrigger value="consent" className="text-xs">Consent</TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Institute Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rollNo">Roll Number</Label>
                    <Input
                      id="rollNo"
                      value={editData.rollNo || ""}
                      onChange={(e) => setEditData(prev => ({ ...prev, rollNo: e.target.value }))}
                      placeholder="Enter your roll number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={editData.dateOfBirth}
                      onChange={(e) => setEditData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={editData.address || ""}
                      onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter your address"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academics */}
          <TabsContent value="academics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Academic Details
                  </div>
                  <Button onClick={addAcademic} size="sm" className="flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    Add Degree
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {editData.academics.map((academic, index) => (
                  <div key={academic.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Degree {index + 1}</h4>
                      {editData.academics.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAcademic(academic.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Select 
                          value={academic.degree} 
                          onValueChange={(value) => updateAcademic(academic.id, 'degree', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select degree" />
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
                        <Label>Branch/Specialization</Label>
                        <Input
                          value={academic.branch}
                          onChange={(e) => updateAcademic(academic.id, 'branch', e.target.value)}
                          placeholder="e.g., Computer Science Engineering"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Year of Graduation</Label>
                        <Input
                          value={academic.year}
                          onChange={(e) => updateAcademic(academic.id, 'year', e.target.value)}
                          placeholder="e.g., 2024"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>GPA/Percentage</Label>
                        <Input
                          value={academic.gpa}
                          onChange={(e) => updateAcademic(academic.id, 'gpa', e.target.value)}
                          placeholder="e.g., 8.5 CGPA or 85%"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Institution</Label>
                        <Input
                          value={academic.institution}
                          onChange={(e) => updateAcademic(academic.id, 'institution', e.target.value)}
                          placeholder="e.g., SGSITS"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills */}
          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Add Skills</Label>
                  <Select onValueChange={addSkill}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillOptions
                        .filter(skill => !editData.skills.find(s => s.name === skill))
                        .map((skill) => (
                          <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {editData.skills.map((skill) => (
                    <div key={skill.name} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{skill.name}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkill(skill.name)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Proficiency Level (1-5)</Label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <Button
                                key={level}
                                variant={skill.proficiency >= level ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateSkill(skill.name, 'proficiency', level)}
                                className="w-8 h-8 p-0"
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                            ))}
                            <span className="text-sm text-muted-foreground ml-2">
                              {skill.proficiency}/5
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Years of Experience</Label>
                          <Input
                            type="number"
                            step="0.5"
                            min="0"
                            value={skill.experience}
                            onChange={(e) => updateSkill(skill.name, 'experience', parseFloat(e.target.value) || 0)}
                            placeholder="1.5"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experience */}
          <TabsContent value="experience">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Experience & Projects
                  </div>
                  <Button onClick={addExperience} size="sm" className="flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    Add Experience
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {editData.experiences.map((experience) => (
                  <div key={experience.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Experience Entry</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(experience.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Position/Role</Label>
                        <Input
                          value={experience.title}
                          onChange={(e) => updateExperience(experience.id, 'title', e.target.value)}
                          placeholder="e.g., Software Development Intern"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Company/Organization</Label>
                        <Input
                          value={experience.company}
                          onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
                          placeholder="e.g., Tech Corp"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Duration</Label>
                        <Input
                          value={experience.duration}
                          onChange={(e) => updateExperience(experience.id, 'duration', e.target.value)}
                          placeholder="e.g., Jun 2023 - Aug 2023"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                          value={experience.description}
                          onChange={(e) => updateExperience(experience.id, 'description', e.target.value)}
                          placeholder="Describe your responsibilities and achievements..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Project/Portfolio Link</Label>
                        <Input
                          value={experience.link}
                          onChange={(e) => updateExperience(experience.id, 'link', e.target.value)}
                          placeholder="https://github.com/username/project"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resume Upload */}
          <TabsContent value="resume">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resume/CV Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Upload your resume</h3>
                    <p className="text-sm text-muted-foreground">
                      Supported formats: PDF, DOC, DOCX (Max size: 5MB)
                    </p>
                  </div>
                  <Button>
                    Choose File
                  </Button>
                </div>
                
                {editData.resumeUploaded && (
                  <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{editData.resumeFileName}</p>
                        <p className="text-sm text-muted-foreground">Uploaded successfully</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Job Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Job Types */}
                <div className="space-y-3">
                  <Label>Job Types (Select multiple)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Full-time", "Part-time", "Internship", "Contract", "Freelance", "Remote"].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={editData.preferences.jobTypes.includes(type)}
                          onCheckedChange={() => handleJobTypeToggle(type)}
                        />
                        <Label htmlFor={type} className="text-sm">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Work Mode */}
                <div className="space-y-3">
                  <Label>Work Mode Preference</Label>
                  <RadioGroup 
                    value={editData.preferences.workMode} 
                    onValueChange={(value) => setEditData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, workMode: value }
                    }))}
                    className="flex flex-wrap gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="remote" id="remote" />
                      <Label htmlFor="remote">Remote</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="onsite" id="onsite" />
                      <Label htmlFor="onsite">On-site</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hybrid" id="hybrid" />
                      <Label htmlFor="hybrid">Hybrid</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Preferred Locations */}
                <div className="space-y-3">
                  <Label>Preferred Locations</Label>
                  <Select onValueChange={handleLocationAdd}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add a preferred location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions
                        .filter(location => !editData.preferences.preferredLocations.includes(location))
                        .map((location) => (
                          <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2">
                    {editData.preferences.preferredLocations.map((location) => (
                      <Badge key={location} variant="secondary" className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {location}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleLocationRemove(location)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consent */}
          <TabsContent value="consent">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Consent & Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="terms"
                      checked={editData.consent.termsConditions}
                      onCheckedChange={(checked) => setEditData(prev => ({
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
                      checked={editData.consent.dataSharing}
                      onCheckedChange={(checked) => setEditData(prev => ({
                        ...prev,
                        consent: { ...prev.consent, dataSharing: checked }
                      }))}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="dataSharing" className="font-medium">
                        Data Sharing with Companies
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow sharing my profile data with potential employers and recruiters.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="profileVisibility"
                      checked={editData.consent.profileVisibility}
                      onCheckedChange={(checked) => setEditData(prev => ({
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

                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="marketingEmails"
                      checked={editData.consent.marketingEmails}
                      onCheckedChange={(checked) => setEditData(prev => ({
                        ...prev,
                        consent: { ...prev.consent, marketingEmails: checked }
                      }))}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="marketingEmails" className="font-medium">
                        Marketing Communications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive job alerts, placement updates, and promotional emails.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    * Required fields. You can update these preferences anytime in your account settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditor;