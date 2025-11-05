import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const skillData = [
  { name: "Python", demand: 115 },
  { name: "JavaScript", demand: 95 },
  { name: "React", demand: 110 },
  { name: "UI/UX Design", demand: 85 },
  { name: "Data Science", demand: 75 },
];

export default function SkillTrends() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Skill Demand Trends</CardTitle>
        <p className="text-sm text-muted-foreground">Average demand across industries.</p>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skillData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12 }}
                domain={[0, 120]}
              />
              <Bar 
                dataKey="demand" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}