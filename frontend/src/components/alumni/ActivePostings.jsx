import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataState } from "@/components/common/DataState";
import { apiClient } from "@/lib/api";
import { Filter, Plus, MoreHorizontal, Eye, Edit, Pause, X, DownloadCloud } from "lucide-react";

const normalizeJobs = (payload) => {
  if (!payload) return [];
  let list = [];
  if (Array.isArray(payload)) {
    list = payload;
  } else if (Array.isArray(payload.jobs)) {
    list = payload.jobs;
  } else if (Array.isArray(payload.data)) {
    list = payload.data;
  }

  return list.map((job, index) => {
    const jobId = job.id || job.jobId || job._id || job.uuid || `${index}`;
    const companyName = job.companyName || job.company?.name || job.organization || "";
    const applicantCount = job.applicantCount ?? job.applicantsCount ?? job.applicationsCount ?? 0;
    const rawStatus = job.status || job.jobStatus || job.state || "Unknown";
    return {
      id: jobId,
      title: job.title || job.jobTitle || job.roleTitle || "Untitled role",
      company: companyName || "--",
      type: job.jobType || job.type || "Job",
      location: job.location || job.city || job.region || "Remote",
      applyBy: job.applyBy || job.applyTill || job.deadline || job.applicationDeadline || job.endDate || "--",
      status: rawStatus,
      applicants: applicantCount,
    };
  });
};

const formatDate = (value) => {
  if (!value || value === "--") return "--";
  try {
    return new Date(value).toLocaleDateString();
  } catch (_err) {
    return value;
  }
};

const getStatusColor = (status = "") => {
  const normalized = status.toLowerCase();
  if (normalized.includes("accept") || normalized.includes("open") || normalized.includes("active")) {
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  }
  if (normalized.includes("pause") || normalized.includes("hold")) {
    return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
  }
  if (normalized.includes("close")) {
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  }
  return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
};

