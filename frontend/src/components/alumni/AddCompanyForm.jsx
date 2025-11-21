import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Info, LayoutGrid, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const companySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry selection is required"),
  companySize: z.string().optional(),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
});

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Real Estate",
  "Media & Entertainment",
  "Transportation",
  "Other"
];

const companySizes = [
  "1-10 employees",
  "11-50 employees", 
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees"
];

const fastFacts = [
  { label: "Time to complete", value: "3 mins", icon: Sparkles },
  { label: "Fields required", value: "4", icon: LayoutGrid },
  { label: "Reusable profile", value: "Company hub", icon: Building2 },
];

export function AddCompanyForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(companySchema)
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // TODO: Integrate with backend API
      // debug: company created
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate("/alumni");
    } catch (error) {
      console.error("Error creating company:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <div>
          <p className="text-sm text-muted-foreground">Launch a new employer profile with just the essential context.</p>
          <p className="text-xs text-muted-foreground">The team can enrich logos, photos, and culture content later.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/alumni/companies")}>Cancel</Button>
          <Button size="sm" form="add-company-form" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {fastFacts.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-muted p-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Building2 className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="font-medium text-foreground mb-2">Quick Company Setup</h3>
              <p className="text-sm text-muted-foreground">
                Start with just the basics to create your company profile. You can add detailed information like office locations, culture, contact details, and logo later through the edit options.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form id="add-company-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Company Information</CardTitle>
            <p className="text-sm text-muted-foreground">Just 4 quick questions to get started</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="companyName"
                  placeholder="e.g. TechCorp Inc."
                  {...register("companyName")}
                  className={errors.companyName ? "border-destructive" : ""}
                />
                <p className="text-xs text-muted-foreground">Enter the official company name</p>
                {errors.companyName && (
                  <p className="text-xs text-destructive">{errors.companyName.message}</p>
                )}
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label>
                  Industry <span className="text-destructive">*</span>
                </Label>
                <Select onValueChange={(value) => setValue("industry", value)}>
                  <SelectTrigger className={errors.industry ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">What industry does your company operate in?</p>
                {errors.industry && (
                  <p className="text-xs text-destructive">{errors.industry.message}</p>
                )}
              </div>

              {/* Company Size */}
              <div className="space-y-2">
                <Label>Company Size</Label>
                <Select onValueChange={(value) => setValue("companySize", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Approximate number of employees</p>
              </div>

              {/* Company Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Company Website</Label>
                <Input
                  id="website"
                  placeholder="https://yourcompany.com"
                  {...register("website")}
                  className={errors.website ? "border-destructive" : ""}
                />
                <p className="text-xs text-muted-foreground">Optional - Your company's official website</p>
                {errors.website && (
                  <p className="text-xs text-destructive">{errors.website.message}</p>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">*</span> Required fields. You can add more details later.
            </p>
          </CardContent>
        </Card>

        {/* What happens next */}
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <div className="font-medium mb-2">What happens next?</div>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Your basic company profile will be created</li>
              <li>You'll see how students view your company</li>
              <li>Click "Edit Company Details" to add more information</li>
              <li>Add office locations, company culture, contact details, and logo</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={() => navigate("/alumni")}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="px-6">
            {isSubmitting ? "Creating Company..." : "Create Company"}
          </Button>
        </div>
      </form>
    </div>
  );
}
