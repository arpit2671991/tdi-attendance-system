import { useState, useMemo, useEffect } from "react";
import { 
  useSessions, 
  useAttendance, 
  useMarkAttendance, 
  useMarkTeacherAttendance, 
  useSessionEnrollmentsBySession,
  useStudents,
  useSessionExceptions,
  useAllSessionExceptions
} from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Save, GraduationCap, CheckSquare, RefreshCcw, Search, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { attendanceApi } from "@/lib/api";

export default function TeacherPortal() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  // FIXED DATE: Teachers can only mark attendance for today
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  
  const [studentFilter, setStudentFilter] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [presentStudents, setPresentStudents] = useState<string[]>([]);
  const [durationHours, setDurationHours] = useState<number | null>(null);

  const { data: allSessions = [] } = useSessions();
  // const { data: allExceptions = [] } = useSessionExceptions();

  const { data: allExceptions = [] } = useAllSessionExceptions(today);
  
  const { data: students = [] } = useStudents();
  const { data: enrollments = [] } = useSessionEnrollmentsBySession(selectedSessionId);
  
  const { data: existingAttendance = [], refetch: refetchAttendance } = useAttendance({
    sessionId: selectedSessionId,
    date: today, // Always fetch for today
  });

  const markStudentAttendance = useMarkAttendance();
  const markTeacherAttendance = useMarkTeacherAttendance();

  // Filter sessions only for the logged-in teacher
