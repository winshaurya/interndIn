import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Users, Calendar, Globe, MapPin, Linkedin, Twitter, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CompanyProfile() {
  const navigate = useNavigate();
  
  // Mock company data - in real app this would come from state/API
  const company = {
    name: "TechCorp Inc.",
    industry: "Information Technology",
    size: "201-500 employees",
    founded: "2010",
    website: "https://techcorp.com",
    logo: "/placeholder.svg",
    about: "TechCorp Inc. is a leading technology solutions provider specializing in enterprise software development and digital transformation services. We help businesses leverage cutting-edge technologies to drive innovation and growth.",
    culture: "We foster innovation, collaboration, and continuous learning in a diverse and inclusive environment. Our team values work-life balance, professional development, and making a positive impact on society.",
    locations: [
      "Mumbai, Maharashtra, India",
      "Bangalore, Karnataka, India"
    ],
    activeJobs: 3,
    alumniHired: 28,
    socialLinks: {
      linkedin: "https://linkedin.com/company/techcorp",
      twitter: "https://twitter.com/techcorp",
      website: "https://techcorp.com"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/alumni")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
                <p className="text-sm text-muted-foreground">Public Company Profile • Student View</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/alumni/edit-company-profile")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Edit Company Details
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Info */}
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{company.name}</h2>
                      <p className="text-muted-foreground">{company.industry}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {company.size}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Founded in {company.founded}
                      </div>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-1" />
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>About {company.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {company.about}
                </p>
              </CardContent>
            </Card>

            {/* Company Culture */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Company Culture</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {company.culture}
                </p>
              </CardContent>
            </Card>

            {/* Office Locations */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Office Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {company.locations.map((location, index) => (
                    <div key={index} className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      {location}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{company.activeJobs}</div>
                  <div className="text-sm text-muted-foreground">Active Job Openings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{company.alumniHired}</div>
                  <div className="text-sm text-muted-foreground">SGSITS Alumni Hired</div>
                </div>
              </CardContent>
            </Card>

            {/* Connect With Us */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Connect With Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
                  LinkedIn
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                  Twitter/X
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Company Website
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
              </CardContent>
            </Card>

            {/* Interested in Working Here */}
            <Card className="gradient-card shadow-glow">
              <CardContent className="p-6 text-center space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground">Interested in Working Here?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check out current job openings from {company.name}
                  </p>
                </div>
                <Button 
                  className="w-full bg-foreground text-background hover:bg-foreground/90"
                  onClick={() => navigate("/alumni/postings")}
                >
                  View Job Openings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
