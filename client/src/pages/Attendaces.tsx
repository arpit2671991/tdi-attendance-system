import { useState, useMemo, useEffect } from "react";
import { 
  useSessions, 
  useAttendance, 
  useMarkAttendance, 
  useMarkTeacherAttendance, 
  useSessionEnrollmentsBySession,
  useStudents,
  useTeachers,
} from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Save, ShieldCheck, Calendar as CalendarIcon, CheckSquare, RefreshCcw, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { attendanceApi } from "@/lib/api";

export default function Attendances() {
 
  const [studentFilter, setStudentFilter] = useState("");
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  
  // Local state for the form
  const [presentStudents, setPresentStudents] = useState<string[]>([]);
  const [durationHours, setDurationHours] = useState<number | null>(null);

  const { data: teachers = [] } = useTeachers();
  const { data: allSessions = [] } = useSessions();
  const { data: students = [] } = useStudents();
  const { data: enrollments = [] } = useSessionEnrollmentsBySession(selectedSessionId);
  
  const { data: existingAttendance = [], refetch: refetchAttendance } = useAttendance({
    sessionId: selectedSessionId,
    date: selectedDate,
  });

  const markStudentAttendance = useMarkAttendance();
  const markTeacherAttendance = useMarkTeacherAttendance();

  const teacherSessions = useMemo(() => 
    allSessions.filter(s => s.teacherId === selectedTeacherId),
    [allSessions, selectedTeacherId]
  );

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

  return activeEnrollments.filter(e =>
    studentMap[e.studentId]?.toLowerCase().includes(q)
  );
}, [enrollments, studentFilter, studentMap, students]);

  // --- REPAIR: Manual Sync instead of useEffect loop ---
  const syncAttendanceData = () => {
    if (existingAttendance.length > 0) {
      const presentIds = existingAttendance
        .filter(a => a.status === "present" && a.studentId)
        .map(a => a.studentId!);
      setPresentStudents(presentIds);
      
      const teacherRec = existingAttendance.find(a => a.teacherId === selectedTeacherId);
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

  // Only sync when data is actually fetched or session/date explicitly changes
  useEffect(() => {
    if (selectedSessionId) {
      syncAttendanceData();
    }
  }, [existingAttendance.length, enrollments.length, selectedSessionId, selectedDate]);

  const toggleStudent = (id: string) => {
    setPresentStudents(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // const handleSubmit = async () => {
  //   if (!selectedSessionId || !selectedTeacherId || !durationHours) {
  //     toast({ variant: "destructive", title: "Error", description: "Incomplete form." });
  //     return;
  //   }

  //   try {
  //     try {
  //       await markTeacherAttendance.mutateAsync({
  //         sessionId: selectedSessionId,
  //         teacherId: selectedTeacherId,
  //         date: selectedDate,
  //         durationHours,
  //         status: "present",
  //       });
  //     } catch (err: any) {
  //       if (!JSON.stringify(err).includes("23505")) throw err;
  //     }
    
  //     const promises = enrollments.map(e => {
  //       const isPresent = presentStudents.includes(e.studentId);
  //       return markStudentAttendance.mutateAsync({
  //         sessionId: selectedSessionId,
  //         studentId: e.studentId,
  //         date: selectedDate,
  //         status: isPresent ? "present" : "absent",
  //         durationHours: isPresent ? durationHours : 0,
  //         markedBy: currentUser?.id,

  //       })
  //   });

  //     await Promise.all(promises);
  //     await refetchAttendance();
  //     toast({ title: "Success", description: "Records updated." });
  //   } catch (err) {
  //     toast({ variant: "destructive", title: "Error", description: "Save failed." });
  //   }
  // };

const handleSubmit = async () => {
  if (!selectedSessionId || !selectedTeacherId || !durationHours) {
    toast({ variant: "destructive", title: "Error", description: "Please select a duration." });
    return;
  }

  try {
    // 1. Mark Teacher Attendance
    await markTeacherAttendance.mutateAsync({
      sessionId: selectedSessionId,
      teacherId: selectedTeacherId,
      date: selectedDate,
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
          .filter(r => r.date !== selectedDate)
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
        date: selectedDate,
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

  if (currentUser?.role !== 'admin') return <div className="p-10 text-center">403 Forbidden</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Admin Override</h1>
        </div>
        <div className="flex items-center gap-2 border p-2 rounded-lg">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <Input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-none focus-visible:ring-0 w-36"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-50 border-none shadow-sm">
          <CardHeader className="py-3"><CardTitle className="text-xs uppercase">Teacher</CardTitle></CardHeader>
          <CardContent>
            <Select value={selectedTeacherId} onValueChange={(val) => { setSelectedTeacherId(val); setSelectedSessionId(""); }}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Select teacher" /></SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-none shadow-sm">
          <CardHeader className="py-3"><CardTitle className="text-xs uppercase">Session</CardTitle></CardHeader>
          <CardContent>
            <Select value={selectedSessionId} onValueChange={setSelectedSessionId} disabled={!selectedTeacherId}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Select session" /></SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {teacherSessions.map(s => <SelectItem key={s.id} value={s.id}>{s.name}<span
                        className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          s.session_type === "group"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {s.session_type}
                      </span></SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {selectedSessionId && (
        <Card className="border-t-4 border-primary shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/30 gap-4">
  <CardTitle className="text-lg">Class Register</CardTitle>

  <div className="flex items-center gap-2">
    {/* Student Search */}
    <div className="flex items-center gap-2 border rounded-lg px-2 bg-white">
      <Search className="h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Filter student..."
        value={studentFilter}
        onChange={(e) => setStudentFilter(e.target.value)}
        className="border-none focus-visible:ring-0 h-8 w-44"
      />
    </div>

    <Button
      variant="outline"
      size="sm"
      onClick={syncAttendanceData}
      title="Reset to saved data"
    >
      <RefreshCcw className="h-4 w-4" />
    </Button>

    <Button
      variant="outline"
      size="sm"
      onClick={() => setPresentStudents(filteredEnrollments.map(e => e.studentId))}
    >
      <CheckSquare className="h-4 w-4 mr-2" /> All Present
    </Button>
  </div>
</CardHeader>

          <CardContent className="p-6 space-y-8">
            <div className="space-y-3">
               <label className="text-sm font-bold">Teaching Duration</label>
               <div className="flex gap-2">
                {[0.5, 1, 2, 2.5, 3, 3.5, 4].map(h => (
                  <Button 
                    key={h} 
                    variant={durationHours === h ? "default" : "outline"} 
                    onClick={() => setDurationHours(h)}
                    className="rounded-full"
                  >
                    {h}h
                  </Button>
                ))}
              </div>
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredEnrollments.map(e => (
                <div 
                  key={e.studentId} 
                  className={`flex items-center justify-between p-4 border rounded-xl transition-all cursor-pointer ${presentStudents.includes(e.studentId) ? 'bg-primary/5 border-primary/20' : 'opacity-60'}`}
                  onClick={() => toggleStudent(e.studentId)}
                >
                  <span className="text-sm font-medium">{studentMap[e.studentId] || e.studentId}</span>
                  <Checkbox checked={presentStudents.includes(e.studentId)} />
                </div>
              ))}
            </div>

            <Button 
  className="w-full h-12 text-lg" 
  onClick={handleSubmit} 
  disabled={!durationHours || markStudentAttendance.isPending}
>
  {markStudentAttendance.isPending ? "Saving..." : "Save Override"}
</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}