import { useDailySchedule, useAttendance } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, CheckCircle2, UserMinus, Percent } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function DailyAttendanceSummary() {
  const today = format(new Date(), "yyyy-MM-dd");
  
  // 1. Get the schedule to know which classes are active
  const { data: schedule = [], isLoading: loadingSchedule } = useDailySchedule(today);
  
  // 2. Get all attendance records for today
  const { data: attendance = [], isLoading: loadingAttendance } = useAttendance({ date: today });

  if (loadingSchedule || loadingAttendance) return <Skeleton className="h-[200px] w-full" />;

  // Filter out cancelled classes
  const activeSessions = schedule.filter(s => s.status !== 'cancelled');
  
  // Calculate Stats
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const totalMarked = presentCount + lateCount + absentCount;
  
  // Logic: We compare present/late against the total number of check-ins recorded
  const attendanceRate = totalMarked > 0 
    ? Math.round(((presentCount + lateCount) / totalMarked) * 100) 
    : 0;

  return (
    <Card className="shadow-sm border-none bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          Attendance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-3xl font-bold">{attendanceRate}%</span>
            <p className="text-xs text-muted-foreground">Check-in rate for today</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-primary">{activeSessions.length}</span>
            <p className="text-[10px] text-muted-foreground uppercase">Active Classes</p>
          </div>
        </div>

        <Progress value={attendanceRate} className="h-2 mb-6" />

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 rounded-lg bg-emerald-50 border border-emerald-100">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mb-1" />
            <span className="text-sm font-bold text-emerald-700">{presentCount + lateCount}</span>
            <span className="text-[10px] text-emerald-600">Present</span>
          </div>
          
          <div className="flex flex-col items-center p-2 rounded-lg bg-rose-50 border border-rose-100">
            <UserMinus className="h-4 w-4 text-rose-600 mb-1" />
            <span className="text-sm font-bold text-rose-700">{absentCount}</span>
            <span className="text-[10px] text-rose-600">Absent</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-blue-50 border border-blue-100">
            <Percent className="h-4 w-4 text-blue-600 mb-1" />
            <span className="text-sm font-bold text-blue-700">{totalMarked}</span>
            <span className="text-[10px] text-blue-600">Total</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}