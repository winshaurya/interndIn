import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Search, Filter, Eye, Download, MessageSquare, X, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

const applicantsData = [
  {
    id: 1,
    name: "Jane Smith",
    class: "Class of 2024",
    branch: "Information Technology",
    applicationTime: "9 Jan 2024, 07:45 pm",
    skillMatch: 92,
    skills: ["Java", "Spring Boot", "MySQL"],
    status: "Shortlisted",
    statusColor: "bg-green-100 text-green-800"
  },
  {
    id: 2,
    name: "Mike Wilson",
    class: "Class of 2024", 
    branch: "Information Technology",
    applicationTime: "6 Jan 2024, 05:00 pm",
    skillMatch: 88,
    skills: ["Python", "Django", "AWS"],
    status: "Interviewing",
    statusColor: "bg-blue-100 text-blue-800"
  },
  {
    id: 3,
    name: "John Doe",
    class: "Class of 2024",
    branch: "Computer Science",
    applicationTime: "10 Jan 2024, 04:00 pm", 
    skillMatch: 85,
    skills: ["Python", "Django", "JavaScript"],
    status: "Submitted",
    statusColor: "bg-yellow-100 text-yellow-800"
  },
  {
    id: 4,
    name: "Bob Johnson",
    class: "Class of 2024", 
    branch: "Computer Science",
    applicationTime: "8 Jan 2024, 02:50 pm",
    skillMatch: 78,
    skills: ["JavaScript", "Node.js", "MongoDB"],
    status: "Submitted", 
    statusColor: "bg-yellow-100 text-yellow-800"
  }
];

export function JobApplicants() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  
  const branches = ["Computer Science", "Information Technology"];
  const statuses = ["Shortlisted", "Interviewing", "Submitted"];

  const filteredApplicants = applicantsData.filter(applicant => {
    const matchesSearch = applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBranch = selectedBranches.length === 0 || selectedBranches.includes(applicant.branch);
    const matchesStatus = !selectedStatus || applicant.status === selectedStatus;
    
    return matchesSearch && matchesBranch && matchesStatus;
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/alumni')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Job Applicants</h1>
            <p className="text-muted-foreground">
              Senior Software Engineer at TechCorp Inc. • Showing {filteredApplicants.length} of {applicantsData.length} applicants
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={clearAllFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Filters */}
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

      {/* Applicants Table */}
      <Card>
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
              {filteredApplicants.map((applicant) => (
                <TableRow key={applicant.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/api/placeholder/32/32`} />
                        <AvatarFallback>{applicant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{applicant.name}</div>
                        <div className="text-sm text-muted-foreground">{applicant.class}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{applicant.branch}</TableCell>
                  <TableCell className="text-sm">{applicant.applicationTime}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={applicant.skillMatch} className="w-16" />
                      <span className="text-sm font-medium">{applicant.skillMatch}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {applicant.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={applicant.statusColor}>
                      {applicant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">View</span>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">Resume</span>
                      </Button>
                      <Button variant="ghost" size="sm">
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
