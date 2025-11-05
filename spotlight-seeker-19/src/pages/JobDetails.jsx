import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Calendar, Building, Users, BookOpen, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

const mockJobDetails = {
  id: "1",
  title: "Frontend Developer",
  company: "TechCorp Solutions",
  companyLogo: "/placeholder.svg",
  location: "Remote",
  type: "Full-time",
  stipend: "₹8-12 LPA",
  experience: "0-2 years",
  posted: "2 days ago",
  applyBy: "2024-01-15",
  applicants: 45,
  skills: ["React", "TypeScript", "Tailwind CSS", "JavaScript", "Git"],
  description: `We are looking for a passionate Frontend Developer to join our dynamic team. You will be responsible for building user-facing features and ensuring excellent user experience across our web applications.

This is a great opportunity for recent graduates or junior developers to grow their skills in a supportive environment with mentorship from senior developers.`,
  responsibilities: [
    "Develop and maintain user interfaces using React and TypeScript",
    "Collaborate with designers to implement pixel-perfect designs",
    "Write clean, maintainable, and well-documented code",
    "Optimize applications for maximum speed and scalability",
    "Participate in code reviews and team meetings",
    "Stay updated with latest frontend technologies and best practices"
  ],
  requirements: [
    "Bachelor's degree in Computer Science, IT, or related field",
    "Strong knowledge of HTML, CSS, and JavaScript",
    "Experience with React.js and modern frontend frameworks",
    "Familiarity with version control systems (Git)",
    "Understanding of responsive web design principles",
    "Good problem-solving and communication skills"
  ],
  eligibility: [
    "CGPA of 7.0 or above",
    "No active backlogs",
    "Eligible branches: CSE, IT, ECE",
    "Graduating in 2024 or 2025"
  ],
  companyInfo: {
    name: "TechCorp Solutions",
    founded: "2018",
    size: "50-100 employees",
    industry: "Software Development",
    website: "www.techcorp.com",
    description: "TechCorp Solutions is a leading software development company specializing in web and mobile applications. We work with startups and enterprises to build scalable, user-friendly digital solutions."
  },
  benefits: [
    "Competitive salary and performance bonuses",
    "Health insurance coverage",
    "Flexible working hours",
    "Learning and development opportunities",
    "Modern office environment"
  ]
};

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("description");
  
  // Mock profile completion check
  const profileComplete = false;

  const handleApply = () => {
    if (!profileComplete) {
      // Navigate to dashboard with profile completion prompt
      alert("Redirecting to complete your profile...");
      navigate("/?complete-profile=true");
      return;
    }
    // Handle application logic
    alert("Application submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4">
        <div className="max-w-7xl mx-auto px-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{mockJobDetails.title}</h1>
                      <p className="text-lg text-muted-foreground">{mockJobDetails.company}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={
                      mockJobDetails.type === "Full-time" ? "bg-orange-100 text-orange-800 border-orange-200" :
                      mockJobDetails.type === "Internship" ? "bg-blue-100 text-blue-800 border-blue-200" :
                      "bg-green-100 text-green-800 border-green-200"
                    }
                  >
                    {mockJobDetails.type}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{mockJobDetails.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{mockJobDetails.experience}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Apply by {mockJobDetails.applyBy}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{mockJobDetails.applicants} applicants</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {mockJobDetails.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="text-lg font-semibold text-primary">
                  {mockJobDetails.stipend}
                </div>
              </CardContent>
            </Card>

            {/* Tabbed Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-line">{mockJobDetails.description}</p>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div>
                      <h3 className="font-semibold mb-3">Benefits</h3>
                      <ul className="space-y-2">
                        {mockJobDetails.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="responsibilities" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {mockJobDetails.responsibilities.map((responsibility, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requirements" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {mockJobDetails.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="eligibility" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Eligibility Criteria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {mockJobDetails.eligibility.map((criteria, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <BookOpen className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="company" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {mockJobDetails.companyInfo.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <span className="text-sm text-muted-foreground">Founded</span>
                        <p className="font-medium">{mockJobDetails.companyInfo.founded}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Company Size</span>
                        <p className="font-medium">{mockJobDetails.companyInfo.size}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Industry</span>
                        <p className="font-medium">{mockJobDetails.companyInfo.industry}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Website</span>
                        <p className="font-medium text-primary">{mockJobDetails.companyInfo.website}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{mockJobDetails.companyInfo.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card>
              <CardContent className="p-6">
                {!profileComplete && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Complete your profile to apply for this job.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  onClick={handleApply}
                  className="w-full mb-4"
                  disabled={!profileComplete}
                >
                  {profileComplete ? "Apply Now" : "Complete Profile to Apply"}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  Posted {mockJobDetails.posted}
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Job Type</span>
                    <p className="font-medium">{mockJobDetails.type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Experience Level</span>
                    <p className="font-medium">{mockJobDetails.experience}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Location</span>
                    <p className="font-medium">{mockJobDetails.location}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Application Deadline</span>
                    <p className="font-medium">{mockJobDetails.applyBy}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "React Developer", company: "StartupHub", type: "Internship" },
                    { title: "Full Stack Developer", company: "WebCorp", type: "Full-time" },
                    { title: "UI Developer", company: "DesignTech", type: "Contract" }
                  ].map((job, index) => (
                    <div key={index} className="border rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors">
                      <h4 className="font-medium text-sm">{job.title}</h4>
                      <p className="text-xs text-muted-foreground">{job.company}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {job.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}