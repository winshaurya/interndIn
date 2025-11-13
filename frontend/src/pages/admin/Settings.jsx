import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  Mail, 
  Shield, 
  Globe, 
  Bell, 
  Database,
  Users,
  Eye,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "SGSITS Alumni Portal",
    siteDescription: "Connect, collaborate, and grow with SGSITS alumni worldwide",
    contactEmail: "admin@sgsits.ac.in",
    timeZone: "Asia/Kolkata",
    
    // Email Settings
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUsername: "noreply@sgsits.ac.in",
    smtpPassword: "••••••••••••",
    emailFromName: "SGSITS Alumni Portal",
    
    // Security Settings
    enableTwoFactor: true,
    sessionTimeout: "30",
    maxLoginAttempts: "5",
    passwordMinLength: "8",
    
    // Notification Settings
    enableEmailNotifications: true,
    enablePushNotifications: false,
    enableSMSNotifications: true,
    
    // User Registration Settings
    autoApproveAlumni: false,
    requireEmailVerification: true,
    allowPublicRegistration: true,
    
    // Content Settings
    maxFileUploadSize: "10",
    allowedFileTypes: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    moderateJobPostings: true,
    featuredCompaniesLimit: "20"
  });

  const handleSave = (section) => {
    toast({
      title: "Settings Updated",
      description: `${section} settings have been saved successfully.`,
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">
            Configure platform settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeZone">Time Zone</Label>
                <Select value={settings.timeZone} onValueChange={(value) => setSettings({...settings, timeZone: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => handleSave("General")} className="w-fit">
                <Save className="h-4 w-4 mr-2" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtpHost}
                    onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={settings.smtpPort}
                    onChange={(e) => setSettings({...settings, smtpPort: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    value={settings.smtpUsername}
                    onChange={(e) => setSettings({...settings, smtpUsername: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.smtpPassword}
                    onChange={(e) => setSettings({...settings, smtpPassword: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailFromName">Email From Name</Label>
                <Input
                  id="emailFromName"
                  value={settings.emailFromName}
                  onChange={(e) => setSettings({...settings, emailFromName: e.target.value})}
                />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Email Template Preview
                </h4>
                <div className="text-sm space-y-1">
                  <div><strong>From:</strong> {settings.emailFromName} &lt;{settings.smtpUsername}&gt;</div>
                  <div><strong>Subject:</strong> Welcome to SGSITS Alumni Portal</div>
                  <div className="mt-2 p-2 bg-background rounded text-xs">
                    Dear Alumni,<br/>
                    Welcome to the SGSITS Alumni Portal...<br/>
                    Best regards,<br/>
                    SGSITS Team
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSave("Email")} className="w-fit">
                <Save className="h-4 w-4 mr-2" />
                Save Email Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                  </div>
                  <Switch
                    checked={settings.enableTwoFactor}
                    onCheckedChange={(checked) => setSettings({...settings, enableTwoFactor: checked})}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => setSettings({...settings, maxLoginAttempts: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Min Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      value={settings.passwordMinLength}
                      onChange={(e) => setSettings({...settings, passwordMinLength: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <h4 className="font-medium text-destructive mb-2">Security Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>SSL Certificate</span>
                    <Badge className="bg-success text-success-foreground">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Firewall Status</span>
                    <Badge className="bg-success text-success-foreground">Protected</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Security Scan</span>
                    <span className="text-muted-foreground">2 hours ago</span>
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSave("Security")} className="w-fit">
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.enableEmailNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, enableEmailNotifications: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Browser push notifications</p>
                  </div>
                  <Switch
                    checked={settings.enablePushNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, enablePushNotifications: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send SMS for critical alerts</p>
                  </div>
                  <Switch
                    checked={settings.enableSMSNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, enableSMSNotifications: checked})}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave("Notifications")} className="w-fit">
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto-approve Alumni</Label>
                    <p className="text-sm text-muted-foreground">Automatically approve alumni registrations</p>
                  </div>
                  <Switch
                    checked={settings.autoApproveAlumni}
                    onCheckedChange={(checked) => setSettings({...settings, autoApproveAlumni: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">Users must verify email before access</p>
                  </div>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => setSettings({...settings, requireEmailVerification: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Allow Public Registration</Label>
                    <p className="text-sm text-muted-foreground">Enable open user registration</p>
                  </div>
                  <Switch
                    checked={settings.allowPublicRegistration}
                    onCheckedChange={(checked) => setSettings({...settings, allowPublicRegistration: checked})}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave("User Management")} className="w-fit">
                <Save className="h-4 w-4 mr-2" />
                Save User Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Content Management Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxFileUploadSize">Max File Upload Size (MB)</Label>
                  <Input
                    id="maxFileUploadSize"
                    value={settings.maxFileUploadSize}
                    onChange={(e) => setSettings({...settings, maxFileUploadSize: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featuredCompaniesLimit">Featured Companies Limit</Label>
                  <Input
                    id="featuredCompaniesLimit"
                    value={settings.featuredCompaniesLimit}
                    onChange={(e) => setSettings({...settings, featuredCompaniesLimit: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                <Input
                  id="allowedFileTypes"
                  value={settings.allowedFileTypes}
                  onChange={(e) => setSettings({...settings, allowedFileTypes: e.target.value})}
                  placeholder=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Moderate Job Postings</Label>
                  <p className="text-sm text-muted-foreground">Require admin approval for job postings</p>
                </div>
                <Switch
                  checked={settings.moderateJobPostings}
                  onCheckedChange={(checked) => setSettings({...settings, moderateJobPostings: checked})}
                />
              </div>

              <Button onClick={() => handleSave("Content Management")} className="w-fit">
                <Save className="h-4 w-4 mr-2" />
                Save Content Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}