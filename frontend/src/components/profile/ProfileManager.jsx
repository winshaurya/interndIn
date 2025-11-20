// Profile Manager Component - Industry Standard Profile Management
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Upload, X, Save, Edit } from "lucide-react";

const ProfileManager = ({ readOnly = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bio: "",
    skills: [],
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    // Student specific
    student_id: "",
    branch: "",
    grad_year: "",
    resume_url: "",
    // Alumni specific
    current_title: "",
    company_name: "",
    experience_years: "",
    company_website: ""
  });

  const [newSkill, setNewSkill] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.request('/profile');
      if (response.success) {
        setProfile(response.data);
        // Initialize form data
        const profileData = response.data.profile || {};
        setFormData({
          name: response.data.name || "",
          phone: profileData.phone || "",
          bio: profileData.bio || "",
          skills: profileData.skills || [],
          linkedin_url: profileData.linkedin_url || "",
          github_url: profileData.github_url || "",
          portfolio_url: profileData.portfolio_url || "",
          // Student specific
          student_id: profileData.student_id || "",
          branch: profileData.branch || "",
          grad_year: profileData.grad_year || "",
          resume_url: profileData.resume_url || "",
          // Alumni specific
          current_title: profileData.current_title || "",
          company_name: profileData.company_name || "",
          experience_years: profileData.experience_years || "",
          company_website: profileData.company_website || ""
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast({
        title: "Failed to load profile",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a JPEG, PNG, or WebP image",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const uploadProfilePicture = async () => {
    if (!profilePictureFile) return;

    const formDataUpload = new FormData();
    formDataUpload.append('picture', profilePictureFile);

    try {
      const response = await fetch('/api/profile/picture', {
        method: 'POST',
        body: formDataUpload,
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been uploaded successfully",
        });
        setProfilePictureFile(null);
        setProfilePicturePreview(null);
        loadProfile(); // Reload profile to get updated picture URL
        return true;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Profile picture upload failed:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Upload profile picture first if changed
      if (profilePictureFile) {
        const uploadSuccess = await uploadProfilePicture();
        if (!uploadSuccess) {
          setIsSaving(false);
          return;
        }
      }

      // Prepare profile data based on role
      const profileData = user.role === "student" ? {
        name: formData.name,
        phone: formData.phone,
        student_id: formData.student_id,
        branch: formData.branch,
        grad_year: parseInt(formData.grad_year) || null,
        bio: formData.bio,
        skills: formData.skills,
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url,
        portfolio_url: formData.portfolio_url,
        resume_url: formData.resume_url
      } : {
        name: formData.name,
        phone: formData.phone,
        current_title: formData.current_title,
        company_name: formData.company_name,
        grad_year: parseInt(formData.grad_year) || null,
        bio: formData.bio,
        skills: formData.skills,
        experience_years: parseInt(formData.experience_years) || null,
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url,
        portfolio_url: formData.portfolio_url,
        company_website: formData.company_website
      };

      // Remove empty values
      Object.keys(profileData).forEach(key => {
        if (profileData[key] === "" || profileData[key] === null) {
          delete profileData[key];
        }
      });

      const endpoint = user.role === "student" ? '/profile/student' : '/profile/alumni';
      const response = await apiClient.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      if (response.success) {
        toast({
          title: "Profile updated",
          description: "Your profile has been saved successfully",
        });
        setIsEditing(false);
        loadProfile(); // Reload to get updated data
      } else {
        throw new Error(response.error || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile save failed:', error);

      const errorMessage = error.details?.[0]?.message ||
                          error.message ||
                          "Failed to save profile";

      toast({
        title: "Save failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (profile) {
      const profileData = profile.profile || {};
      setFormData({
        name: profile.name || "",
        phone: profileData.phone || "",
        bio: profileData.bio || "",
        skills: profileData.skills || [],
        linkedin_url: profileData.linkedin_url || "",
        github_url: profileData.github_url || "",
        portfolio_url: profileData.portfolio_url || "",
        // Student specific
        student_id: profileData.student_id || "",
        branch: profileData.branch || "",
        grad_year: profileData.grad_year || "",
        resume_url: profileData.resume_url || "",
        // Alumni specific
        current_title: profileData.current_title || "",
        company_name: profileData.company_name || "",
        experience_years: profileData.experience_years || "",
        company_website: profileData.company_website || ""
      });
    }
    setIsEditing(false);
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={profilePicturePreview || profile.profile_picture_url}
                  alt={profile.name}
                />
                <AvatarFallback className="text-lg">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90">
                  <Upload className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{profile.name || 'Complete your profile'}</CardTitle>
              <CardDescription>
                {user.role === 'student' ? 'Student' : 'Alumni'} • {profile.email}
              </CardDescription>
              {profile.profile?.current_title && (
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.profile.current_title}
                  {profile.profile.company_name && ` at ${profile.profile.company_name}`}
                </p>
              )}
            </div>
            {!readOnly && (
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            {isEditing ? 'Update your profile information' : 'Your profile details'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted rounded-md">{profile.name || 'Not provided'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+91 9876543210"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted rounded-md">{profile.profile?.phone || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            {isEditing ? (
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            ) : (
              <p className="text-sm py-2 px-3 bg-muted rounded-md whitespace-pre-wrap">
                {profile.profile?.bio || 'No bio provided'}
              </p>
            )}
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Skills</Label>
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  />
                  <Button type="button" onClick={handleAddSkill} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{skill}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => handleRemoveSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.profile?.skills?.length > 0 ? (
                  profile.profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-2">No skills added</p>
                )}
              </div>
            )}
          </div>

          {/* Role-specific fields */}
          {user.role === 'student' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID</Label>
                {isEditing ? (
                  <Input
                    id="student_id"
                    value={formData.student_id}
                    onChange={(e) => handleInputChange("student_id", e.target.value)}
                    placeholder="Your student ID"
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">{profile.profile?.student_id || 'Not provided'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                {isEditing ? (
                  <Select value={formData.branch} onValueChange={(value) => handleInputChange("branch", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSE">Computer Science & Engineering</SelectItem>
                      <SelectItem value="IT">Information Technology</SelectItem>
                      <SelectItem value="ECE">Electronics & Communication Engineering</SelectItem>
                      <SelectItem value="EE">Electrical Engineering</SelectItem>
                      <SelectItem value="ME">Mechanical Engineering</SelectItem>
                      <SelectItem value="CE">Civil Engineering</SelectItem>
                      <SelectItem value="CHE">Chemical Engineering</SelectItem>
                      <SelectItem value="MCA">Master of Computer Applications</SelectItem>
                      <SelectItem value="MBA">Master of Business Administration</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">{profile.profile?.branch || 'Not provided'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="grad_year">Graduation Year</Label>
                {isEditing ? (
                  <Select value={formData.grad_year?.toString()} onValueChange={(value) => handleInputChange("grad_year", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + 4 - i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">{profile.profile?.grad_year || 'Not provided'}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_title">Current Job Title</Label>
                {isEditing ? (
                  <Input
                    id="current_title"
                    value={formData.current_title}
                    onChange={(e) => handleInputChange("current_title", e.target.value)}
                    placeholder="e.g. Software Engineer"
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">{profile.profile?.current_title || 'Not provided'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                {isEditing ? (
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange("company_name", e.target.value)}
                    placeholder="Company name"
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">{profile.profile?.company_name || 'Not provided'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_years">Years of Experience</Label>
                {isEditing ? (
                  <Input
                    id="experience_years"
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => handleInputChange("experience_years", e.target.value)}
                    placeholder="Years of experience"
                    min="0"
                    max="50"
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">
                    {profile.profile?.experience_years ? `${profile.profile.experience_years} years` : 'Not provided'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="grad_year">Graduation Year</Label>
                {isEditing ? (
                  <Select value={formData.grad_year?.toString()} onValueChange={(value) => handleInputChange("grad_year", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">{profile.profile?.grad_year || 'Not provided'}</p>
                )}
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="space-y-4">
            <Label>Social Links</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin_url" className="text-xs text-muted-foreground">LinkedIn URL</Label>
                {isEditing ? (
                  <Input
                    id="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">
                    {profile.profile?.linkedin_url ? (
                      <a href={profile.profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.profile.linkedin_url}
                      </a>
                    ) : 'Not provided'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="github_url" className="text-xs text-muted-foreground">GitHub URL</Label>
                {isEditing ? (
                  <Input
                    id="github_url"
                    value={formData.github_url}
                    onChange={(e) => handleInputChange("github_url", e.target.value)}
                    placeholder="https://github.com/yourusername"
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">
                    {profile.profile?.github_url ? (
                      <a href={profile.profile.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.profile.github_url}
                      </a>
                    ) : 'Not provided'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio_url" className="text-xs text-muted-foreground">Portfolio URL</Label>
                {isEditing ? (
                  <Input
                    id="portfolio_url"
                    value={formData.portfolio_url}
                    onChange={(e) => handleInputChange("portfolio_url", e.target.value)}
                    placeholder="https://yourportfolio.com"
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">
                    {profile.profile?.portfolio_url ? (
                      <a href={profile.profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.profile.portfolio_url}
                      </a>
                    ) : 'Not provided'}
                  </p>
                )}
              </div>

              {user.role === 'alumni' && (
                <div className="space-y-2">
                  <Label htmlFor="company_website" className="text-xs text-muted-foreground">Company Website</Label>
                  {isEditing ? (
                    <Input
                      id="company_website"
                      value={formData.company_website}
                      onChange={(e) => handleInputChange("company_website", e.target.value)}
                      placeholder="https://company.com"
                    />
                  ) : (
                    <p className="text-sm py-2 px-3 bg-muted rounded-md">
                      {profile.profile?.company_website ? (
                        <a href={profile.profile.company_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {profile.profile.company_website}
                        </a>
                      ) : 'Not provided'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManager;
