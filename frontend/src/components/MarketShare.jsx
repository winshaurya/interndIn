import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const marketData = [
  { name: "Web Development", value: 35, color: "hsl(var(--chart-1))" },
  { name: "Data Science", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Cloud Engineering", value: 20, color: "hsl(var(--chart-3))" },
  { name: "Cybersecurity", value: 20, color: "hsl(var(--chart-4))" },
];

export default function MarketShare() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Market Share by Domain</CardTitle>
        <p className="text-sm text-muted-foreground">Distribution of opportunities.</p>
      </CardHeader>
      <CardContent>
        <div className="h-48 flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={marketData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
                className="focus:outline-none"
              >
                {marketData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {marketData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}</span>
              </div>
              <span className="font-medium">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}