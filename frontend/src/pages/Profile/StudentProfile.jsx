import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import ProfileCompletionMeter from "@/components/profile/ProfileCompletionMeter";
import ProfileEditor from "@/components/profile/ProfileEditor";
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
  Star,
  Loader2
} from "lucide-react";

const StudentProfile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const outletContext = useOutletContext();

  useEffect(() => {
    outletContext?.setHeaderMeta?.({
      title: "Profile",
      description: "Keep your academic and professional details updated.",
    });
  }, [outletContext]);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => apiClient.getStudentProfile(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => apiClient.updateStudentProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['student-profile']);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const profile = profileData?.data?.profile;

  const [profileDataState, setProfileDataState] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    studentId: "",
    branch: "",
    currentYear: "",
    gradYear: "",
    skills: [],
    resumeUrl: "",
    cgpa: "",
    achievements: "",
    experiences: [],
    desiredRoles: [],
    preferredLocations: [],
    workMode: "",
  });

  // Update state when profile loads
  useEffect(() => {
    if (profile) {
      setProfileDataState({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        dateOfBirth: profile.dateOfBirth || "",
        studentId: profile.student_id || "",
        branch: profile.branch || "",
        currentYear: profile.currentYear || "",
        gradYear: profile.grad_year || "",
        skills: profile.skills ? (Array.isArray(profile.skills) ? profile.skills : profile.skills.split(", ")) : [],
        resumeUrl: profile.resume_url || "",
        cgpa: profile.cgpa || "",
        achievements: profile.achievements || "",
        experiences: profile.experiences || [],
        desiredRoles: profile.desiredRoles || [],
        preferredLocations: profile.preferredLocations || [],
        workMode: profile.workMode || "",
      });
    }
  }, [profile]);

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, DOC, DOCX, or TXT file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const response = await apiClient.uploadResume(file);
      
      // Update local state with new resume URL
      setProfileDataState(prev => ({
        ...prev,
        resumeUrl: response.resumeUrl,
      }));

      // Refresh profile data
      queryClient.invalidateQueries(['student-profile']);

      toast({
        title: "Resume Uploaded",
        description: "Your resume has been uploaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload resume",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const profileSections = [
    { id: "personal", completed: !!(profile?.name && profile?.email && profile?.phone), weight: 20 },
    { id: "academic", completed: !!(profile?.branch && profile?.currentYear), weight: 20 },
    { id: "skills", completed: profile?.skills?.length >= 1, weight: 20 },
    { id: "experience", completed: profile?.experiences?.length >= 1, weight: 20 },
    { id: "resume", completed: profile?.resumeUploaded, weight: 10 },
    { id: "preferences", completed: profile?.desiredRoles?.length > 0, weight: 10 },
  ];

  const completionPercentage = profileSections.reduce(
    (total, section) => total + (section.completed ? section.weight : 0),
    0
  );

  const branches = [
    "Computer Science Engineering",
    "Electronics & Communication Engineering", 
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Information Technology"
  ];

  const skillOptions = [
    "React", "Angular", "Vue.js", "Node.js", "Python", "Java", "JavaScript", "TypeScript",
    "C++", "C#", "PHP", "Ruby", "Go", "Rust", "Swift", "Kotlin", "Flutter", "React Native",
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP"
  ];

  const handleSave = () => {
    updateProfileMutation.mutate(profileDataState);
  };

  const addSkill = (skillName) => {
    if (!profileDataState.skills?.find(s => s === skillName)) {
      setProfileDataState(prev => ({ ...prev, skills: [...(prev.skills || []), skillName] }));
    }
  };

  const removeSkill = (skillName) => {
    setProfileDataState(prev => ({ ...prev, skills: (prev.skills || []).filter(s => s !== skillName) }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Student Profile</h1>
              <p className="text-muted-foreground">Complete your profile to unlock job application opportunities</p>
            </div>
          </div>
          <ProfileEditor profileData={profileDataState} setProfileData={setProfileDataState} onSave={handleSave} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Completion Sidebar */}
          <div className="lg:col-span-1">
            <ProfileCompletionMeter sections={profileSections} completionPercentage={completionPercentage} />
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="personal" className="flex items-center gap-1"><User className="w-4 h-4" /><span className="hidden sm:inline">Personal</span></TabsTrigger>
                <TabsTrigger value="academic" className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /><span className="hidden sm:inline">Academic</span></TabsTrigger>
                <TabsTrigger value="skills" className="flex items-center gap-1"><Code className="w-4 h-4" /><span className="hidden sm:inline">Skills</span></TabsTrigger>
                <TabsTrigger value="experience" className="flex items-center gap-1"><Briefcase className="w-4 h-4" /><span className="hidden sm:inline">Experience</span></TabsTrigger>
                <TabsTrigger value="resume" className="flex items-center gap-1"><FileText className="w-4 h-4" /><span className="hidden sm:inline">Resume</span></TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-1"><Settings className="w-4 h-4" /><span className="hidden sm:inline">Preferences</span></TabsTrigger>
              </TabsList>

              {/* Personal */}
              <TabsContent value="personal">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5"/> Personal Information</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={profileDataState.name} onChange={e => setProfileDataState(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter your full name"/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Institute Email</Label>
                        <Input id="email" type="email" value={profileDataState.email} onChange={e => setProfileDataState(prev => ({ ...prev, email: e.target.value }))} placeholder="Enter your email"/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" value={profileDataState.phone} onChange={e => setProfileDataState(prev => ({ ...prev, phone: e.target.value }))} placeholder="Enter your phone number"/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input id="dob" type="date" value={profileDataState.dateOfBirth} onChange={e => setProfileDataState(prev => ({ ...prev, dateOfBirth: e.target.value }))}/>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Academic */}
              <TabsContent value="academic">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5"/> Academic Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Select value={profileDataState.branch} onValueChange={value => setProfileDataState(prev => ({ ...prev, branch: value }))}>
                          <SelectTrigger><SelectValue placeholder="Select branch"/></SelectTrigger>
                          <SelectContent>{branches.map(branch => <SelectItem key={branch} value={branch}>{branch}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Current Year</Label>
                        <Select value={profileDataState.currentYear} onValueChange={value => setProfileDataState(prev => ({ ...prev, currentYear: value }))}>
                          <SelectTrigger><SelectValue placeholder="Select year"/></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="First Year">First Year</SelectItem>
                            <SelectItem value="Second Year">Second Year</SelectItem>
                            <SelectItem value="Third Year">Third Year</SelectItem>
                            <SelectItem value="Final Year">Final Year</SelectItem>
                            <SelectItem value="Recent Graduate">Recent Graduate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>CGPA</Label>
                        <Input type="number" step="0.1" min="0" max="10" value={profileDataState.cgpa} onChange={e => setProfileDataState(prev => ({ ...prev, cgpa: e.target.value }))} placeholder="Enter CGPA"/>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Achievements</Label>
                      <Textarea value={profileDataState.achievements} onChange={e => setProfileDataState(prev => ({ ...prev, achievements: e.target.value }))} placeholder="Awards, recognitions, certifications..." rows={3}/>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Skills */}
              <TabsContent value="skills">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Code className="w-5 h-5"/> Skills & Expertise</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Add Skills</Label>
                      <Select onValueChange={addSkill}>
                        <SelectTrigger><SelectValue placeholder="Select a skill to add"/></SelectTrigger>
                        <SelectContent>{skillOptions.filter(skill => !profileDataState.skills?.find(s => s === skill)).map(skill => <SelectItem key={skill} value={skill}>{skill}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      {profileDataState.skills?.map(skill => (
                        <div key={skill} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{skill}</Badge>
                            <Button variant="ghost" size="sm" onClick={() => removeSkill(skill)}><X className="w-4 h-4"/></Button>
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
                  <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5"/> Experience & Projects</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {profileDataState.experiences?.map((exp,index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Position/Role</Label><Input value={exp.title} onChange={e => {
                            const newExp = [...profileDataState.experiences]; newExp[index].title = e.target.value; setProfileDataState(prev=>({...prev,experiences:newExp}));
                          }}/></div>
                          <div className="space-y-2"><Label>Company</Label><Input value={exp.company} onChange={e => {
                            const newExp = [...profileDataState.experiences]; newExp[index].company = e.target.value; setProfileDataState(prev=>({...prev,experiences:newExp}));
                          }}/></div>
                          <div className="space-y-2"><Label>Duration</Label><Input value={exp.duration} onChange={e => {
                            const newExp = [...profileDataState.experiences]; newExp[index].duration = e.target.value; setProfileDataState(prev=>({...prev,experiences:newExp}));
                          }}/></div>
                          <div className="space-y-2"><Label>Project Link</Label><Input value={exp.link} onChange={e => {
                            const newExp = [...profileDataState.experiences]; newExp[index].link = e.target.value; setProfileDataState(prev=>({...prev,experiences:newExp}));
                          }}/></div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea value={exp.description} onChange={e=>{
                            const newExp = [...profileDataState.experiences]; newExp[index].description=e.target.value; setProfileDataState(prev=>({...prev,experiences:newExp}));
                          }} rows={3}/>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={()=>{
                      setProfileDataState(prev=>({...prev,experiences:[...(prev.experiences || []),{title:"",company:"",duration:"",link:"",description:""}]}));
                    }}><Plus className="w-4 h-4 mr-2"/> Add Experience</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Resume */}
              <TabsContent value="resume">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5"/> Resume/CV</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {!profileDataState.resumeUrl ? (
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                        <h3 className="font-medium mb-2">Upload your resume</h3>
                        <Button 
                          variant="outline" 
                          onClick={handleFileSelect}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          {isUploading ? "Uploading..." : "Choose File"}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-primary"/>
                          <div>
                            <p className="font-medium">Resume Uploaded</p>
                            <p className="text-sm text-muted-foreground">
                              <a 
                                href={profileDataState.resumeUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                View Resume
                              </a>
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={handleFileSelect}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          {isUploading ? "Uploading..." : "Replace"}
                        </Button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences */}
              <TabsContent value="preferences">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5"/> Job Preferences & Consent</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Desired Roles</Label>
                      <Input placeholder="Enter roles separated by commas" value={profileDataState.desiredRoles.join(', ')} onChange={e=>{
                        setProfileDataState(prev=>({...prev,desiredRoles:e.target.value.split(',').map(r=>r.trim())}));
                      }}/>
                    </div>
                    <div className="space-y-2">
                      <Label>Preferred Locations</Label>
                      <Input placeholder="Enter locations separated by commas" value={profileDataState.preferredLocations.join(', ')} onChange={e=>{
                        setProfileDataState(prev=>({...prev,preferredLocations:e.target.value.split(',').map(l=>l.trim())}));
                      }}/>
                    </div>
                    <div className="space-y-2">
                      <Label>Work Mode</Label>
                      <Select value={profileDataState.workMode} onValueChange={value=>setProfileDataState(prev=>({...prev,workMode:value}))}>
                        <SelectTrigger className="w-48"><SelectValue/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="onsite">On-site</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end mt-4">
              <Button variant="gradient" size="lg" onClick={handleSave} disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
