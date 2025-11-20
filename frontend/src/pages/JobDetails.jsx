import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Clock, Calendar, Building, Users, BookOpen, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("description");
  const [isApplying, setIsApplying] = useState(false);

  const { data: jobData, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => apiClient.getJobById(id),
    enabled: !!id,
  });

  const job = jobData?.data;

  const handleApply = async () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (user.role !== 'student') {
      toast({
        title: "Access Denied",
        description: "Only students can apply for jobs",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);
    try {
      await apiClient.applyForJob({ job_id: id });
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully!",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || "Job not found"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

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
                      <h1 className="text-2xl font-bold">{job.job_title}</h1>
                      <p className="text-lg text-muted-foreground">{job.company_name}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                    Full-time
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{job.company_name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Posted by {job.alumni_name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{job.alumni_designation}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {/* Skills would go here if available */}
                </div>
              </CardContent>
            </Card>

            {/* Tabbed Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {job.job_description}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="company" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {job.company_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Company Details</h4>
                      <p className="text-muted-foreground">{job.company_about || 'No description available'}</p>
                    </div>
                    {job.company_website && (
                      <div>
                        <h4 className="font-semibold mb-2">Website</h4>
                        <a href={job.company_website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {job.company_website}
                        </a>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold mb-2">Posted by</h4>
                      <p className="text-muted-foreground">
                        {job.alumni_name} - {job.alumni_designation} (Class of {job.alumni_grad_year})
                      </p>
                    </div>
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
                <Button
                  onClick={handleApply}
                  className="w-full mb-4"
                  disabled={isApplying}
                >
                  {isApplying ? "Applying..." : "Apply Now"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Posted {new Date(job.created_at).toLocaleDateString()}
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
                    <p className="font-medium">Full-time</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Company</span>
                    <p className="font-medium">{job.company_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Posted by</span>
                    <p className="font-medium">{job.alumni_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Posted Date</span>
                    <p className="font-medium">{new Date(job.created_at).toLocaleDateString()}</p>
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