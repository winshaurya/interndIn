import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickAccess() {
  const navigate = useNavigate();
  return (
    <Card className="gradient-card shadow-glow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          size="sm" 
          className="w-full"
          onClick={() => navigate("/alumni/postings")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => navigate("/alumni/postings")}
        >
          <Users className="h-4 w-4 mr-2" />
          View All Postings
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => navigate("/alumni/add-company")}
        >
          <FileText className="h-4 w-4 mr-2" />
          Edit Company
        </Button>
      </CardContent>
    </Card>
  );
}