import { useState } from "react";
import { useData } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { format, subMonths, startOfYear } from "date-fns";
import { Calendar as CalendarIcon, Filter } from "lucide-react";

export default function Reports() {
  const { teachers, students, getTeacherWorkHours, getStudentAttendanceReport } = useData();
  
  // Teacher Report State
  const [teacherReportMonth, setTeacherReportMonth] = useState<Date>(new Date());
  
  // Student Report State
  const [filterType, setFilterType] = useState<'day' | 'month' | 'year'>('month');
  const [filterDate, setFilterDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [filterMonth, setFilterMonth] = useState<Date>(new Date());
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());


  // --- Teacher Data Prep ---
  const teacherHoursData = teachers.map(teacher => ({
    name: teacher.name,
    hours: getTeacherWorkHours(teacher.id, teacherReportMonth).toFixed(1),
  }));

  // --- Student Data Prep ---
  let studentReportData = [];
  if (filterType === 'day') {
      const date = new Date(filterDate);
      const report = getStudentAttendanceReport({ date });
      studentReportData = report.map(r => {
          const s = students.find(st => st.id === r.studentId);
          return {
              name: s?.name || 'Unknown',
              rate: r.total > 0 ? (r.present / r.total) * 100 : 0,
              present: r.present,
              total: r.total,
              grade: s?.grade
          };
      });
  } else if (filterType === 'month') {
      const report = getStudentAttendanceReport({ month: filterMonth });
      studentReportData = report.map(r => {
          const s = students.find(st => st.id === r.studentId);
          return {
              name: s?.name || 'Unknown',
              rate: r.total > 0 ? (r.present / r.total) * 100 : 0,
              present: r.present,
              total: r.total,
              grade: s?.grade
          };
      });
  } else {
      const report = getStudentAttendanceReport({ year: parseInt(filterYear) });
      studentReportData = report.map(r => {
          const s = students.find(st => st.id === r.studentId);
          return {
              name: s?.name || 'Unknown',
              rate: r.total > 0 ? (r.present / r.total) * 100 : 0,
              present: r.present,
              total: r.total,
              grade: s?.grade
          };
      });
  }

  // Sort by name
  studentReportData.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">Comprehensive insights into school performance.</p>
      </div>

      <Tabs defaultValue="teachers" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-8">
          <TabsTrigger value="teachers">Teacher Work Hours</TabsTrigger>
          <TabsTrigger value="students">Student Attendance</TabsTrigger>
        </TabsList>

        {/* TEACHER REPORTS */}
        <TabsContent value="teachers" className="space-y-6">
          <div className="flex justify-end">
            <Select 
              value={teacherReportMonth.toISOString()} 
              onValueChange={(val) => setTeacherReportMonth(new Date(val))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value={new Date().toISOString()}>{format(new Date(), 'MMMM yyyy')}</SelectItem>
                 <SelectItem value={subMonths(new Date(), 1).toISOString()}>{format(subMonths(new Date(), 1), 'MMMM yyyy')}</SelectItem>
                 <SelectItem value={subMonths(new Date(), 2).toISOString()}>{format(subMonths(new Date(), 2), 'MMMM yyyy')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Hours Logged</CardTitle>
                <CardDescription>Total duration of sessions taught in {format(teacherReportMonth, 'MMMM')}</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teacherHoursData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" unit="h" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                 <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-muted text-muted-foreground uppercase font-medium">
                       <tr>
                         <th className="px-4 py-3 rounded-l-md">Teacher</th>
                         <th className="px-4 py-3">Work Hours</th>
                         <th className="px-4 py-3 rounded-r-md">Status</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-border/50">
                       {teacherHoursData.map((row, i) => (
                         <tr key={i} className="hover:bg-muted/50 transition-colors">
                           <td className="px-4 py-3 font-medium">{row.name}</td>
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
        </TabsContent>

        {/* STUDENT REPORTS */}
        <TabsContent value="students" className="space-y-6">
          <Card className="border-none shadow-sm bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="space-y-2 w-full md:w-auto">
                   <label className="text-sm font-medium">Filter By</label>
                   <div className="flex rounded-md shadow-sm">
                     <Button 
                       variant={filterType === 'day' ? "default" : "outline"} 
                       className="rounded-r-none w-20"
                       onClick={() => setFilterType('day')}
                     >
                       Day
                     </Button>
                     <Button 
                       variant={filterType === 'month' ? "default" : "outline"} 
                       className="rounded-none w-20 border-l-0 border-r-0"
                       onClick={() => setFilterType('month')}
                     >
                       Month
                     </Button>
                     <Button 
                       variant={filterType === 'year' ? "default" : "outline"} 
                       className="rounded-l-none w-20"
                       onClick={() => setFilterType('year')}
                     >
                       Year
                     </Button>
                   </div>
                </div>

                <div className="space-y-2 flex-1">
                   <label className="text-sm font-medium">Select Period</label>
                   {filterType === 'day' && (
                      <input 
                        type="date" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                      />
                   )}
                   {filterType === 'month' && (
                      <Select 
                        value={filterMonth.toISOString()} 
                        onValueChange={(val) => setFilterMonth(new Date(val))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent>
                           {/* Generate last 12 months */}
                           {Array.from({ length: 12 }).map((_, i) => {
                              const d = subMonths(new Date(), i);
                              return <SelectItem key={i} value={d.toISOString()}>{format(d, 'MMMM yyyy')}</SelectItem>
                           })}
                        </SelectContent>
                      </Select>
                   )}
                   {filterType === 'year' && (
                      <Select 
                        value={filterYear} 
                        onValueChange={setFilterYear}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="2024">2024</SelectItem>
                           <SelectItem value="2023">2023</SelectItem>
                           <SelectItem value="2025">2025</SelectItem>
                        </SelectContent>
                      </Select>
                   )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
               <CardTitle>Attendance Report</CardTitle>
               <CardDescription>
                  Showing records for {filterType === 'day' ? filterDate : filterType === 'month' ? format(filterMonth, 'MMMM yyyy') : filterYear}
               </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-muted text-muted-foreground uppercase font-medium">
                     <tr>
                       <th className="px-4 py-3 rounded-l-md">Student Name</th>
                       <th className="px-4 py-3">Grade</th>
                       <th className="px-4 py-3">Attendance Rate</th>
                       <th className="px-4 py-3">Sessions Attended</th>
                       <th className="px-4 py-3 rounded-r-md">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border/50">
                     {studentReportData.map((row, i) => (
                       <tr key={i} className="hover:bg-muted/50 transition-colors">
                         <td className="px-4 py-3 font-medium">{row.name}</td>
                         <td className="px-4 py-3 text-muted-foreground">{row.grade}</td>
                         <td className="px-4 py-3 font-bold">
                            <div className="flex items-center gap-2">
                               <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${row.rate >= 90 ? 'bg-emerald-500' : row.rate >= 75 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                    style={{ width: `${row.rate}%` }}
                                  />
                               </div>
                               {row.rate.toFixed(0)}%
                            </div>
                         </td>
                         <td className="px-4 py-3 text-muted-foreground">
                           {row.present} / {row.total}
                         </td>
                         <td className="px-4 py-3">
                           <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                             row.rate >= 90 ? 'bg-emerald-100 text-emerald-800' : 
                             row.rate >= 75 ? 'bg-amber-100 text-amber-800' : 
                             'bg-red-100 text-red-800'
                           }`}>
                             {row.rate >= 90 ? 'Excellent' : row.rate >= 75 ? 'Fair' : 'Poor'}
                           </span>
                         </td>
                       </tr>
                     ))}
                     {studentReportData.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-8 text-muted-foreground">No records found for this period.</td>
                        </tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
