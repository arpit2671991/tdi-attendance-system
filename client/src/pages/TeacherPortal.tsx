import { useState, useEffect } from "react";
import { useSessions, useStudents, useCreateAttendance, useAttendance } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Save, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeacherPortal() {
  const { user: currentUser } = useAuth();
  const { data: sessions = [], isLoading: loadingSessions } = useSessions();
  const { data: students = [], isLoading: loadingStudents } = useStudents();
  const { data: allAttendance = [] } = useAttendance();
  const createAttendance = useCreateAttendance();
  
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [presentStudents, setPresentStudents] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const teacherSessions = sessions.filter(s => s.teacherId === currentUser?.id);
  
  const currentSession = sessions.find(s => s.id === selectedSessionId);
  const sessionStudents = currentSession 
    ? students.filter(student => currentSession.studentIds.includes(student.id))
    : [];

  const handleSessionChange = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    const existing = allAttendance.find(
      a => a.sessionId === sessionId && a.date === currentDate
    );
    if (existing) {
      setPresentStudents(existing.presentStudentIds);
    } else {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
         setPresentStudents(session.studentIds);
      }
    }
  };

  useEffect(() => {
    if (selectedSessionId) {
      const existing = allAttendance.find(
        a => a.sessionId === selectedSessionId && a.date === currentDate
      );
      if (existing) {
        setPresentStudents(existing.presentStudentIds);
      } else {
        const session = sessions.find(s => s.id === selectedSessionId);
        if (session) {
           setPresentStudents(session.studentIds);
        }
      }
    }
  }, [currentDate, selectedSessionId, allAttendance, sessions]);

  const toggleStudent = (studentId: string) => {
    setPresentStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = async () => {
    if (!currentSession || !currentUser) return;

    if (currentDate < currentSession.startDate || currentDate > currentSession.endDate) {
       return;
    }

    const [startH, startM] = currentSession.startTime.split(':').map(Number);
    const [endH, endM] = currentSession.endTime.split(':').map(Number);
    const duration = (endH + endM/60) - (startH + startM/60);

    await createAttendance.mutateAsync({
      date: currentDate,
      sessionId: currentSession.id,
      teacherId: currentUser.id,
      presentStudentIds: presentStudents,
      durationHours: duration
    });
  };

  if (!currentUser) return null;

  if (loadingSessions || loadingStudents) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-heading font-bold tracking-tight">My Classes</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Card className="shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight">My Classes</h1>
        <p className="text-muted-foreground">Welcome, {currentUser.name}. Mark daily attendance below.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Attendance Register</CardTitle>
            <CardDescription>
               Select a class and date to proceed.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
             <input 
               type="date" 
               className="border rounded-md px-3 py-1 text-sm bg-background"
               value={currentDate}
               onChange={(e) => setCurrentDate(e.target.value)}
               data-testid="input-attendance-date"
             />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Session</label>
            <Select value={selectedSessionId} onValueChange={handleSessionChange}>
              <SelectTrigger data-testid="select-session">
                <SelectValue placeholder="Choose one of your classes..." />
              </SelectTrigger>
              <SelectContent>
                {teacherSessions.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.startTime} - {s.endTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {teacherSessions.length === 0 && (
              <p className="text-sm text-amber-600 flex items-center gap-2 mt-2">
                <AlertCircle className="h-4 w-4" /> You are not assigned to any sessions yet.
              </p>
            )}
          </div>

          {currentSession && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-semibold text-sm text-muted-foreground">Student List</span>
                <span className="text-xs font-medium bg-secondary px-2 py-1 rounded-full">
                  {presentStudents.length} Present
                </span>
              </div>
              
              <div className="space-y-2">
                {sessionStudents.map(student => (
                  <div 
                    key={student.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      presentStudents.includes(student.id) 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-background border-border hover:bg-muted/50'
                    }`}
                    onClick={() => toggleStudent(student.id)}
                    data-testid={`student-attendance-${student.id}`}
                  >
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                         presentStudents.includes(student.id) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                       }`}>
                         {student.name.charAt(0)}
                       </div>
                       <div>
                         <p className="font-medium text-sm">{student.name}</p>
                         <p className="text-xs text-muted-foreground">{student.grade}</p>
                       </div>
                    </div>
                    <Checkbox 
                      checked={presentStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={handleSubmit} 
                  className="w-full sm:w-auto gap-2"
                  disabled={createAttendance.isPending}
                  data-testid="button-save-attendance"
                >
                  <Save className="h-4 w-4" />
                  Save Attendance
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
