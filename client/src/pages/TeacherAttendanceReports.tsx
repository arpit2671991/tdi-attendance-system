import { act, useState } from "react";
import {
  useAttendance,
  useSessions,
  useTeachers,
  useStudents,
  useDepartments,
  useTeachersAttendanceReports,
  useDeleteTeacherAttendance,
} from "@/lib/hooks";
import type { TeacherAttendance } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  CalendarClock,
  UserCheck,
  Pencil,
  Trash2,
  CalendarRange,
  Search,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

function formatDurationFromHours(hours: number) {
  const totalSeconds = Math.round(hours * 3600);

  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");

  return `${h}:${m}:${s}`;
}

export default function TeacherAttendanceReports() {
  const [filters, setFilters] = useState({
    teacherId: "all",
    sessionId: "all",
    date: "", // YYYY-MM-DD
  });

  const { data: attendances = [], isLoading: loadingAttendances } =
    useTeachersAttendanceReports();
  const { data: sessions = [], isLoading: loadingSessions } = useSessions();
  const { data: teachers = [], isLoading: loadingTeachers } = useTeachers();
  const { data: students = [], isLoading: loadingStudents } = useStudents();
  const deleteTeachersAttendance = useDeleteTeacherAttendance();
  const { data: departments = [], isLoading: loadingDepartments } =
    useDepartments();

  const formatDate = (value: string | Date) => {
    return new Date(value)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");
  };

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

  const isLoading =
    loadingAttendances ||
    loadingTeachers ||
    loadingSessions ||
    loadingDepartments ||
    loadingStudents;

  const handleDelete = async (id: string) => {
    await deleteTeachersAttendance.mutateAsync(id);
  };

  const availableSessions = sessions.filter((s) => {
  if (filters.teacherId === "all") return true;
  return s.teacherId === filters.teacherId; // Ensure 'teacherId' matches your schema field name
});

  const filteredAttendances = attendances.filter((a) => {
    const teacherMatch =
      filters.teacherId === "all" || a.teacherId === filters.teacherId;

    const sessionMatch =
      filters.sessionId === "all" || a.sessionId === filters.sessionId;

    const dateMatch = !filters.date || a.date === filters.date;

    return teacherMatch && sessionMatch && dateMatch;
  });
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold tracking-tight">
            Teachers Attendance Records
          </h1>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent>
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Teacher Filter */}
                <Select
                  value={filters.teacherId}
                  onValueChange={(val) =>
                    setFilters((f) => ({ ...f, teacherId: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Teacher" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    <SelectItem value="all">All Teachers</SelectItem>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Session Filter */}
                {/* <Select
                  value={filters.sessionId}
                  onValueChange={(val) =>
                    setFilters((f) => ({ ...f, sessionId: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Session" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    <SelectItem value="all">All Sessions</SelectItem>
                    {sessions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                            s.session_type === "group"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {s.session_type}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}
                <Select
  value={filters.sessionId}
  onValueChange={(val) =>
    setFilters((f) => ({ ...f, sessionId: val }))
  }
>
  <SelectTrigger>
    <SelectValue placeholder="Filter by Session" />
  </SelectTrigger>
  <SelectContent className="max-h-60 overflow-y-auto">
    <SelectItem value="all">
      {filters.teacherId === "all" ? "All Classes" : `Select Class`}
    </SelectItem>
    {availableSessions.map((s) => (
      <SelectItem key={s.id} value={s.id}>
        {s.name}
        <span
          className={`ml-2 px-2 py-1 rounded text-xs font-medium capitalize ${
            s.session_type === "group"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {s.session_type}
        </span>
      </SelectItem>
    ))}
  </SelectContent>
</Select>

                {/* Date Filter */}
                <Input
                  type="date"
                  value={filters.date}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Class Type</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendances.map((attendance) => {
                const teacher = teachers.find(
                  (t) => t.id === attendance.teacherId,
                );
                const session = sessions.find(
                  (s) => s.id === attendance.sessionId,
                );
                return (
                  <TableRow
                    key={attendance.id}
                    data-testid={`row-attendance-${attendance.id}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarRange className="h-3 w-3" />
                        {formatDate(attendance.date)}
                      </div>
                    </TableCell>
                    <TableCell>{teacher?.name || "Unassigned"}</TableCell>
                    <TableCell>{session?.name || "Unassigned"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          session?.session_type === "group"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {session?.session_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarClock className="h-3 w-3" />
                        {formatTime(session?.startTime || "NA")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarClock className="h-3 w-3" />
                        {formatTime(session?.endTime || "NA")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {" "}
                      {formatDurationFromHours(
                        Number(attendance.durationHours),
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-delete-department-${attendance.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the teacher attendance record
                                from the system.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(attendance.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {attendances.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No attendance found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
