import { useState } from "react";
import {
  useAttendance,
  useCreateAttendance,
  useUpdateAttendance,
  useDeleteAttendance,
  useSessions,
  useTeachers,
  useStudents,
  useDepartments,
} from "@/lib/hooks";
import type { AttendanceRecord } from "@shared/schema";
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

const formatDate = (value: string | Date) => {
  const d = new Date(value);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);

  return `${day}-${month}-${year}`;
};

const extractTime = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const combineDateAndTime = (date: string, time: string) => {
  // date = YYYY-MM-DD
  // time = HH:mm
  return new Date(`${date}T${time}:00`).toISOString();
};

export default function Attendances() {
  const [filters, setFilters] = useState({
    teacherId: "all",
    sessionId: "all",
    date: "", // YYYY-MM-DD
  });

  const { data: attendances = [], isLoading: loadingAttendances } =
    useAttendance();
  const { data: sessions = [], isLoading: loadingSessions } = useSessions();
  const { data: teachers = [], isLoading: loadingTeachers } = useTeachers();
  const { data: students = [], isLoading: loadingStudents } = useStudents();
  const { data: departments = [], isLoading: loadingDepartments } =
    useDepartments();

  const createAttendace = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();
  const deleteAttendance = useDeleteAttendance();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: "2024-01-01",
    teacherId: "",
    sessionId: "",
    presentStudentIds: [] as string[],
    actualStartTime: "09:00",
    actualEndTime: "10:00",
    durationHours: 1,
  });

  const isLoading =
    loadingAttendances ||
    loadingTeachers ||
    loadingSessions ||
    loadingDepartments ||
    loadingStudents;

  const handleOpenDialog = (attendance?: AttendanceRecord) => {
    if (attendance) {
      setEditingId(attendance.id);
      setFormData({
        date: attendance.date,
        teacherId: attendance.teacherId,
        sessionId: attendance.sessionId,
        presentStudentIds: attendance.presentStudentIds,
        actualStartTime: extractTime(attendance.actualStartTime),
        actualEndTime: extractTime(attendance.actualEndTime),
        durationHours: attendance.durationHours,
      });
    } else {
      setEditingId(null);
      setFormData({
        date: "2026-01-01",
        teacherId: "",
        sessionId: "",
        presentStudentIds: [],
        actualStartTime: "09:00",
        actualEndTime: "10:00",
        durationHours: 1,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (
      !formData.date ||
      !formData.teacherId ||
      !formData.sessionId ||
      !formData.presentStudentIds ||
      !formData.actualStartTime ||
      !formData.actualEndTime
    )
      return;
     const payload = {
    ...formData,
    actualStartTime: combineDateAndTime(
      formData.date,
      formData.actualStartTime
    ),
    actualEndTime: combineDateAndTime(
      formData.date,
      formData.actualEndTime
    ),
  };
    if (editingId) {
      await updateAttendance.mutateAsync({ id: editingId, data: payload });
    } else {
      await createAttendace.mutateAsync(payload);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteAttendance.mutateAsync(id);
  };

  const toggleStudent = (presentStudentIds: string) => {
    setFormData((prev) => ({
      ...prev,
      presentStudentIds: prev.presentStudentIds.includes(presentStudentIds)
        ? prev.presentStudentIds.filter((id) => id !== presentStudentIds)
        : [...prev.presentStudentIds, presentStudentIds],
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-bold tracking-tight">
              Attendance
            </h1>
            <p className="text-muted-foreground">Manage attendance records.</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="border-none shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

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
            Attendance Records
          </h1>
          <p className="text-muted-foreground">Manage attendance records.</p>
        </div>

        {/* <Button className="gap-2" onClick={() => handleOpenDialog()} data-testid="button-add-session">
          <Plus className="h-4 w-4" /> Create Attendance Record
        </Button> */}
      </div>
        
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Attendance" : "Create New Attendance Record"}
            </DialogTitle>
            <DialogDescription>
              Manage your sessions attendance records.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  data-testid="input-attendance-date"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Teacher</label>
                <Select
                  value={formData.teacherId}
                  onValueChange={(val) =>
                    setFormData({ ...formData, teacherId: val })
                  }
                >
                  <SelectTrigger data-testid="select-session-teacher">
                    <SelectValue placeholder="Select Teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Session</label>
                <Select
                  value={formData.sessionId}
                  onValueChange={(val) =>
                    setFormData({ ...formData, sessionId: val })
                  }
                >
                  <SelectTrigger data-testid="select-session-session">
                    <SelectValue placeholder="Select Session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <Input
                  type="time"
                  value={formData.actualStartTime}
                  onChange={(e) =>
                    setFormData({
                     ...formData,
                     actualStartTime: e.target.value,
                    })
                  }
                  data-testid="input-session-start-time"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Time</label>
                <Input
                  type="time"
                  value={formData.actualEndTime}
                  onChange={(e) =>
                    setFormData({ ...formData,  actualEndTime: e.target.value })
                  }
                  data-testid="input-session-end-time"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Assign Students ({formData.presentStudentIds.length} selected)
                </label>
                <div className="border rounded-md p-4 h-48 overflow-y-auto space-y-2">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={formData.presentStudentIds.includes(
                          student.id
                        )}
                        onCheckedChange={() => toggleStudent(student.id)}
                        data-testid={`checkbox-student-${student.id}`}
                      />
                      <label
                        htmlFor={`student-${student.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {student.name}{" "}
                        <span className="text-muted-foreground text-xs">
                          ({student.grade})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createAttendace.isPending || updateAttendance.isPending}
              data-testid="button-submit-session"
            >
              {editingId ? "Save Changes" : "Create Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Attendance</CardTitle>
        </CardHeader>
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
                  <SelectContent>
                    <SelectItem value="all">All Teachers</SelectItem>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Session Filter */}
                <Select
                  value={filters.sessionId}
                  onValueChange={(val) =>
                    setFilters((f) => ({ ...f, sessionId: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    {sessions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
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
                <TableHead>Teacher</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Duration Hours</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendances.map((attendance) => {
                const teacher = teachers.find(
                  (t) => t.id === attendance.teacherId
                );
                const session = sessions.find(
                  (s) => s.id === attendance.sessionId
                );
                return (
                  <TableRow
                    key={attendance.id}
                    data-testid={`row-attendance-${attendance.id}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarRange className="h-3 w-3" />
                        {new Date(attendance.date)
                          .toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          })
                          .replace(/\//g, "-")}
                      </div>
                    </TableCell>
                    <TableCell>{teacher?.name || "Unassigned"}</TableCell>
                    <TableCell>{session?.name || "Unassigned"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarClock className="h-3 w-3" />
                        {new Date(
                          attendance.actualStartTime
                        ).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarClock className="h-3 w-3" />
                        {new Date(attendance.actualEndTime).toLocaleTimeString(
                          "en-US",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {" "}
                      {formatDurationFromHours(
                        Number(attendance.durationHours)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(attendance)}
                          data-testid={`button-edit-session-${attendance.id}`}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-delete-session-${attendance.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete the session and all attendance
                                records associated with it.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(attendance.id)}
                                disabled={deleteAttendance.isPending}
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
