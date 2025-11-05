import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Eye, 
  UserCheck, 
  MessageSquare,
  Send,
  ClipboardList,
  Users,
  CheckCircle,
  Clock
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";

const mockApplications = [
  {
    id: "1",
    applicantName: "Arjun Sharma",
    applicantEmail: "arjun.sharma@sgsits.ac.in",
    branch: "CSE",
    year: "2024",
    jobTitle: "Software Engineer Intern",
    company: "TechCorp Solutions",
    status: "Shortlisted",
    appliedDate: "2024-09-16",
    lastUpdated: "2024-09-17",
    resumeScore: 85,
    skills: ["JavaScript", "React", "Node.js"]
  },
  {
    id: "2",
    applicantName: "Priya Patel",
    applicantEmail: "priya.patel@sgsits.ac.in",
    branch: "IT",
    year: "2025",
    jobTitle: "ML Engineer - Full Stack",
    company: "InnovateLabs",
    status: "Applied",
    appliedDate: "2024-09-18",
    lastUpdated: "2024-09-18",
    resumeScore: 92,
    skills: ["Python", "TensorFlow", "React"]
  },
  {
    id: "3",
    applicantName: "Rohit Verma",
    applicantEmail: "rohit.alumni@gmail.com",
    branch: "ECE",
    year: "Alumni",
    jobTitle: "Data Scientist",
    company: "DataDriven Analytics",
    status: "Hired",
    appliedDate: "2024-09-12",
    lastUpdated: "2024-09-15",
    resumeScore: 96,
    skills: ["Python", "ML", "Statistics", "SQL"]
  },
  {
    id: "4",
    applicantName: "Sneha Gupta",
    applicantEmail: "sneha.gupta@sgsits.ac.in",
    branch: "CSE",
    year: "2024",
    jobTitle: "Product Manager",
    company: "Microsoft India",
    status: "Reviewed",
    appliedDate: "2024-09-14",
    lastUpdated: "2024-09-16",
    resumeScore: 88,
    skills: ["Product Management", "Analytics", "Agile"]
  },
  {
    id: "5",
    applicantName: "Vikas Singh",
    applicantEmail: "vikas.singh@sgsits.ac.in",
    branch: "ME",
    year: "2024",
    jobTitle: "Software Engineer Intern",
    company: "TechCorp Solutions",
    status: "Rejected",
    appliedDate: "2024-09-15",
    lastUpdated: "2024-09-17",
    resumeScore: 72,
    skills: ["C++", "AutoCAD"]
  },
  {
    id: "6",
    applicantName: "Anita Joshi",
    applicantEmail: "anita.joshi@gmail.com",
    branch: "MBA",
    year: "Alumni",
    jobTitle: "Product Manager",
    company: "Microsoft India",
    status: "Applied",
    appliedDate: "2024-09-17",
    lastUpdated: "2024-09-17",
    resumeScore: 91,
    skills: ["Strategy", "Leadership", "Analytics"]
  }
];

export default function ApplicationsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [applications, setApplications] = useState(mockApplications);
  
  const exportToCSV = () => {
    const csvContent = [
      ["ID", "Name", "Email", "Company", "Position", "Branch", "Year", "Application Date", "Status", "Resume Score"],
      ...filteredApplications.map(app => [
        app.id,
        app.applicantName,
        app.applicantEmail,
        app.company,
        app.jobTitle,
        app.branch,
        app.year,
        app.appliedDate,
        app.status,
        app.resumeScore.toString()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  const [selectedApplications, setSelectedApplications] = useState([]);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status.toLowerCase() === statusFilter;
    const matchesBranch = branchFilter === "all" || app.branch === branchFilter;
    const matchesCompany = companyFilter === "all" || app.company === companyFilter;
    return matchesSearch && matchesStatus && matchesBranch && matchesCompany;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Hired": return "bg-success text-success-foreground";
      case "Shortlisted": return "bg-primary text-primary-foreground";
      case "Reviewed": return "bg-warning text-warning-foreground";
      case "Rejected": return "bg-destructive text-destructive-foreground";
      case "Applied": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-success font-bold";
    if (score >= 80) return "text-primary font-semibold";
    if (score >= 70) return "text-warning font-medium";
    return "text-destructive";
  };

  const handleApplicationAction = (applicationId, action) => {
    setApplications(prevApps =>
      prevApps.map(app =>
        app.id === applicationId
          ? {
              ...app,
              status: action === "review" ? "Reviewed" : 
                     action === "shortlist" ? "Shortlisted" : 
                     "Rejected",
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          : app
      )
    );
  };

  const companies = [...new Set(applications.map(app => app.company))];
  const branches = [...new Set(applications.map(app => app.branch))];

  const totalApplications = applications.length;
  const newApplications = applications.filter(app => app.status === "Applied").length;
  const shortlistedApplications = applications.filter(app => app.status === "Shortlisted").length;
  const hiredApplications = applications.filter(app => app.status === "Hired").length;

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Applications Management</h1>
          <p className="text-muted-foreground">Track and manage job applications across postings and companies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">
            <MessageSquare className="h-4 w-4 mr-2" />
            Mass Message
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Send className="h-4 w-4 mr-2" />
            Send Notifications
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Applications"
          value={totalApplications.toString()}
          icon={ClipboardList}
          variant="default"
        />
        <StatCard
          title="New Applications"
          value={newApplications.toString()}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Shortlisted"
          value={shortlistedApplications.toString()}
          icon={UserCheck}
          variant="success"
        />
        <StatCard
          title="Hired"
          value={hiredApplications.toString()}
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Application Filters & Bulk Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company} value={company}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant Details</TableHead>
                <TableHead>Job & Company</TableHead>
                <TableHead>Skills & Score</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground">{application.applicantName}</div>
                      <div className="text-sm text-muted-foreground">{application.applicantEmail}</div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">{application.branch}</Badge>
                        <Badge variant="secondary" className="text-xs">{application.year}</Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{application.jobTitle}</div>
                      <div className="text-sm text-muted-foreground">{application.company}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Score:</span>
                        <span className={`text-sm font-bold ${getScoreColor(application.resumeScore)}`}>
                          {application.resumeScore}%
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {application.skills.slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {application.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{application.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>Applied: {application.appliedDate}</div>
                      <div className="text-muted-foreground">Updated: {application.lastUpdated}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(application.status)} font-medium`}>
                      {application.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      
                      {application.status === "Applied" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApplicationAction(application.id, "review")}
                          className="text-warning border-warning hover:bg-warning hover:text-warning-foreground"
                        >
                          Review
                        </Button>
                      )}

                      {(application.status === "Applied" || application.status === "Reviewed") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApplicationAction(application.id, "shortlist")}
                          className="text-success border-success hover:bg-success hover:text-success-foreground"
                        >
                          Shortlist
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <UserCheck className="h-3 w-3 mr-1" />
                        Reassign
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