const teacherSessions = useMemo(() => {
  // Ensure allExceptions is treated as an array even if it's undefined or an error object
  const exceptionsList = Array.isArray(allExceptions) ? allExceptions : [];

  return allSessions.filter(s => {
    const isMySession = s.teacherId === currentUser?.id;

    const isCancelledToday = exceptionsList.some(ex => 
      String(ex.sessionId) === String(s.id) && 
      ex.status === "cancelled"
    );

    return isMySession && !isCancelledToday;
  });
}, [allSessions, allExceptions, currentUser?.id]);
  const studentMap = useMemo(() => {
    return students.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {} as Record<string, string>);
  }, [students]);

  const filteredEnrollments = useMemo(() => {
    // 1. First, only include students that are active in the system
  const activeEnrollments = enrollments.filter(e => {
    const student = students.find(s => s.id === e.studentId);
    return student?.isActive !== false; // Only show if explicitly active
  });
    if (!studentFilter.trim()) return activeEnrollments;
    const q = studentFilter.toLowerCase();
    return activeEnrollments.filter(e => studentMap[e.studentId]?.toLowerCase().includes(q));
  }, [enrollments, studentFilter, studentMap, students]);

  const syncAttendanceData = () => {
    if (existingAttendance.length > 0) {
      const presentIds = existingAttendance
        .filter(a => a.status === "present" && a.studentId)
        .map(a => a.studentId!);
      setPresentStudents(presentIds);
      
      const teacherRec = existingAttendance.find(a => a.teacherId === currentUser?.id);
      if (teacherRec) setDurationHours(teacherRec.durationHours);
    } else {
      // Default Logic:
    // Only automatically check "Present" for students who are ACTIVE
    const activeStudentIds = enrollments
      .filter(e => {
        const student = students.find(s => s.id === e.studentId);
        return student?.isActive !== false;
      })
      .map(e => e.studentId);
      setPresentStudents(activeStudentIds);
    setDurationHours(null);
    }
  };

  useEffect(() => {
    if (selectedSessionId) syncAttendanceData();
  }, [existingAttendance.length, enrollments.length, selectedSessionId]);

  const toggleStudent = (id: string) => {
    setPresentStudents(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // const handleSubmit = async () => {
  //   if (!selectedSessionId || !currentUser?.id || !durationHours) {
  //     toast({ variant: "destructive", title: "Error", description: "Please select a duration." });
  //     return;
  //   }

  //   try {
  //     await markTeacherAttendance.mutateAsync({
  //       sessionId: selectedSessionId,
  //       teacherId: currentUser.id,
  //       date: today,
  //       durationHours,
  //       status: "present",
  //     });

  //     const promises = enrollments.map(e => {
  //       const isPresent = presentStudents.includes(e.studentId);
  //       return markStudentAttendance.mutateAsync({
  //         sessionId: selectedSessionId,
  //         studentId: e.studentId,
  //         date: today,
  //         status: isPresent ? "present" : "absent",
  //         durationHours: isPresent ? durationHours : 0,
  //         markedBy: currentUser?.id,
  //       });
  //     });

  //     await Promise.all(promises);
  //     await refetchAttendance();
  //     toast({ title: "Success", description: "Attendance for today has been saved." });
  //   } catch (err) {
  //     toast({ variant: "destructive", title: "Error", description: "Failed to save records." });
  //   }
  // };

const handleSubmit = async () => {
  if (!selectedSessionId || !currentUser?.id || !durationHours) {
    toast({ variant: "destructive", title: "Error", description: "Please select a duration." });
    return;
  }

  try {
    // 1. Mark Teacher Attendance
    await markTeacherAttendance.mutateAsync({
      sessionId: selectedSessionId,
      teacherId: currentUser?.id ,
      date: today,
      durationHours,
      status: "present",
    });

    // 2. Process Student Attendance
    const promises = enrollments.map(async (e) => {
      const isPresent = presentStudents.includes(e.studentId);
      
      // Default behavior: durationHours is preserved regardless of status
      let finalDurationHours = durationHours; 

      if (!isPresent) {
        // Fetch history to check for the 3rd consecutive absence
        const history = await attendanceApi.get({ 
          sessionId: selectedSessionId, 
          studentId: e.studentId 
        });

        const lastTwoRecords = history
          .filter(r => r.date !== today)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 2);

        const previousAbsenceCount = lastTwoRecords.filter(r => r.status === "absent").length;

        // ONLY if this is exactly the 3rd time in a row, we force the hours to 0
        if (previousAbsenceCount === 2) {
          finalDurationHours = 0; 
          
          // Trigger the notification for the admin
          // notificationApi.create({...})
        }
      }

      return markStudentAttendance.mutateAsync({
        sessionId: selectedSessionId,
        studentId: e.studentId,
        date: today,
        status: isPresent ? "present" : "absent",
        durationHours: finalDurationHours, // 0 only on the 3rd strike, else session duration
        markedBy: currentUser?.id,
      });
    });

    await Promise.all(promises);
    await refetchAttendance();
    toast({ title: "Success", description: "Attendance records processed." });
  } catch (err) {
    console.error(err);
    toast({ variant: "destructive", title: "Error", description: "Failed to save records." });
  }
};
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Teacher Portal</h1>
            <p className="text-sm text-muted-foreground font-medium">Teacher: {currentUser?.name}</p>
          </div>
        </div>
        
        {/* Read-only Date Display */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 border rounded-full text-slate-600 shadow-sm">
          <CalendarDays className="h-4 w-4" />
          <span className="text-sm font-semibold">{format(new Date(), "PPP")}</span>
        </div>
      </div>

      {/* Session Selection */}
      <Card className="bg-slate-50 border-none shadow-sm">
        <CardHeader className="py-3 px-6"><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Your Active Sessions</CardTitle></CardHeader>
        <CardContent className="px-6 pb-6">
          <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
            <SelectTrigger className="bg-white border-slate-200">
              <SelectValue placeholder="Select a session to begin" />
            </SelectTrigger>
            <SelectContent>
              {teacherSessions.length > 0 ? (
                teacherSessions.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)
              ) : (
                <div className="p-2 text-sm text-center text-muted-foreground">No sessions assigned today.</div>
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedSessionId && (
        <Card className="border-t-4 border-primary shadow-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 p-6">
            <div>
              <CardTitle className="text-lg">Attendance Register</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Marking presence for today's class</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 border rounded-md px-2 bg-white h-9 shadow-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Find student..."
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                  className="border-none focus-visible:ring-0 h-full w-40 text-sm"
                />
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={syncAttendanceData} title="Reset to saved">
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-8">
            {/* Class Duration Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">How long was today's class?</label>
              <div className="flex flex-wrap gap-2">
                {[0.5, 1, 1.5, 2, 2.5, 3, 4].map(h => (
                  <Button 
                    key={h} 
                    variant={durationHours === h ? "default" : "outline"} 
                    onClick={() => setDurationHours(h)}
                    className="rounded-full px-5 h-9"
                  >
                    {h}h
                  </Button>
                ))}
              </div>
            </div>

            {/* Student List */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                 <label className="text-sm font-bold text-slate-700">Student List ({presentStudents.length}/{enrollments.length})</label>
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary text-xs h-7"
                    onClick={() => setPresentStudents(enrollments.map(e => e.studentId))}
                  >
                   <CheckSquare className="h-3 w-3 mr-1" /> Mark all present
                 </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredEnrollments.map(e => {
                  const isPresent = presentStudents.includes(e.studentId);
                  return (
                    <div 
                      key={e.studentId} 
                      className={`flex items-center justify-between p-3 border rounded-lg transition-all cursor-pointer hover:shadow-sm ${isPresent ? 'bg-green-50/50 border-green-200' : 'bg-slate-50 border-slate-200 opacity-70'}`}
                      onClick={() => toggleStudent(e.studentId)}
                    >
                      <span className={`text-sm font-medium ${isPresent ? 'text-green-900' : 'text-slate-600'}`}>
                        {studentMap[e.studentId] || "Loading..."}
                      </span>
                      <Checkbox checked={isPresent} className={isPresent ? "data-[state=checked]:bg-green-600 border-green-600" : ""} />
                    </div>
                  );
                })}
              </div>
            </div>

            <Button 
              className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20" 
              onClick={handleSubmit} 
              disabled={!durationHours || markStudentAttendance.isPending}
            >
              <Save className="mr-2 h-5 w-5" />
              {markStudentAttendance.isPending ? "Submitting..." : "Submit Attendance"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}