import { useData } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, GraduationCap, Calendar, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { teachers, students, sessions, attendance } = useData();

  // Calculate some quick stats
  const totalTeachers = teachers.length;
  const totalStudents = students.length;
  const activeSessions = sessions.length;
  
  // Calculate average attendance rate for the current month
  // Simple approximation: (Total Present / (Sessions * Avg Class Size)) * 100
  const totalRecords = attendance.length;
  let totalPresent = 0;
  let totalPossible = 0;
  
  attendance.forEach(record => {
     const session = sessions.find(s => s.id === record.sessionId);
     if (session) {
       totalPossible += session.studentIds.length;
       totalPresent += record.presentStudentIds.length;
     }
  });
  
  const avgAttendance = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;

  const stats = [
    {
      title: "Total Teachers",
      value: totalTeachers,
      icon: Users,
      description: "Active faculty members",
      trend: "+2 this month",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Total Students",
      value: totalStudents,
      icon: GraduationCap,
      description: "Enrolled students",
      trend: "+5 this month",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Active Sessions",
      value: activeSessions,
      icon: Calendar,
      description: "Weekly classes",
      trend: "Stable",
      color: "text-violet-500",
      bg: "bg-violet-500/10"
    },
    {
      title: "Avg Attendance",
      value: `${avgAttendance}%`,
      icon: TrendingUp,
      description: "Current month rate",
      trend: "+1.2%",
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of school performance and activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>
              Latest classes marked by teachers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendance.slice(-5).reverse().map((record) => {
                const session = sessions.find(s => s.id === record.sessionId);
                const teacher = teachers.find(t => t.id === record.teacherId);
                const rate = session ? Math.round((record.presentStudentIds.length / session.studentIds.length) * 100) : 0;
                
                return (
                  <div key={record.id} className="flex items-center justify-between border-b border-border/50 last:border-0 pb-4 last:pb-0">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{session?.name || 'Unknown Session'}</span>
                      <span className="text-xs text-muted-foreground">Marked by {teacher?.name} • {record.date}</span>
                    </div>
                    <div className={`text-sm font-bold ${rate >= 90 ? 'text-emerald-600' : rate >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                      {rate}% Present
                    </div>
                  </div>
                );
              })}
              {attendance.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">No attendance records yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-sm bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-primary-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
             <div className="bg-white/10 p-3 rounded-md hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-3">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Schedule New Session</span>
             </div>
             <div className="bg-white/10 p-3 rounded-md hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-3">
                <Users className="h-5 w-5" />
                <span className="font-medium">Register New Teacher</span>
             </div>
             <div className="bg-white/10 p-3 rounded-md hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-3">
                <GraduationCap className="h-5 w-5" />
                <span className="font-medium">Enroll Student</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
