import { useState } from "react";
import { useData } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { format, subMonths } from "date-fns";

export default function Reports() {
  const { teachers, getTeacherWorkHours, attendance } = useData();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // Prepare data for Teacher Hours Chart
  const teacherHoursData = teachers.map(teacher => ({
    name: teacher.name,
    hours: getTeacherWorkHours(teacher.id, selectedMonth).toFixed(1),
  }));

  // Mock Trend Data for "Attendance Over Time" (Last 6 months)
  const trendData = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), 5 - i);
    return {
      month: format(d, 'MMM'),
      rate: Math.floor(85 + Math.random() * 10), // Random 85-95%
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Monthly attendance and work hour analytics.</p>
        </div>
        
        <Select 
          value={selectedMonth.toISOString()} 
          onValueChange={(val) => setSelectedMonth(new Date(val))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
             {/* Mock last 3 months */}
             <SelectItem value={new Date().toISOString()}>{format(new Date(), 'MMMM yyyy')}</SelectItem>
             <SelectItem value={subMonths(new Date(), 1).toISOString()}>{format(subMonths(new Date(), 1), 'MMMM yyyy')}</SelectItem>
             <SelectItem value={subMonths(new Date(), 2).toISOString()}>{format(subMonths(new Date(), 2), 'MMMM yyyy')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Teacher Work Hours</CardTitle>
            <CardDescription>
              Total hours logged per teacher for {format(selectedMonth, 'MMMM')}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teacherHoursData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" unit="h" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>
              Average student attendance rate over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis unit="%" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: "hsl(var(--chart-2))", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
           <CardTitle>Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-muted text-muted-foreground uppercase font-medium">
                 <tr>
                   <th className="px-4 py-3 rounded-l-md">Teacher</th>
                   <th className="px-4 py-3">Total Sessions</th>
                   <th className="px-4 py-3">Work Hours</th>
                   <th className="px-4 py-3 rounded-r-md">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border/50">
                 {teacherHoursData.map((row, i) => (
                   <tr key={i} className="hover:bg-muted/50 transition-colors">
                     <td className="px-4 py-3 font-medium">{row.name}</td>
                     <td className="px-4 py-3 text-muted-foreground">
                        {/* Mock number of sessions */}
                        {Math.ceil(Number(row.hours) / 1.5)}
                     </td>
                     <td className="px-4 py-3 font-bold">{row.hours}h</td>
                     <td className="px-4 py-3">
                       <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                         Number(row.hours) > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                       }`}>
                         {Number(row.hours) > 0 ? 'Active' : 'No Logs'}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
