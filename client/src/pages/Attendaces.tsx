import { useState, useMemo, useEffect, useCallback } from "react";
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
import { ShieldCheck, Calendar as CalendarIcon, CheckSquare, RefreshCcw, Search, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { attendanceApi } from "@/lib/api";

// Pure utility function defined outside to prevent re-renders
const calculateDuration = (start: string, end: string) => {
  if (!start || !end) return null;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const totalMin = (eh * 60 + em) - (sh * 60 + sm);
  return totalMin > 0 ? Math.round((totalMin / 60) * 100) / 100 : null;
};

export default function Attendances() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [studentFilter, setStudentFilter] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");
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

  const currentSession = useMemo(() => 
    allSessions.find(s => s.id === selectedSessionId), 
    [allSessions, selectedSessionId]
  );

  const teacherSessions = useMemo(() => 
    allSessions.filter(s => s.teacherId === selectedTeacherId),
    [allSessions, selectedTeacherId]
  );

  const studentMap = useMemo(() => 
    students.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {} as Record<string, string>),
    [students]
  );

  const filteredEnrollments = useMemo(() => {
    const active = enrollments.filter(e => students.find(st => st.id === e.studentId)?.isActive !== false);
    if (!studentFilter.trim()) return active;
    return active.filter(e => studentMap[e.studentId]?.toLowerCase().includes(studentFilter.toLowerCase()));
  }, [enrollments, studentFilter, studentMap, students]);

  // --- THE LOOP FIXER ---
  // We only sync when the Session, Date, or the presence of existing data changes.
  useEffect(() => {
    if (!selectedSessionId) return;

    if (existingAttendance.length > 0) {
      // Sync from DB
      const presentIds = existingAttendance
        .filter(a => a.status === "present" && a.studentId)
        .map(a => a.studentId!);
      setPresentStudents(presentIds);

      const teacherRec = existingAttendance.find(a => a.teacherId === selectedTeacherId);
      if (teacherRec?.durationHours) setDurationHours(teacherRec.durationHours);
    } else {
      // Sync from Schedule Defaults
      setPresentStudents(enrollments.map(e => e.studentId));
      if (currentSession?.startTime && currentSession?.endTime) {
        const s = currentSession.startTime.slice(0, 5);
        const e = currentSession.endTime.slice(0, 5);
        setStartTime(s);
        setEndTime(e);
        setDurationHours(calculateDuration(s, e));
      }
    }
    // We intentionally exclude presentStudents/durationHours from deps to break the cycle
  }, [selectedSessionId, selectedDate, existingAttendance.length, enrollments.length]);

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartTime(value);
      setDurationHours(calculateDuration(value, endTime));
    } else {
      setEndTime(value);
      setDurationHours(calculateDuration(startTime, value));
    }
  };

  const toggleStudent = (id: string) => {
    setPresentStudents(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!selectedSessionId || !selectedTeacherId || durationHours === null) {
      toast({ variant: "destructive", title: "Error", description: "Duration is required." });
      return;
    }

    try {
      await markTeacherAttendance.mutateAsync({
        sessionId: selectedSessionId, teacherId: selectedTeacherId,
        date: selectedDate, durationHours, status: "present",
      });

      const promises = enrollments.map(async (e) => {
        const isPresent = presentStudents.includes(e.studentId);
        let finalHours = durationHours;

        if (!isPresent) {
          const history = await attendanceApi.get({ sessionId: selectedSessionId, studentId: e.studentId });
          const lastTwo = history
            .filter(r => r.date !== selectedDate)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 2);

          if (lastTwo.length === 2 && lastTwo.every(r => r.status === "absent")) {
            finalHours = 0; 
          }
        }

        return markStudentAttendance.mutateAsync({
          sessionId: selectedSessionId, studentId: e.studentId,
          date: selectedDate, status: isPresent ? "present" : "absent",
          durationHours: finalHours, markedBy: currentUser?.id,
        });
      });

      await Promise.all(promises);
      await refetchAttendance();
      toast({ title: "Success", description: "Records updated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Save failed." });
    }
  };

  if (currentUser?.role !== 'admin') return <div className="p-10 text-center">403 Forbidden</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Admin Override</h1>
        </div>
        <div className="flex items-center gap-2 border bg-white p-2 rounded-lg shadow-sm">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <Input 
            type="date" value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-none focus-visible:ring-0 w-36 h-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm border-none bg-slate-50">
          <CardHeader className="py-3"><CardTitle className="text-[10px] uppercase text-muted-foreground">Teacher</CardTitle></CardHeader>
          <CardContent>
            <Select value={selectedTeacherId} onValueChange={(val) => { setSelectedTeacherId(val); setSelectedSessionId(""); }}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Select teacher" /></SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">{teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-slate-50">
          <CardHeader className="py-3"><CardTitle className="text-[10px] uppercase text-muted-foreground">Session</CardTitle></CardHeader>
          <CardContent>
            <Select value={selectedSessionId} onValueChange={setSelectedSessionId} disabled={!selectedTeacherId}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Select session" /></SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">{teacherSessions.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name} <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          s.session_type === "group"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
>({s.session_type})</span></SelectItem>
              ))}</SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {selectedSessionId && (
        <Card className="border-t-4 border-primary shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/30 gap-4">
            <CardTitle className="text-lg">Register</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative group">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter..." value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                  className="pl-8 h-8 w-40 bg-white"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchAttendance()} title="Refresh Data"><RefreshCcw className="h-4 w-4" /></Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-8">
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold">Session Timing</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Start</label>
                    <Input type="time" value={startTime} onChange={e => handleTimeChange('start', e.target.value)} className="bg-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">End</label>
                    <Input type="time" value={endTime} onChange={e => handleTimeChange('end', e.target.value)} className="bg-white" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Quick Select Duration</label>
                  {durationHours !== null && (
                    <span className="text-sm font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">Final: {durationHours}h</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {[0.25, 0.5, 1, 1.5, 2, 2.5, 3, 4].map(h => (
                    <Button 
                      key={h} size="sm" variant={durationHours === h ? "default" : "outline"} 
                      onClick={() => setDurationHours(h)} className="rounded-full h-8 px-4"
                    >
                      {h}h
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredEnrollments.map(e => (
                <div 
                  key={e.studentId} 
                  className={`flex items-center justify-between p-4 border rounded-xl transition-all cursor-pointer ${presentStudents.includes(e.studentId) ? 'bg-primary/5 border-primary/20' : 'opacity-60 bg-white'}`}
                  onClick={() => toggleStudent(e.studentId)}
                >
                  <span className="text-sm font-semibold">{studentMap[e.studentId] || e.studentId}</span>
                  <Checkbox checked={presentStudents.includes(e.studentId)} />
                </div>
              ))}
            </div>

            <Button 
              className="w-full h-12 text-lg shadow-lg" 
              onClick={handleSubmit} 
              disabled={durationHours === null || markStudentAttendance.isPending}
            >
              {markStudentAttendance.isPending ? "Saving..." : "Commit Override"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}