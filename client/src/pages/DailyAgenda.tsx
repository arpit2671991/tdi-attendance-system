import { useDailySchedule, useTeachers } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function DailyAgenda() {
  const today = format(new Date(), "yyyy-MM-dd");

  // Using the custom hook which uses sessionApi.getDailySchedule internally
  const { data: schedule = [], isLoading, error } = useDailySchedule(today);
  const { data: teachers = [], isLoading: loadingTeachers } = useTeachers();

  const formatTime = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};


  if (isLoading) return <Skeleton className="h-[400px] w-full" />;

  if (error) {
    return (
      <div className="p-4 border-2 border-destructive/20 bg-destructive/5 rounded-lg text-destructive flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Failed to load schedule: {(error as Error).message}</span>
      </div>
    );
  }

  return (
    <Card className="shadow-sm border-none bg-background/50 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarClock className="h-5 w-5 text-primary" />
          Today's Schedule
          <span className="text-xs font-normal text-muted-foreground ml-auto bg-muted px-2 py-1 rounded-full">
            {format(new Date(), "eeee, MMM do")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedule.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <p className="text-sm text-muted-foreground">No classes scheduled for today.</p>
          </div>
        ) : (
          schedule.map((item: any) => {
            const isCancelled = item.status === 'cancelled';
            const isRescheduled = item.status === 'rescheduled';
            const teacher = teachers.find(
                  (t) => t.id === item.teacherId,
                );

            return (
              <div 
                key={item.id} 
                className={`group flex items-center justify-between p-4 rounded-xl border border-l-4 transition-all hover:shadow-md ${
                  isCancelled 
                    ? "bg-muted/30 border-l-destructive/50 opacity-60" 
                    : isRescheduled 
                    ? "bg-amber-50/50 border-l-amber-500 border-amber-100" 
                    : "bg-card border-l-primary shadow-sm"
                }`}
              >
                <div className="space-y-1.5">
                  <h4 className={`font-bold text-sm ${isCancelled ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {item.name} &nbsp;&nbsp;&nbsp;&nbsp;<span
                        className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          item.session_type === "group"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.session_type}
                      </span>
                  </h4>
                  <h4  className={`font-bold text-sm ${isCancelled ? "line-through text-muted-foreground" : "text-foreground"}`}>{teacher?.name}</h4>
                  
                  <div className="flex items-center gap-3 text-xs ">
                    <div className={`flex items-center gap-1 font-medium ${isRescheduled && !isCancelled ? "text-amber-700" : ""}`}>
                      <Clock className="h-3 w-3" />
                      {formatTime(item.startTime)} - {formatTime( item.endTime)}
                    </div>
                    
                    {item.isException && (
                      <Badge variant="outline" className="text-[9px] uppercase tracking-wider h-4 px-1.5 bg-white font-bold">
                        {item.status}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {isCancelled ? (
                    <Badge variant="destructive" className="h-6 text-[10px] gap-1 px-2">
                      <AlertCircle className="h-3 w-3" /> Cancelled
                    </Badge>
                  ) : (
                    <Badge variant={isRescheduled ? "outline" : "secondary"} className={`h-6 text-[10px] gap-1 px-2 ${isRescheduled ? "border-amber-500 text-amber-700 bg-amber-100" : ""}`}>
                      <CheckCircle2 className="h-3 w-3" /> {isRescheduled ? "Time Updated" : "Scheduled"}
                    </Badge>
                  )}
                  
                  {item.reason && (
                    <span className="text-[10px] text-muted-foreground italic max-w-[120px] truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                      "{item.reason}"
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}