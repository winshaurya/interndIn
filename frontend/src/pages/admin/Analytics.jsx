import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  FileText, 
  Eye,
  Download,
  Calendar,
  Target,
  Activity
} from "lucide-react";

// Mock data for analytics
const registrationData = [
  { month: 'Jan', alumni: 45, students: 120, faculty: 8 },
  { month: 'Feb', alumni: 52, students: 98, faculty: 5 },
  { month: 'Mar', alumni: 61, students: 134, faculty: 12 },
  { month: 'Apr', alumni: 58, students: 142, faculty: 7 },
  { month: 'May', alumni: 67, students: 156, faculty: 9 },
  { month: 'Jun', alumni: 74, students: 168, faculty: 11 },
  { month: 'Jul', alumni: 82, students: 145, faculty: 6 },
  { month: 'Aug', alumni: 89, students: 189, faculty: 14 },
  { month: 'Sep', alumni: 95, students: 201, faculty: 10 }
];

const jobApplicationData = [
  { day: 'Mon', applications: 45 },
  { day: 'Tue', applications: 67 },
  { day: 'Wed', applications: 58 },
  { day: 'Thu', applications: 89 },
  { day: 'Fri', applications: 124 },
  { day: 'Sat', applications: 34 },
  { day: 'Sun', applications: 28 }
];

const companyData = [
  { name: 'Tech Companies', value: 45, color: '#8884d8' },
  { name: 'Startups', value: 32, color: '#82ca9d' },
  { name: 'MNCs', value: 28, color: '#ffc658' },
  { name: 'Government', value: 15, color: '#ff7300' },
  { name: 'Others', value: 20, color: '#00ff88' }
];

const engagementData = [
  { date: '2024-01-01', pageViews: 1245, uniqueVisitors: 892 },
  { date: '2024-02-01', pageViews: 1456, uniqueVisitors: 1034 },
  { date: '2024-03-01', pageViews: 1678, uniqueVisitors: 1245 },
  { date: '2024-04-01', pageViews: 1534, uniqueVisitors: 1123 },
  { date: '2024-05-01', pageViews: 1789, uniqueVisitors: 1456 },
  { date: '2024-06-01', pageViews: 2012, uniqueVisitors: 1634 },
  { date: '2024-07-01', pageViews: 2234, uniqueVisitors: 1789 },
  { date: '2024-08-01', pageViews: 2456, uniqueVisitors: 1923 },
  { date: '2024-09-01', pageViews: 2678, uniqueVisitors: 2134 }
];

const topPerformingJobs = [
  { id: 1, title: "Software Engineer", company: "TechCorp", applications: 156, views: 2340 },
  { id: 2, title: "Data Scientist", company: "DataLabs", applications: 142, views: 2180 },
  { id: 3, title: "Product Manager", company: "InnovateCorp", applications: 134, views: 1980 },
  { id: 4, title: "DevOps Engineer", company: "CloudTech", applications: 128, views: 1890 },
  { id: 5, title: "UI/UX Designer", company: "DesignStudio", applications: 118, views: 1756 }
];

const recentActivities = [
  { time: "2 minutes ago", action: "New job posting", details: "Software Engineer at TechCorp", type: "job" },
  { time: "15 minutes ago", action: "Alumni registration", details: "Priya Sharma (CSE 2020)", type: "user" },
  { time: "32 minutes ago", action: "Company verification", details: "Microsoft India approved", type: "company" },
  { time: "1 hour ago", action: "Bulk email sent", details: "Weekly newsletter to 2,456 alumni", type: "email" },
  { time: "2 hours ago", action: "System backup", details: "Database backup completed", type: "system" }
];

export default function Analytics() {
  const exportAnalytics = () => {
    const csvContent = [
      ["Metric", "Value", "Period"],
      ["Total Users", "2,847", "All Time"],
      ["Alumni Registered", "1,245", "All Time"],
      ["Active Companies", "140", "Current"],
      ["Job Postings", "456", "All Time"],
      ["Applications", "12,456", "All Time"],
      ["Page Views", "2,678", "September 2024"],
      ["Unique Visitors", "2,134", "September 2024"]
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor platform performance and user engagement
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">2,847</div>
            <div className="flex items-center text-xs text-success">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.3% from last month
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">140</div>
            <div className="flex items-center text-xs text-success">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.7% from last month
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Job Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">12,456</div>
            <div className="flex items-center text-xs text-success">
              <TrendingUp className="h-3 w-3 mr-1" />
              +24.1% from last month
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">2.67K</div>
            <div className="flex items-center text-xs text-destructive">
              <TrendingDown className="h-3 w-3 mr-1" />
              -3.2% from last month
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Registration Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={registrationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="alumni" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="students" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="faculty" stackId="1" stroke="#ffc658" fill="#ffc658" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Company Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={companyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {companyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Weekly Job Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jobApplicationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applications" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Platform Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="pageViews" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="uniqueVisitors" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-1">
                    <div className="font-medium">{job.title}</div>
                    <div className="text-sm text-muted-foreground">{job.company}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-semibold">{job.applications} apps</div>
                    <div className="text-sm text-muted-foreground">{job.views} views</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'job' ? 'bg-primary' :
                    activity.type === 'user' ? 'bg-success' :
                    activity.type === 'company' ? 'bg-warning' :
                    activity.type === 'email' ? 'bg-info' :
                    'bg-muted-foreground'
                  }`} />
                  <div className="space-y-1 flex-1">
                    <div className="font-medium">{activity.action}</div>
                    <div className="text-sm text-muted-foreground">{activity.details}</div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Application Rate</span>
              <Badge variant="secondary">23.4%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Interview Rate</span>
              <Badge variant="secondary">8.7%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Hiring Rate</span>
              <Badge variant="secondary">2.3%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">System Uptime</span>
              <Badge className="bg-success text-success-foreground">99.9%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Response Time</span>
              <Badge variant="secondary">142ms</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Error Rate</span>
              <Badge className="bg-success text-success-foreground">0.01%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Satisfaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Overall Rating</span>
              <Badge className="bg-success text-success-foreground">4.8/5</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Feature Requests</span>
              <Badge variant="secondary">23</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Bug Reports</span>
              <Badge className="bg-success text-success-foreground">2</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}