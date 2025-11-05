import { Eye, MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const applicants = [
  {
    id: 1,
    name: "John Doe",
    degree: "Computer Science",
    skills: ["React", "Node.js"],
    rating: 4.8,
    cgpa: "8.5",
  },
  {
    id: 2,
    name: "Jane Smith",
    degree: "Computer Science", 
    skills: ["Python", "ML"],
    rating: 4.6,
    cgpa: "8.2",
  },
  {
    id: 3,
    name: "Bob Johnson",
    degree: "Information Technology",
    skills: ["JavaScript", "React"],
    rating: 4.4,
    cgpa: "7.9",
  },
];

export function TopApplicants() {
  return (
    <Card className="gradient-card shadow-glow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Top Applicants</CardTitle>
        <select className="rounded-md border border-input bg-background px-3 py-1 text-sm">
          <option>All Postings</option>
          <option>Software Engineer</option>
          <option>Data Analyst</option>
        </select>
      </CardHeader>
      <CardContent className="space-y-4">
        {applicants.map((applicant) => (
          <div
            key={applicant.id}
            className="flex items-center space-x-4 rounded-lg border border-border/50 p-4 transition-all hover:bg-accent/50"
          >
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {applicant.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{applicant.name}</h4>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="text-sm font-medium">{applicant.rating}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{applicant.degree}</p>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">CGPA: {applicant.cgpa}</span>
                <div className="flex space-x-1">
                  {applicant.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">View</span>
              </Button>
              <Button size="sm" variant="outline">
                <MessageSquare className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Contact</span>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}