const toCsvValue = (value) => {
  const stringValue = value ?? "";
  const escaped = String(stringValue).replace(/"/g, '""');
  return `"${escaped}"`;
};

export function ActivePostings() {
  const navigate = useNavigate();
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [showFilters, setShowFilters] = useState(true);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["alumni-jobs"],
    queryFn: () => apiClient.getAlumniJobs(),
  });

  const jobs = useMemo(() => normalizeJobs(data), [data]);

  const companyOptions = useMemo(() => Array.from(new Set(jobs.map((job) => job.company).filter(Boolean))), [jobs]);
  const jobTypeOptions = useMemo(() => Array.from(new Set(jobs.map((job) => job.type).filter(Boolean))), [jobs]);
  const locationOptions = useMemo(() => Array.from(new Set(jobs.map((job) => job.location).filter(Boolean))), [jobs]);
  const statusOptions = useMemo(() => Array.from(new Set(jobs.map((job) => job.status).filter(Boolean))), [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      return (
        (selectedCompanies.length === 0 || selectedCompanies.includes(job.company)) &&
        (selectedJobTypes.length === 0 || selectedJobTypes.includes(job.type)) &&
        (selectedLocations.length === 0 || selectedLocations.includes(job.location)) &&
        (selectedStatuses.length === 0 || selectedStatuses.includes(job.status))
      );
    });
  }, [jobs, selectedCompanies, selectedJobTypes, selectedLocations, selectedStatuses]);

  const activeFiltersCount = [selectedCompanies, selectedJobTypes, selectedLocations, selectedStatuses]
    .filter((filter) => filter.length > 0).length;

  const summaryStats = useMemo(() => {
    const live = jobs.filter((job) => getStatusColor(job.status).includes("green")).length;
    const paused = jobs.filter((job) => getStatusColor(job.status).includes("amber") || getStatusColor(job.status).includes("gray")).length;
    const applicants = jobs.reduce((total, job) => total + job.applicants, 0);
    return [
      { label: "Live roles", value: live, helper: "Currently accepting" },
      { label: "Paused/Closed", value: paused, helper: "Need attention" },
      { label: "Total applicants", value: applicants, helper: "Across listed roles" },
    ];
  }, [jobs]);

  const clearAllFilters = () => {
    setSelectedCompanies([]);
    setSelectedJobTypes([]);
    setSelectedLocations([]);
    setSelectedStatuses([]);
  };

  const exportToCSV = () => {
    if (jobs.length === 0 || typeof window === "undefined") return;
    const header = ["Title", "Company", "Type", "Location", "Apply By", "Status", "Applicants"];
    const rows = jobs.map((job) => [job.title, job.company, job.type, job.location, job.applyBy, job.status, job.applicants]);
    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => toCsvValue(cell)).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "postings.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Posting health</p>
          <p className="text-base text-muted-foreground">
            {filteredJobs.length} of {jobs.length} roles visible to students right now.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <DownloadCloud className="h-4 w-4 mr-2" />
            Export snapshot
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate("/alumni/post-job")}>
            <Plus className="h-4 w-4 mr-2" />
            Post new job
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Filters & focus</CardTitle>
            <p className="text-sm text-muted-foreground">Narrow down postings by partner, status, or geography.</p>
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? "s" : ""} active
            </Badge>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => setShowFilters(!showFilters)} className="text-sm font-medium">
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide" : "Show"} filters
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Companies */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Companies</label>
                <div className="text-xs text-muted-foreground mb-2">
                  {selectedCompanies.length} selected
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {companyOptions.map((company) => (
                    <div key={company} className="flex items-center space-x-2">
                      <Checkbox
                        id={`company-${company}`}
                        checked={selectedCompanies.includes(company)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCompanies([...selectedCompanies, company]);
                          } else {
                            setSelectedCompanies(selectedCompanies.filter(c => c !== company));
                          }
                        }}
                      />
                      <label
                        htmlFor={`company-${company}`}
                        className="text-sm cursor-pointer"
                      >
                        {company}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedCompanies.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCompanies([])}
                    className="text-xs text-muted-foreground h-8"
                  >
                    Clear all companies filters
                  </Button>
                )}
              </div>

              {/* Job Types */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Job Types</label>
                <div className="text-xs text-muted-foreground mb-2">
                  {selectedJobTypes.length} selected
                </div>
                <div className="space-y-2">
                  {jobTypeOptions.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={selectedJobTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedJobTypes([...selectedJobTypes, type]);
                          } else {
                            setSelectedJobTypes(selectedJobTypes.filter(t => t !== type));
                          }
                        }}
                      />
                      <label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedJobTypes.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedJobTypes([])}
                    className="text-xs text-muted-foreground h-8"
                  >
                    Clear all job types filters
                  </Button>
                )}
              </div>

              {/* Locations */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Locations</label>
                <div className="text-xs text-muted-foreground mb-2">
                  {selectedLocations.length} selected
                </div>
                <div className="space-y-2">
                  {locationOptions.map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={`location-${location}`}
                        checked={selectedLocations.includes(location)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedLocations([...selectedLocations, location]);
                          } else {
                            setSelectedLocations(selectedLocations.filter(l => l !== location));
                          }
                        }}
                      />
                      <label htmlFor={`location-${location}`} className="text-sm cursor-pointer">
                        {location}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedLocations.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLocations([])}
                    className="text-xs text-muted-foreground h-8"
                  >
                    Clear all locations filters
                  </Button>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <div className="space-y-2">
                  {statusOptions.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={selectedStatuses.includes(status)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStatuses([...selectedStatuses, status]);
                          } else {
                            setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                          }
                        }}
                      />
                      <label htmlFor={`status-${status}`} className="text-sm cursor-pointer">
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Listings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job postings directory</CardTitle>
          <p className="text-sm text-muted-foreground">Monitor statuses and take quick actions on each role.</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Apply By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <DataState state="loading" message="Loading postings" />
                  </TableCell>
                </TableRow>
              )}
              {isError && !isLoading && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <DataState
                      state="error"
                      message="Unable to load postings"
                      description="Retry in a few seconds."
                      action={
                        <Button size="sm" onClick={() => refetch()}>
                          Retry
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && filteredJobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <DataState
                      state="empty"
                      message="No postings match your filters"
                      description="Try selecting additional companies or clear filters to see everything again."
                      action={
                        <Button variant="outline" size="sm" onClick={clearAllFilters}>
                          Reset filters
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !isError &&
                filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.company}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {job.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>{formatDate(job.applyBy)}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getStatusColor(job.status)}`}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {job.applicants} applicants
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onSelect={() => navigate(`/alumni/applications?jobId=${job.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Applicants
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Job Posting
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause Applications
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <X className="h-4 w-4 mr-2" />
                            Close Job Posting
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
