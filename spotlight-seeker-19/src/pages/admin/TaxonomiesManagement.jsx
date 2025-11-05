import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  GitBranch, 
  Users, 
  Search,
  Link,
  BookOpen
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";

const mockSkills = [
  {
    id: "1",
    name: "JavaScript",
    category: "Programming Languages",
    synonyms: ["JS", "ECMAScript", "Node.js"],
    jobCount: 45,
    userCount: 234,
    trending: true
  },
  {
    id: "2", 
    name: "Machine Learning",
    category: "AI/ML",
    synonyms: ["ML", "Artificial Intelligence", "AI"],
    jobCount: 28,
    userCount: 156,
    trending: true
  },
  {
    id: "3",
    name: "React",
    category: "Frontend Frameworks",
    synonyms: ["ReactJS", "React.js"],
    jobCount: 38,
    userCount: 198,
    trending: true
  },
  {
    id: "4",
    name: "Data Analysis",
    category: "Analytics",
    synonyms: ["Data Analytics", "Business Intelligence", "BI"],
    jobCount: 22,
    userCount: 89,
    trending: false
  },
  {
    id: "5",
    name: "Python",
    category: "Programming Languages", 
    synonyms: ["Python3", "Django", "Flask"],
    jobCount: 52,
    userCount: 276,
    trending: true
  }
];

const mockBranches = [
  {
    id: "1",
    name: "Computer Science Engineering",
    code: "CSE",
    department: "Engineering",
    studentCount: 240,
    alumniCount: 1200,
    activeJobs: 45
  },
  {
    id: "2",
    name: "Information Technology",
    code: "IT", 
    department: "Engineering",
    studentCount: 180,
    alumniCount: 890,
    activeJobs: 32
  },
  {
    id: "3",
    name: "Electronics & Communication",
    code: "ECE",
    department: "Engineering", 
    studentCount: 120,
    alumniCount: 650,
    activeJobs: 18
  },
  {
    id: "4",
    name: "Mechanical Engineering",
    code: "ME",
    department: "Engineering",
    studentCount: 160,
    alumniCount: 780,
    activeJobs: 12
  },
  {
    id: "5",
    name: "Master of Business Administration",
    code: "MBA",
    department: "Management",
    studentCount: 80,
    alumniCount: 320,
    activeJobs: 8
  }
];

const mockSynonyms = [
  { id: "1", primarySkill: "JavaScript", synonym: "JS", frequency: 89 },
  { id: "2", primarySkill: "Machine Learning", synonym: "ML", frequency: 156 },
  { id: "3", primarySkill: "React", synonym: "ReactJS", frequency: 134 },
  { id: "4", primarySkill: "Python", synonym: "Python3", frequency: 98 },
  { id: "5", primarySkill: "Data Analysis", synonym: "Data Analytics", frequency: 67 }
];

export default function TaxonomiesManagement() {
  const [skillSearchTerm, setSkillSearchTerm] = useState("");
  const [branchSearchTerm, setBranchSearchTerm] = useState("");
  const [skills, setSkills] = useState(mockSkills);
  const [branches, setBranches] = useState(mockBranches);
  const [synonyms, setSynonyms] = useState(mockSynonyms);

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase()) ||
    skill.category.toLowerCase().includes(skillSearchTerm.toLowerCase()) ||
    skill.synonyms.some(synonym => 
      synonym.toLowerCase().includes(skillSearchTerm.toLowerCase())
    )
  );

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(branchSearchTerm.toLowerCase()) ||
    branch.code.toLowerCase().includes(branchSearchTerm.toLowerCase()) ||
    branch.department.toLowerCase().includes(branchSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Taxonomies Management</h1>
          <p className="text-muted-foreground">Manage skills, branches, and data mappings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Skills"
          value="156"
          icon={Tag}
          variant="default"
        />
        <StatCard
          title="Active Branches"
          value="12"
          icon={GitBranch}
          variant="success"
        />
        <StatCard
          title="Skill Mappings"
          value="89"
          icon={Link}
          variant="default"
        />
        <StatCard
          title="Categories"
          value="18"
          icon={BookOpen}
          variant="default"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="skills" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="skills">Skills Management</TabsTrigger>
          <TabsTrigger value="branches">Branch Definitions</TabsTrigger>
          <TabsTrigger value="mappings">Synonym Mappings</TabsTrigger>
        </TabsList>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Skills Database</CardTitle>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search skills, categories, or synonyms..."
                  value={skillSearchTerm}
                  onChange={(e) => setSkillSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Skill Details</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Synonyms</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSkills.map((skill) => (
                    <TableRow key={skill.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-foreground">{skill.name}</div>
                          {skill.trending && (
                            <Badge variant="secondary" className="bg-success text-success-foreground text-xs">
                              Trending
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-sm">
                          {skill.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {skill.synonyms.slice(0, 3).map((synonym, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {synonym}
                            </Badge>
                          ))}
                          {skill.synonyms.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{skill.synonyms.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div><span className="text-muted-foreground">Jobs:</span> {skill.jobCount}</div>
                          <div><span className="text-muted-foreground">Users:</span> {skill.userCount}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Branch Definitions</CardTitle>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Branch
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search branches, codes, or departments..."
                  value={branchSearchTerm}
                  onChange={(e) => setBranchSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch Information</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Current Students</TableHead>
                    <TableHead>Alumni</TableHead>
                    <TableHead>Active Jobs</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBranches.map((branch) => (
                    <TableRow key={branch.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground">{branch.name}</div>
                          <div className="text-sm text-muted-foreground">Code: {branch.code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{branch.department}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{branch.studentCount.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{branch.alumniCount.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-primary">{branch.activeJobs}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mappings Tab */}
        <TabsContent value="mappings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Skill Synonym Mappings</CardTitle>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Mapping
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Primary Skill</TableHead>
                    <TableHead>Synonym</TableHead>
                    <TableHead>Usage Frequency</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {synonyms.map((mapping) => (
                    <TableRow key={mapping.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="font-semibold text-foreground">{mapping.primarySkill}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{mapping.synonym}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold">{mapping.frequency}</div>
                          <div className="text-xs text-muted-foreground">occurrences</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}