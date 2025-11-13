import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Shield, User, Building2, FileText, Settings } from "lucide-react";

const mockLogs = [
  {
    id: "1",
    timestamp: "2025-09-18 11:45:23",
    user: "admin@sgsits.ac.in",
    action: "User Approved",
    resource: "Users",
    resourceId: "USR-2024-001",
    ipAddress: "192.168.1.10",
    userAgent: "Chrome/118.0.0.0",
    severity: "info"
  },
  {
    id: "2",
    timestamp: "2025-09-18 11:30:15",
    user: "hr@sgsits.ac.in",
    action: "Company Deleted",
    resource: "Companies",
    resourceId: "CMP-2024-007",
    ipAddress: "192.168.1.25",
    userAgent: "Firefox/119.0",
    severity: "critical"
  },
  {
    id: "3",
    timestamp: "2025-09-18 11:20:45",
    user: "moderator@sgsits.ac.in",
    action: "Job Posting Rejected",
    resource: "Postings",
    resourceId: "JOB-2024-156",
    ipAddress: "192.168.1.18",
    userAgent: "Safari/17.0",
    severity: "warning"
  },
  {
    id: "4",
    timestamp: "2025-09-18 10:55:32",
    user: "admin@sgsits.ac.in",
    action: "Settings Modified",
    resource: "System",
    resourceId: "SET-EMAIL-CONFIG",
    ipAddress: "192.168.1.10",
    userAgent: "Chrome/118.0.0.0",
    severity: "warning"
  },
  {
    id: "5",
    timestamp: "2025-09-18 10:35:18",
    user: "alumni@sgsits.ac.in",
    action: "Profile Updated",
    resource: "Users",
    resourceId: "USR-2024-089",
    ipAddress: "203.194.45.12",
    userAgent: "Edge/118.0.0.0",
    severity: "info"
  },
  {
    id: "6",
    timestamp: "2025-09-18 10:15:07",
    user: "company@infosys.com",
    action: "Application Downloaded",
    resource: "Applications",
    resourceId: "APP-2024-234",
    ipAddress: "117.208.123.45",
    userAgent: "Chrome/118.0.0.0",
    severity: "info"
  },
  {
    id: "7",
    timestamp: "2025-09-18 09:45:55",
    user: "admin@sgsits.ac.in",
    action: "Bulk Email Sent",
    resource: "Communications",
    resourceId: "EMAIL-BATCH-012",
    ipAddress: "192.168.1.10",
    userAgent: "Chrome/118.0.0.0",
    severity: "info"
  },
  {
    id: "8",
    timestamp: "2025-09-18 09:30:12",
    user: "security@sgsits.ac.in",
    action: "Failed Login Attempt",
    resource: "Authentication",
    resourceId: "AUTH-FAIL-087",
    ipAddress: "45.123.67.89",
    userAgent: "Unknown/Bot",
    severity: "critical"
  }
];

const getActionIcon = (resource) => {
  switch (resource) {
    case "Users": return User;
    case "Companies": return Building2;
    case "Postings": return FileText;
    case "System": case "Authentication": case "Communications": return Settings;
    default: return Shield;
  }
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case "info": return "bg-primary/10 text-primary border-primary/20";
    case "warning": return "bg-warning/10 text-warning border-warning/20";
    case "critical": return "bg-destructive/10 text-destructive border-destructive/20";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    const matchesResource = resourceFilter === "all" || log.resource === resourceFilter;
    
    return matchesSearch && matchesSeverity && matchesResource;
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track all system activities and security events
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
            <div className="text-2xl font-bold">2,847</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Events</CardTitle>
            <div className="text-2xl font-bold text-destructive">23</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Logins</CardTitle>
            <div className="text-2xl font-bold text-warning">156</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
            <div className="text-2xl font-bold text-success">342</div>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs by user, action, or resource..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="Users">Users</SelectItem>
                <SelectItem value="Companies">Companies</SelectItem>
                <SelectItem value="Postings">Postings</SelectItem>
                <SelectItem value="System">System</SelectItem>
                <SelectItem value="Authentication">Authentication</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const IconComponent = getActionIcon(log.resource);
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {log.timestamp}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.user}</div>
                        <div className="text-xs text-muted-foreground">{log.userAgent}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{log.action}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">ID: {log.resourceId}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.resource}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ipAddress}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}