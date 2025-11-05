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
  Edit, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Users,
  Clock,
  Star,
  Download
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";

const mockPostings = [
  {
    id: "1",
    title: "Software Engineer Intern",
    company: "TechCorp Solutions",
    type: "Internship",
    status: "Approved",
    applications: 45,
    salary: "₹25,000 - ₹30,000/month",
    location: "Indore, MP",
    postedDate: "2024-09-15",
    deadline: "2024-10-15",
    flagged: false,
    branches: ["CSE", "IT"]
  },
  {
    id: "2",
    title: "ML Engineer - Full Stack",
    company: "InnovateLabs",
    type: "Full-time",
    status: "Pending",
    applications: 0,
    salary: "₹8,00,000 - ₹12,00,000/year",
    location: "Bangalore, KA",
    postedDate: "2024-09-18",
    deadline: "2024-11-01",
    flagged: false,
    branches: ["CSE", "IT", "ECE"]
  },
  {
    id: "3",
    title: "Data Scientist",
    company: "DataDriven Analytics",
    type: "Full-time", 
    status: "Featured",
    applications: 78,
    salary: "₹10,00,000 - ₹15,00,000/year",
    location: "Pune, MH",
    postedDate: "2024-09-10",
    deadline: "2024-10-25",
    flagged: false,
    branches: ["CSE", "IT", "ME"]
  },
  {
    id: "4",
    title: "Suspicious High Pay Role",
    company: "SuspiciousTech Inc",
    type: "Full-time",
    status: "Rejected", 
    applications: 12,
    salary: "₹50,00,000/year",
    location: "Unknown",
    postedDate: "2024-09-17",
    deadline: "2024-09-20",
    flagged: true,
    branches: ["CSE"]
  },
  {
    id: "5",
    title: "Product Manager",
    company: "Microsoft India",
    type: "Full-time",
    status: "Approved",
    applications: 156,
    salary: "₹18,00,000 - ₹25,00,000/year", 
    location: "Hyderabad, TS",
    postedDate: "2024-09-05",
    deadline: "2024-10-05",
    flagged: false,
    branches: ["MBA", "CSE", "IT"]
  },
  {
    id: "6",
    title: "Frontend Developer",
    company: "StartupXYZ",
    type: "Part-time",
    status: "Expired",
    applications: 23,
    salary: "₹40,000 - ₹60,000/month",
    location: "Remote",
    postedDate: "2024-08-15",
    deadline: "2024-09-15",
    flagged: false,
    branches: ["CSE", "IT"]
  }
];

export default function PostingsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [postings, setPostings] = useState(mockPostings);

  const exportToCSV = () => {
    const csvContent = [
      ["ID", "Title", "Company", "Type", "Status", "Applications", "Salary", "Location", "Posted Date", "Deadline", "Branches"],
      ...filteredPostings.map(posting => [
        posting.id,
        posting.title,
        posting.company,
        posting.type,
        posting.status,
        posting.applications.toString(),
        posting.salary,
        posting.location,
        posting.postedDate,
        posting.deadline,
        posting.branches.join("; ")
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job-postings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredPostings = postings.filter(posting => {
    const matchesSearch = posting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         posting.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         posting.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || posting.status.toLowerCase() === statusFilter;
    const matchesType = typeFilter === "all" || posting.type.toLowerCase() === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved": return "bg-success text-success-foreground";
      case "Featured": return "bg-primary text-primary-foreground";
      case "Pending": return "bg-warning text-warning-foreground";
      case "Rejected": return "bg-destructive text-destructive-foreground";
      case "Expired": return "bg-muted text-muted-foreground";
      case "Draft": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handlePostingAction = (postingId, action) => {
    setPostings(prevPostings =>
      prevPostings.map(posting =>
        posting.id === postingId
          ? {
              ...posting,
              status: action === "approve" ? "Approved" : 
                     action === "reject" ? "Rejected" : 
                     action === "feature" ? "Featured" : 
                     posting.status
            }
          : posting
      )
    );
  };

  const pendingCount = postings.filter(p => p.status === "Pending").length;
  const approvedCount = postings.filter(p => p.status === "Approved").length;
  const flaggedCount = postings.filter(p => p.flagged).length;
  const totalApplications = postings.reduce((sum, p) => sum + p.applications, 0);

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Postings Management</h1>
          <p className="text-muted-foreground">Review and manage job postings with moderation controls</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Postings"
          value="134"
          icon={FileText}
          variant="default"
        />
        <StatCard
          title="Pending Review"
          value={pendingCount.toString()}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Flagged Content"
          value={flaggedCount.toString()}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Total Applications"
          value={totalApplications.toString()}
          icon={Users}
          variant="success"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Moderation Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, company, or location..."
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
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Postings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Postings Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Details</TableHead>
                <TableHead>Company & Location</TableHead>
                <TableHead>Dates & Deadline</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPostings.map((posting) => (
                <TableRow key={posting.id} className={`hover:bg-muted/50 ${posting.flagged ? 'bg-destructive/5' : ''}`}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-foreground">{posting.title}</div>
                        {posting.flagged && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {posting.type}
                        </Badge>
                        <div className="text-xs text-muted-foreground">{posting.salary}</div>
                      </div>
                      <div className="flex gap-1">
                        {posting.branches.map(branch => (
                          <Badge key={branch} variant="secondary" className="text-xs">
                            {branch}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{posting.company}</div>
                      <div className="text-sm text-muted-foreground">{posting.location}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>Posted: {posting.postedDate}</div>
                      <div className={posting.deadline < "2024-09-20" ? "text-destructive font-medium" : "text-muted-foreground"}>
                        Deadline: {posting.deadline}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{posting.applications}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(posting.status)} font-medium`}>
                      {posting.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      
                      {posting.status === "Pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePostingAction(posting.id, "approve")}
                            className="text-success border-success hover:bg-success hover:text-success-foreground"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePostingAction(posting.id, "reject")}
                            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {(posting.status === "Approved" || posting.status === "Featured") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePostingAction(posting.id, "feature")}
                          className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          {posting.status === "Featured" ? "Unfeature" : "Feature"}
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePostingAction(posting.id, "edit")}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
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