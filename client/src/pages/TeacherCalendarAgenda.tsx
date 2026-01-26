import { useDailySchedule } from "@/lib/hooks"; // Switched to the unified hook
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckSquare, AlertCircle, MapPin, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function TeacherCalendarAgenda() {
  const { user } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");
  
  // Use the unified hook: passing user?.id filters the schedule for this teacher
  const { data: schedule = [], isLoading } = useDailySchedule(today, user?.id);
  

  if (isLoading) return <Skeleton className="h-[400px] w-full mt-4" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">Your Classes</h2>
        </div>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
          {format(new Date(), "EEEE, MMM do")}
        </Badge>
      </div>

      <div className="relative border-l-2 border-muted ml-3 pl-6 space-y-6 py-2">
        {schedule.length === 0 ? (
          <div className="bg-muted/30 rounded-lg p-8 text-center border-2 border-dashed">
            <p className="text-sm text-muted-foreground italic">No classes assigned to you today.</p>
          </div>
        ) : (
          schedule.map((item: any) => {
            const isCancelled = item.status === 'cancelled';
            const isRescheduled = item.status === 'rescheduled';

            return (
              <div key={item.id} className="relative">
                {/* Status-colored Dot on the timeline */}
                <div className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 bg-background z-10 ${
                  isCancelled ? "border-muted" : isRescheduled ? "border-amber-500" : "border-primary"
                }`} />
                
                <Card className={`overflow-hidden transition-all shadow-sm ${
                  isCancelled ? "opacity-60 bg-muted/20" : "hover:shadow-md border-l-4"
                } ${isRescheduled ? "border-l-amber-500" : "border-l-primary"}`}>
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Time Sidebar */}
                      <div className={`p-4 sm:w-32 flex flex-col justify-center items-center text-center border-b sm:border-b-0 sm:border-r ${
                        isCancelled ? "bg-muted" : isRescheduled ? "bg-amber-50/50" : "bg-primary/5"
                      }`}>
                        <span className="text-sm font-bold">{item.startTime}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">to</span>
                        <span className="text-sm font-bold">{item.endTime}</span>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className={`font-bold text-base ${isCancelled ? "line-through text-muted-foreground" : ""}`}>
                            {item.name}
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 text-primary/60" />
                              {item.roomName || "Assigned Room"}
                            </div>
                            {isCancelled && (
                              <Badge variant="destructive" className="h-5 text-[9px] font-bold">CANCELLED</Badge>
                            )}
                            {isRescheduled && (
                              <Badge variant="outline" className="h-5 text-[9px] border-amber-500 text-amber-700 bg-amber-50">TIME UPDATED</Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:items-end gap-2">
                          {!isCancelled && (
                            <Link href={"/portal"}>
                              <Button size="sm" className="gap-2 h-9 w-full sm:w-auto shadow-sm">
                                <CheckSquare className="h-4 w-4" />
                                Mark Attendance
                              </Button>
                            </Link>
                          )}
                          
                          {item.reason && (
                            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                               <AlertCircle className="h-3.5 w-3.5" />
                               <span className="text-[10px] font-medium italic">Note: {item.reason}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}