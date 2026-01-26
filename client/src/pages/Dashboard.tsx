import { useTeachers, useStudents, useSessions, useAttendance, useDepartments } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, GraduationCap, Calendar, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { DailyAgenda } from "./DailyAgenda";
import { DailyAttendanceSummary } from "./DailyAttendanceSummary";
import { NotificationBell } from "./NotificationBell";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNotifications } from "@/lib/hooks"; // Add this

export default function Dashboard() {
  const { data: teachers = [], isLoading: loadingTeachers } = useTeachers();
  const { data: students = [], isLoading: loadingStudents } = useStudents();
  const { data: departments = [], isLoading: loadingDepartments } = useDepartments();
  const { data: sessions = [], isLoading: loadingSessions } = useSessions();
  const { data: attendance = [], isLoading: loadingAttendance } = useAttendance();
  const { data: notifications = [] } = useNotifications();

  const isLoading = loadingTeachers || loadingStudents || loadingDepartments || loadingSessions || loadingAttendance;

  const totalTeachers = teachers.length;
  const totalStudents = students.length;
  const totalDepartments = departments.length;
  const activeSessions = sessions.length;
  

  

  
 

  const stats = [
    {
      title: "Total Instructors",
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
      title: "Total Courses",
      value: totalDepartments,
      icon: GraduationCap,
      description: "Courses count",
      trend: "+5 this month",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Total Classes",
      value: activeSessions,
      icon: Calendar,
      description: "All classes",
      trend: "Stable",
      color: "text-violet-500",
      bg: "bg-violet-500/10"
    },
   
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-heading font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of Institutes performance and activity.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of institutes performance and activity.</p>
            <NotificationBell />
      </div>
   {notifications.length > 0 && (
  <div className="space-y-4 mb-6">
    {notifications.slice(0, 3).map((notif: any) => {
      // Find the student object that matches the ID in the notification
      const student = students.find((s: any) => s.id === notif.studentId);
      
      return (
        <Alert key={notif.id} variant="destructive" className="border-none shadow-sm bg-red-50 text-red-900 animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold flex items-center gap-2">
            Absence Threshold Reached: {student ? student.name : "Unknown Student"}
          </AlertTitle>
          <AlertDescription className="flex justify-between items-center mt-1">
            <span className="text-sm opacity-90">
              {notif.message}
            </span>
          </AlertDescription>
        </Alert>
      );
    })}
  </div>
)}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <Card className="col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Daily Clases Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyAgenda />  
          </CardContent>
        </Card>
           <Card className="col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Daily Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyAttendanceSummary />  
          </CardContent>
        </Card>
        
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
               
                
                return (
                  <div key={record.id} className="flex items-center justify-between border-b border-border/50 last:border-0 pb-4 last:pb-0">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{session?.name || 'Unknown Session'}</span>
                      <span className="text-xs text-muted-foreground">Marked by {teacher?.name} • {record.date}</span>
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
                <Link to="/classes" className="font-medium">Schedule New Session</Link>
             </div>
             <div className="bg-white/10 p-3 rounded-md hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-3">
                <Users className="h-5 w-5" />
                <Link to="/teachers" className="font-medium">Register New Teacher</Link>
             </div>
             <div className="bg-white/10 p-3 rounded-md hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-3">
                <GraduationCap className="h-5 w-5" />
                <Link to="/students" className="font-medium">Register New Student</Link>
             </div>
              <div className="bg-white/10 p-3 rounded-md hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-3">
                <Calendar className="h-5 w-5" />
                <Link to="/attendaces" className="font-medium">Mark Attendance</Link>
             </div>
          </CardContent>
        </Card>
      </div>
     
    </div>
  );
}
