import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Building2,
  GraduationCap,
  Code,
  Briefcase,
  MapPin,
  Calendar,
  Users,
  MessageSquare,
  UserPlus,
  ExternalLink,
  Github,
  Linkedin,
  Globe
} from "lucide-react";
import DataState from "@/components/common/DataState";

export default function PublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  // Determine if viewing student or alumni profile
  const isStudentProfile = window.location.pathname.includes('/student/');
  const profileType = isStudentProfile ? 'student' : 'alumni';

  const { data: profileResponse, isLoading, error } = useQuery({
    queryKey: [`${profileType}-public-profile`, userId],
    queryFn: () => isStudentProfile
      ? apiClient.getStudentPublicProfile(userId)
      : apiClient.getAlumniPublicProfile(userId),
    enabled: !!userId,
  });

  const profile = profileResponse?.profile;

  const handleConnect = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (currentUser.id === userId) {
      toast({
        title: "Cannot connect",
        description: "You cannot connect with yourself.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      await apiClient.sendConnectionRequest(userId);
      toast({
        title: "Connection request sent",
        description: "Your connection request has been sent successfully.",
      });
      // Refresh the profile data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Failed to send request",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMessage = () => {
    navigate(`/${currentUser.role}/messages`);
  };

  if (isLoading) {
    return <DataState state="loading" message="Loading profile..." />;
  }

  if (error || !profile) {
    return (
      <DataState
        state="error"
        message={error?.message || "Profile not found"}
      />
    );
  }

  const renderStudentProfile = () => (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">
                  {profile.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground">
                  {profile.branch} • Class of {profile.grad_year}
                </p>
                {profile.academic && profile.academic[0] && (
                  <p className="text-sm text-muted-foreground">
                    CGPA: {profile.academic[0].gpa || 'N/A'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              {profile.isConnected ? (
                <Button onClick={handleMessage} className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Message</span>
                </Button>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{isConnecting ? "Connecting..." : "Connect"}</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academics */}
      {profile.academic && profile.academic.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <span>Academics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.academic.map((academic, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{academic.degree || 'Degree'}</span>
                  <Badge variant="secondary">{academic.year || 'Year'}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {academic.institution || 'Institution'}
                </p>
                {academic.gpa && (
                  <p className="text-sm">CGPA: {academic.gpa}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span>Skills</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experience */}
      {profile.experiences && profile.experiences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>Experience</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.experiences.map((exp, index) => (
                <div key={index} className="border-l-2 border-muted pl-4">
                  <h4 className="font-medium">{exp.title || 'Position'}</h4>
                  <p className="text-sm text-muted-foreground">{exp.company || 'Company'}</p>
                  <p className="text-sm">{exp.duration || 'Duration'}</p>
                  {exp.description && (
                    <p className="text-sm mt-2">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAlumniProfile = () => (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">
                  {profile.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground">
                  {profile.current_title} • Class of {profile.grad_year}
                </p>
                {profile.company && (
                  <p className="text-sm text-muted-foreground">
                    {profile.company.name}
                  </p>
                )}
                {profile.experience_years && (
                  <p className="text-sm text-muted-foreground">
                    {profile.experience_years} years of experience
                  </p>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              {profile.isConnected ? (
                <Button onClick={handleMessage} className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Message</span>
                </Button>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{isConnecting ? "Connecting..." : "Connect"}</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company */}
      {profile.company && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Company</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-medium">{profile.company.name}</h3>
              {profile.company.industry && (
                <p className="text-sm text-muted-foreground">{profile.company.industry}</p>
              )}
              {profile.company.company_size && (
                <p className="text-sm text-muted-foreground">{profile.company.company_size} employees</p>
              )}
              {profile.company.website && (
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a href={profile.company.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-1" />
                    Website
                  </a>
                </Button>
              )}
              {profile.company.about && (
                <p className="text-sm mt-2">{profile.company.about}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span>Skills</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bio */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle>Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            {profile.linkedin_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </a>
              </Button>
            )}
            {profile.github_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </Button>
            )}
            {profile.portfolio_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Portfolio
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {isStudentProfile ? renderStudentProfile() : renderAlumniProfile()}
    </div>
  );
}