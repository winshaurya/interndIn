import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

const data = [
  { name: "Post A", applications: 15 },
  { name: "Post B", applications: 23 },
  { name: "Post C", applications: 18 },
  { name: "Post D", applications: 20 },
];

export function ApplicationChart() {
  const navigate = useNavigate();

  return (
    <Card className="gradient-card shadow-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Applications Per Post</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/alumni/applications')}
            className="flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>View All</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                className="text-sm text-muted-foreground"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-sm text-muted-foreground"
              />
              <Bar 
                dataKey="applications" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
