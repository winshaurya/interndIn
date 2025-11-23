import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Search, Filter, Eye, Download, MessageSquare, X, ArrowLeft, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataState } from "@/components/common/DataState";
import { apiClient } from "@/lib/api";

const statusThemes = {
  shortlisted: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100",
  interviewing: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
  interviewing_stage: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
  submitted: "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100",
  hired: "bg-primary/15 text-primary",
  rejected: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100",
};

const clampPercentage = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return 0;
  return Math.max(0, Math.min(100, numeric));
};

const normalizeSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) {
    return skills.filter(Boolean);
  }
  return String(skills)
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
};

const normalizeApplicants = (payload) => {
  if (!payload) return [];
  let list = [];
  if (Array.isArray(payload)) {
    list = payload;
  } else if (Array.isArray(payload.applicants)) {
    list = payload.applicants;
  } else if (Array.isArray(payload.data)) {
    list = payload.data;
  } else if (Array.isArray(payload.results)) {
    list = payload.results;
  }

  return list.map((entry, index) => {
    const student = entry.student || entry.profile || {};
    const fullName = entry.name || [student.firstName, student.lastName].filter(Boolean).join(" ") || student.fullName;

    return {
      id: entry.id || entry.applicationId || entry._id || `${index}`,
      name: fullName || "Candidate",
      branch: student.branch || student.department || entry.branch || "--",
      classYear: student.graduationYear ? `Class of ${student.graduationYear}` : student.classYear || "--",
      appliedAt: entry.appliedAt || entry.applicationTime || entry.createdAt,
      skillMatch: clampPercentage(entry.skillMatch ?? entry.matchScore ?? 0),
      skills: normalizeSkills(entry.skills || student.skills),
      status: (entry.status || entry.applicationStatus || "Submitted").trim(),
    };
  });
};

const formatDateTime = (value) => {
  if (!value) return "--";
  try {
    return new Date(value).toLocaleString();
  } catch (_err) {
    return value;
  }
};

export function JobApplicants() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("relevance");

  const {
    data: applicantsPayload,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["job-applicants", jobId],
    enabled: Boolean(jobId),
    queryFn: () => apiClient.getJobApplicants(jobId),
  });

  const { data: jobPayload } = useQuery({
    queryKey: ["job-detail", jobId],
    enabled: Boolean(jobId),
    queryFn: () => apiClient.getJobById(jobId),
  });

  const applicants = useMemo(() => normalizeApplicants(applicantsPayload), [applicantsPayload]);

  const jobMeta = useMemo(() => {
    if (!jobPayload) return null;
    const job = jobPayload.job || jobPayload.data || jobPayload;
    if (!job) return null;
    return {
      title: job.title || job.jobTitle || job.roleTitle,
      company: job.company?.name || job.companyName || job.organization,
    };
  }, [jobPayload]);

  const branches = useMemo(() => {
    return Array.from(new Set(applicants.map((applicant) => applicant.branch).filter(Boolean)));
  }, [applicants]);

  const statuses = useMemo(() => {
    return Array.from(new Set(applicants.map((applicant) => applicant.status).filter(Boolean)));
  }, [applicants]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const matchesSearch =
        applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesBranch = selectedBranches.length === 0 || selectedBranches.includes(applicant.branch);
      const matchesStatus = !selectedStatus || applicant.status === selectedStatus;
      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [applicants, searchTerm, selectedBranches, selectedStatus]);

  const sortedApplicants = useMemo(() => {
    const list = [...filteredApplicants];
    if (sortBy === "name") {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === "date") {
      return list.sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0));
    }
    return list.sort((a, b) => b.skillMatch - a.skillMatch);
  }, [filteredApplicants, sortBy]);

  const addBranchFilter = (branch) => {
    if (!selectedBranches.includes(branch)) {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const removeBranchFilter = (branch) => {
    setSelectedBranches(selectedBranches.filter(b => b !== branch));
  };

  const clearAllFilters = () => {
    setSelectedBranches([]);
    setSelectedStatus("");
    setSearchTerm("");
  };

  const summary = useMemo(() => {
    return statuses.map((status) => ({
      label: status,
      value: applicants.filter((applicant) => applicant.status === status).length,
      helper: "Current count",
    }));
  }, [applicants, statuses]);

  const headerDescription = jobMeta?.title
    ? `${jobMeta.title}${jobMeta.company ? ` - ${jobMeta.company}` : ""}`
    : "Select a job from postings to view applicants.";

  const renderStatusBadge = (status) => {
    const key = status?.toLowerCase().replace(/\s+/g, "_");
    const theme = statusThemes[key] || "bg-muted text-foreground";
    return <Badge className={`text-xs ${theme}`}>{status || "--"}</Badge>;
  };

  if (!jobId) {
    return (
      <Card>
        <CardContent>
          <DataState
            state="empty"
            message="Pick a job to review applicants"
            description="Head to postings, open a role, and choose View Applicants."
            action={
              <Button size="sm" onClick={() => navigate("/alumni/postings")}>
                Go to postings
              </Button>
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
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Applicants</p>
          <p className="text-sm text-muted-foreground">{headerDescription}</p>
          <p className="text-base text-muted-foreground">
            Showing {sortedApplicants.length} of {applicants.length} candidates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/alumni/postings")}> 
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to postings
          </Button>
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear filters
          </Button>
        </div>
      </div>

      {summary.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {summary.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.helper}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Search & Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, branch, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance (Skill Match)</SelectItem>
                  <SelectItem value="date">Application Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Branches</label>
              <Select onValueChange={addBranchFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedBranches.length ? `${selectedBranches.length} selected` : "Select branches..."} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Skills</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select skills..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {selectedBranches.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedBranches.map(branch => (
                <Badge key={branch} variant="secondary" className="flex items-center space-x-1">
                  <span>{branch}</span>
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeBranchFilter(branch)} />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applicants directory</CardTitle>
          <p className="text-sm text-muted-foreground">Dive deeper into every candidate without leaving the shell.</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Application Time</TableHead>
                <TableHead>Skill Match</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <DataState state="loading" message="Loading applicants" />
                  </TableCell>
                </TableRow>
              )}
              {isError && !isLoading && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <DataState
                      state="error"
                      message="Unable to load applicants"
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
              {!isLoading && !isError && sortedApplicants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <DataState
                      state="empty"
                      message="No applicants match the selected filters"
                      description="Broaden your branch or status filters to see more candidates."
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
                sortedApplicants.map((applicant) => (
                  <TableRow key={applicant.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/api/placeholder/32/32`} />
                          <AvatarFallback>{applicant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{applicant.name}</div>
                          <div className="text-sm text-muted-foreground">{applicant.classYear}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{applicant.branch}</TableCell>
                    <TableCell className="text-sm">{formatDateTime(applicant.appliedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={applicant.skillMatch} className="w-16" />
                        <span className="text-sm font-medium">{applicant.skillMatch}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {applicant.skills.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Skills pending</span>
                        ) : (
                          applicant.skills.map((skill, index) => (
                            <Badge key={`${applicant.id}-${skill}-${index}`} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{renderStatusBadge(applicant.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/student/profile/${applicant.user_id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="ml-1 hidden sm:inline">Profile</span>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                          <span className="ml-1 hidden sm:inline">Resume</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/student/profile/${applicant.user_id}`)}
                        >
                          <UserPlus className="h-4 w-4" />
                          <span className="ml-1 hidden sm:inline">Connect</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate("/alumni/messages")}
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span className="ml-1 hidden sm:inline">Message</span>
                        </Button>
                      </div>
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
