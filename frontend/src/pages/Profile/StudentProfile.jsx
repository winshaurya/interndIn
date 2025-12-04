import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useShellHeader } from "@/hooks/useShellHeader";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ProfileEditor from "@/components/profile/ProfileEditor";
import ProfileCompletionMeter from "@/components/profile/ProfileCompletionMeter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Calendar, GraduationCap, Code, Briefcase, FileText } from "lucide-react";
import DataState from "@/components/common/DataState";

export default function StudentProfile() {
  const [profileData, setProfileData] = useState(null);
  const { user } = useAuth();

  useShellHeader({
    title: "My Student Profile",
    description: "Manage your academic profile, skills, and job preferences.",
  });

  const {
    data: profileResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => apiClient.getStudentProfile(),
  });

  useEffect(() => {
    if (profileResponse?.data?.profile) {
      setProfileData(profileResponse.data.profile);
    }
  }, [profileResponse]);

  const handleSaveProfile = async (updatedData) => {
    try {
      // Use the API client to update the profile
      await apiClient.updateStudentProfile(updatedData);
      await refetch();
    } catch (error) {
      throw error;
    }
  };

  if (isLoading) {
    return <DataState state="loading" message="Loading your profile..." />;
  }

  if (error) {
    return <DataState state="error" message="Failed to load profile" />;
  }

  if (!profileData) {
    return <DataState state="empty" message="Profile not found" />;
  }

  const completionPercentage = calculateProfileCompletion(profileData);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profileData.name || "Student"}</h1>
              <p className="text-muted-foreground">{profileData.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary">
                  {profileData.academics?.[0]?.branch || "Branch"}
                </Badge>
                <Badge variant="outline">
                  {profileData.academics?.[0]?.year || "Grad Year"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ProfileCompletionMeter completionPercentage={completionPercentage} />
            <ProfileEditor
              profileData={profileData}
              setProfileData={setProfileData}
              onSave={handleSaveProfile}
            />
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{profileData.email}</span>
            </div>
            {profileData.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{profileData.phone}</span>
              </div>
            )}
            {profileData.address && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{profileData.address}</span>
              </div>
            )}
            {profileData.dateOfBirth && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{new Date(profileData.dateOfBirth).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Academic Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Academics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileData.academics?.map((academic, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{academic.degree}</span>
                  <Badge variant="outline" className="text-xs">{academic.year}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{academic.branch}</p>
                <p className="text-xs text-muted-foreground">GPA: {academic.gpa}</p>
                {index < profileData.academics.length - 1 && <Separator />}
              </div>
            )) || (
              <p className="text-sm text-muted-foreground">No academic details added</p>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profileData.skills?.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill.name}
                </Badge>
              )) || (
                <p className="text-sm text-muted-foreground">No skills added</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Experience & Projects */}
      {profileData.experiences?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Experience & Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileData.experiences.map((exp, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{exp.title}</h4>
                  <Badge variant="outline" className="text-xs">{exp.duration}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{exp.company}</p>
                <p className="text-sm">{exp.description}</p>
                {exp.link && (
                  <Button variant="link" className="p-0 h-auto text-sm">
                    View Project
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Resume */}
      {profileData.resume_url && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Resume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <a href={profileData.resume_url} target="_blank" rel="noopener noreferrer">
                View Resume
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function calculateProfileCompletion(profile) {
  let completed = 0;
  let total = 0;

  // Personal info
  total += 4;
  if (profile.name) completed++;
  if (profile.phone) completed++;
  if (profile.dateOfBirth) completed++;
  if (profile.address) completed++;

  // Academics
  total += 2;
  if (profile.academics?.length > 0) completed++;
  if (profile.academics?.[0]?.gpa) completed++;

  // Skills
  total += 1;
  if (profile.skills?.length > 0) completed++;

  // Experience
  total += 1;
  if (profile.experiences?.length > 0) completed++;

  // Resume
  total += 1;
  if (profile.resume_url) completed++;

  // Preferences
  total += 1;
  if (profile.preferences) completed++;

  return Math.round((completed / total) * 100);
}
