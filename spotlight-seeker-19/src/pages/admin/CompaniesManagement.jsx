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
import { Search, Star, Flag, Merge, Edit, Building2, Users, Briefcase } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";

const mockCompanies = [
  {
    id: "1",
    name: "TechCorp Solutions",
    industry: "Software Development",
    status: "Approved",
    employees: "100-500",
    location: "Indore, MP",
    activeJobs: 5,
    totalHires: 23,
    registeredAt: "2024-08-15",
    website: "https://techcorp.com"
  },
  {
    id: "2",
    name: "InnovateLabs",
    industry: "AI/ML",
    status: "Pending",
    employees: "50-100",
    location: "Bangalore, KA",
    activeJobs: 0,
    totalHires: 0,
    registeredAt: "2024-09-10",
    website: "https://innovatelabs.io"
  },
  {
    id: "3",
    name: "DataDriven Analytics",
    industry: "Data Science",
    status: "Featured",
    employees: "200-1000",
    location: "Pune, MH",
    activeJobs: 8,
    totalHires: 45,
    registeredAt: "2024-07-20",
    website: "https://datadriven.com"
  },
  {
    id: "4",
    name: "SuspiciousTech Inc",
    industry: "Unknown",
    status: "Flagged",
    employees: "1-10",
    location: "Unknown",
    activeJobs: 2,
    totalHires: 1,
    registeredAt: "2024-09-15"
  },
  {
    id: "5",
    name: "Microsoft India",
    industry: "Technology",
    status: "Approved",
    employees: "10000+",
    location: "Hyderabad, TS",
    activeJobs: 12,
    totalHires: 78,
    registeredAt: "2024-06-01",
    website: "https://microsoft.com/en-in"
  }
];

export default function CompaniesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companies, setCompanies] = useState(mockCompanies);

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || company.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status) => {
    switch (status) {
      case "Approved": return "default";
      case "Featured": return "default";
      case "Pending": return "secondary";
      case "Flagged": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved": return "bg-success text-success-foreground";
      case "Featured": return "bg-primary text-primary-foreground";
      case "Pending": return "bg-warning text-warning-foreground";
      case "Flagged": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleCompanyAction = (companyId, action) => {
    setCompanies(prevCompanies =>
      prevCompanies.map(company =>
        company.id === companyId
          ? {
              ...company,
              status: action === "approve" ? "Approved" : 
                     action === "flag" ? "Flagged" : 
                     action === "feature" ? "Featured" :
                     "Approved"
            }
          : company
      )
    );
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Companies Management</h1>
          <p className="text-muted-foreground">Manage company registrations and partnerships</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Companies"
          value="92"
          icon={Building2}
          variant="default"
        />
        <StatCard
          title="Pending Approval"
          value="15"
          icon={Users}
          variant="warning"
        />
        <StatCard
          title="Featured Partners"
          value="8"
          icon={Star}
          variant="success"
        />
        <StatCard
          title="Active Job Postings"
          value="27"
          icon={Briefcase}
          variant="default"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search companies by name, industry, or location..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Company Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Details</TableHead>
                <TableHead>Industry & Size</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground">{company.name}</div>
                      <div className="text-sm text-muted-foreground">{company.location}</div>
                      {company.website && (
                        <div className="text-xs text-primary">{company.website}</div>
                      )}
                      <div className="text-xs text-muted-foreground">Registered: {company.registeredAt}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{company.industry}</div>
                      <div className="text-xs text-muted-foreground">{company.employees} employees</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">Active Jobs: <span className="font-semibold">{company.activeJobs}</span></div>
                      <div className="text-sm">Total Hires: <span className="font-semibold">{company.totalHires}</span></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusVariant(company.status)}
                      className={`${getStatusColor(company.status)} font-medium`}
                    >
                      {company.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {company.status === "Pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompanyAction(company.id, "approve")}
                          className="text-success border-success hover:bg-success hover:text-success-foreground"
                        >
                          Approve
                        </Button>
                      )}
                      {company.status !== "Featured" && company.status !== "Flagged" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompanyAction(company.id, "feature")}
                          className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Feature
                        </Button>
                      )}
                      {company.status === "Featured" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompanyAction(company.id, "unfeature")}
                          className="text-muted-foreground"
                        >
                          Unfeature
                        </Button>
                      )}
                      {company.status !== "Flagged" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompanyAction(company.id, "flag")}
                          className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Flag className="h-3 w-3 mr-1" />
                          Flag
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-foreground"
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