import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
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
  Star
} from "lucide-react";

const StudentProfile = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    branch: "",
    currentYear: "",
    cgpa: "",
    achievements: "",
    skills: [],
    experiences: [],
    resumeUploaded: false,
    resumeFileName: "",
    desiredRoles: [],
    preferredLocations: [],
    workMode: "hybrid",
    dataConsent: false,
    codeOfConduct: false,
    contactPermissions: false,
  });

  const profileSections = [
    { id: "personal", completed: !!(profileData.name && profileData.email && profileData.phone), weight: 20 },
    { id: "academic", completed: !!(profileData.branch && profileData.currentYear), weight: 20 },
    { id: "skills", completed: profileData.skills.length >= 1, weight: 20 },
    { id: "experience", completed: profileData.experiences.length >= 1, weight: 20 },
    { id: "resume", completed: profileData.resumeUploaded, weight: 10 },
    { id: "preferences", completed: profileData.desiredRoles.length > 0, weight: 10 },
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
    setIsLoading(true);
    setTimeout(() => {
      toast({ title: "Profile updated!", description: "Your profile has been saved successfully." });
      setIsLoading(false);
    }, 1000);
  };

  const addSkill = (skillName) => {
    if (!profileData.skills.find(s => s.name === skillName)) {
      setProfileData(prev => ({ ...prev, skills: [...prev.skills, { name: skillName, proficiency: 3, experience: 1 }] }));
    }
  };

  const removeSkill = (skillName) => {
    setProfileData(prev => ({ ...prev, skills: prev.skills.filter(s => s.name !== skillName) }));
  };

  const updateSkill = (skillName, field, value) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.name === skillName ? { ...s, [field]: value } : s)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-6xl mx-auto space-y-6">
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
          <ProfileEditor profileData={profileData} setProfileData={setProfileData} onSave={handleSave} />
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
                        <Input id="name" value={profileData.name} onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter your full name"/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Institute Email</Label>
                        <Input id="email" type="email" value={profileData.email} onChange={e => setProfileData(prev => ({ ...prev, email: e.target.value }))} placeholder="Enter your email"/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" value={profileData.phone} onChange={e => setProfileData(prev => ({ ...prev, phone: e.target.value }))} placeholder="Enter your phone number"/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input id="dob" type="date" value={profileData.dateOfBirth} onChange={e => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}/>
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
                        <Select value={profileData.branch} onValueChange={value => setProfileData(prev => ({ ...prev, branch: value }))}>
                          <SelectTrigger><SelectValue placeholder="Select branch"/></SelectTrigger>
                          <SelectContent>{branches.map(branch => <SelectItem key={branch} value={branch}>{branch}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Current Year</Label>
                        <Select value={profileData.currentYear} onValueChange={value => setProfileData(prev => ({ ...prev, currentYear: value }))}>
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
                        <Input type="number" step="0.1" min="0" max="10" value={profileData.cgpa} onChange={e => setProfileData(prev => ({ ...prev, cgpa: e.target.value }))} placeholder="Enter CGPA"/>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Achievements</Label>
                      <Textarea value={profileData.achievements} onChange={e => setProfileData(prev => ({ ...prev, achievements: e.target.value }))} placeholder="Awards, recognitions, certifications..." rows={3}/>
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
                        <SelectContent>{skillOptions.filter(skill => !profileData.skills.find(s => s.name === skill)).map(skill => <SelectItem key={skill} value={skill}>{skill}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      {profileData.skills.map(skill => (
                        <div key={skill.name} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{skill.name}</Badge>
                            <Button variant="ghost" size="sm" onClick={() => removeSkill(skill.name)}><X className="w-4 h-4"/></Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Proficiency (1-5)</Label>
                              <div className="flex items-center gap-2">
                                {[1,2,3,4,5].map(level => (
                                  <Button key={level} variant={skill.proficiency >= level ? "default":"outline"} size="sm" className="w-8 h-8 p-0" onClick={() => updateSkill(skill.name,'proficiency',level)}><Star className="w-4 h-4"/></Button>
                                ))}
                                <span className="text-sm text-muted-foreground ml-2">{skill.proficiency}/5</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Years of Experience</Label>
                              <Input type="number" step="0.5" min="0" value={skill.experience} onChange={e => updateSkill(skill.name,'experience',parseFloat(e.target.value) || 0)} placeholder="1.5"/>
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
                  <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5"/> Experience & Projects</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {profileData.experiences.map((exp,index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Position/Role</Label><Input value={exp.title} onChange={e => {
                            const newExp = [...profileData.experiences]; newExp[index].title = e.target.value; setProfileData(prev=>({...prev,experiences:newExp}));
                          }}/></div>
                          <div className="space-y-2"><Label>Company</Label><Input value={exp.company} onChange={e => {
                            const newExp = [...profileData.experiences]; newExp[index].company = e.target.value; setProfileData(prev=>({...prev,experiences:newExp}));
                          }}/></div>
                          <div className="space-y-2"><Label>Duration</Label><Input value={exp.duration} onChange={e => {
                            const newExp = [...profileData.experiences]; newExp[index].duration = e.target.value; setProfileData(prev=>({...prev,experiences:newExp}));
                          }}/></div>
                          <div className="space-y-2"><Label>Link</Label><Input value={exp.link} onChange={e => {
                            const newExp = [...profileData.experiences]; newExp[index].link = e.target.value; setProfileData(prev=>({...prev,experiences:newExp}));
                          }}/></div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea value={exp.description} onChange={e=>{
                            const newExp = [...profileData.experiences]; newExp[index].description=e.target.value; setProfileData(prev=>({...prev,experiences:newExp}));
                          }} rows={3}/>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={()=>{
                      setProfileData(prev=>({...prev,experiences:[...prev.experiences,{title:"",company:"",duration:"",link:"",description:""}]}));
                    }}><Plus className="w-4 h-4 mr-2"/> Add Experience</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Resume */}
              <TabsContent value="resume">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5"/> Resume/CV</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {!profileData.resumeUploaded ? (
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                        <h3 className="font-medium mb-2">Upload your resume</h3>
                        <Button variant="outline"><Upload className="w-4 h-4 mr-2"/> Choose File</Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-primary"/>
                          <div><p className="font-medium">{profileData.resumeFileName}</p><p className="text-sm text-muted-foreground">Uploaded successfully</p></div>
                        </div>
                        <Button variant="outline"><Upload className="w-4 h-4 mr-2"/> Replace</Button>
                      </div>
                    )}
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
                      <Input placeholder="Enter roles separated by commas" value={profileData.desiredRoles.join(', ')} onChange={e=>{
                        setProfileData(prev=>({...prev,desiredRoles:e.target.value.split(',').map(r=>r.trim())}));
                      }}/>
                    </div>
                    <div className="space-y-2">
                      <Label>Preferred Locations</Label>
                      <Input placeholder="Enter locations separated by commas" value={profileData.preferredLocations.join(', ')} onChange={e=>{
                        setProfileData(prev=>({...prev,preferredLocations:e.target.value.split(',').map(l=>l.trim())}));
                      }}/>
                    </div>
                    <div className="space-y-2">
                      <Label>Work Mode</Label>
                      <Select value={profileData.workMode} onValueChange={value=>setProfileData(prev=>({...prev,workMode:value}))}>
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
              <Button variant="gradient" size="lg" onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
