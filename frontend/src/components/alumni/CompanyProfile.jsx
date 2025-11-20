import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Calendar, Globe, MapPin, Linkedin, Twitter, ExternalLink } from "lucide-react";
import { DataState } from "@/components/common/DataState";
import { apiClient } from "@/lib/api";

const socialConfig = [
  {
    label: "LinkedIn",
    icon: Linkedin,
    accessor: (company) => company?.socialLinks?.linkedin || company?.linkedin || company?.linkedinUrl,
  },
  {
    label: "Twitter",
    icon: Twitter,
    accessor: (company) => company?.socialLinks?.twitter || company?.twitter || company?.twitterUrl,
  },
  {
    label: "Website",
    icon: Globe,
    accessor: (company) => company?.socialLinks?.website || company?.website,
  },
];

export function CompanyProfile() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["alumni-companies"],
    queryFn: () => apiClient.getCompanies(),
  });

  const company = useMemo(() => {
    if (!data) return null;
    if (Array.isArray(data)) return data[0];
    if (Array.isArray(data?.companies)) return data.companies[0];
    if (data.company) return data.company;
    return data;
  }, [data]);

  const locations = useMemo(() => {
    if (!company) return [];
    if (Array.isArray(company.locations)) return company.locations;
    if (company.location) return [company.location];
    return [];
  }, [company]);

  const socialLinks = socialConfig
    .map((entry) => ({ ...entry, url: entry.accessor(company) }))
    .filter((entry) => Boolean(entry.url));

  const stats = [
    { label: "Active jobs", value: company?.activeJobs ?? 0, accent: "text-primary" },
    { label: "SGSITS alumni hired", value: company?.alumniHired ?? 0, accent: "text-green-600" },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <DataState state="loading" message="Fetching company profile" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent>
          <DataState
            state="error"
            message="Unable to load company details"
            description="Check your connection and retry."
            action={
              <Button size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  if (!company) {
    return (
      <Card>
        <CardContent>
          <DataState
            state="empty"
            message="No company profile yet"
            description="Publish your company to help students understand your brand."
            action={
              <Button size="sm" onClick={() => navigate("/alumni/add-company")}>Create company</Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5">
        <div>
          <h1 className="text-xl font-semibold">{company.name || "Company"}</h1>
          <p className="text-sm text-muted-foreground">Public profile - Student preview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/alumni/postings")}>View roles</Button>
          <Button onClick={() => navigate("/alumni/edit-company-profile")}>Edit company details</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{company.name}</h2>
                    <p className="text-muted-foreground">{company.industry || "Industry pending"}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {company.size && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {company.size}
                      </div>
                    )}
                    {company.founded && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Founded in {company.founded}
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Visit site
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>About {company.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">
                {company.about || "Add a short overview so students understand what you build."}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Company culture</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">
                {company.culture || "Share how your teams work, grow, and collaborate."}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Office locations</CardTitle>
            </CardHeader>
            <CardContent>
              {locations.length === 0 ? (
                <p className="text-sm text-muted-foreground">Add at least one hub so students know where you operate.</p>
              ) : (
                <div className="space-y-4">
                  {locations.map((location, index) => (
                    <div key={`${location}-${index}`} className="flex items-center text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4 text-primary" />
                      {location}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Quick stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className={`text-3xl font-bold ${stat.accent}`}>{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Connect with us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {socialLinks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Add social links to guide students toward official channels.</p>
              ) : (
                socialLinks.map(({ label, icon: Icon, url }) => (
                  <Button key={label} variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <Icon className="mr-2 h-4 w-4" />
                      {label}
                      <ExternalLink className="ml-auto h-3 w-3" />
                    </a>
                  </Button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="shadow-glow">
            <CardContent className="space-y-4 p-6 text-center">
              <div>
                <h3 className="font-semibold text-foreground">Interested in working here?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Explore current openings from {company.name || "this organization"}.
                </p>
              </div>
              <Button className="w-full" onClick={() => navigate("/alumni/postings")}>
                View job postings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
