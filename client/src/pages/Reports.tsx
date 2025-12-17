import { useState } from "react";
import {
  useTeachers,
  useStudents,
  useTeacherWorkHours,
  useStudentAttendanceReport,
} from "@/lib/hooks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subMonths } from "date-fns";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { attendance } from "@shared/schema";

function formatDurationFromHours(hours: number) {
  const totalSeconds = Math.round(hours * 3600);

  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");

  return `${h}:${m}:${s}`;
}

export default function Reports() {
  const { data: teachers = [], isLoading: loadingTeachers } = useTeachers();
  const { data: students = [], isLoading: loadingStudents } = useStudents();

  const [teacherReportMonth, setTeacherReportMonth] = useState<Date>(
    new Date()
  );
  const [teacherNameFilter, setTeacherNameFilter] = useState("");

  const [filterType, setFilterType] = useState<"day" | "month" | "year">(
    "month"
  );
  const [filterDate, setFilterDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [filterMonth, setFilterMonth] = useState<Date>(new Date());
  const [filterYear, setFilterYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [studentNameFilter, setStudentNameFilter] = useState("");

  const teacherFilters: any = {
    startDate: format(
      new Date(
        teacherReportMonth.getFullYear(),
        teacherReportMonth.getMonth(),
        1
      ),
      "yyyy-MM-dd"
    ),
    endDate: format(
      new Date(
        teacherReportMonth.getFullYear(),
        teacherReportMonth.getMonth() + 1,
        0
      ),
      "yyyy-MM-dd"
    ),
  };

  let studentFilters: any = {};
  if (filterType === "day") {
    studentFilters.startDate = filterDate;
    studentFilters.endDate = filterDate;
  } else if (filterType === "month") {
    studentFilters.startDate = format(
      new Date(filterMonth.getFullYear(), filterMonth.getMonth(), 1),
      "yyyy-MM-dd"
    );
    studentFilters.endDate = format(
      new Date(filterMonth.getFullYear(), filterMonth.getMonth() + 1, 0),
      "yyyy-MM-dd"
    );
  } else {
    studentFilters.startDate = `${filterYear}-01-01`;
    studentFilters.endDate = `${filterYear}-12-31`;
  }

  const { data: teacherWorkHoursRaw = {}, isLoading: loadingTeacherHours } =
    useTeacherWorkHours(teacherFilters);
  const {
    data: studentAttendanceRaw = [],
    isLoading: loadingStudentAttendance,
  } = useStudentAttendanceReport(studentFilters);

  const teacherHoursData = Object.entries(teacherWorkHoursRaw)
    .map(([teacherId, hours]) => {
      const teacher = teachers.find((t) => t.id === teacherId);

      return {
        id: teacherId,
        name: teacher?.name || "Unknown",
        hours: (hours as number).toFixed(2),
      };
    })
    .filter((record) =>
      record.name.toLowerCase().includes(teacherNameFilter.toLowerCase())
    );

  const studentReportData = studentAttendanceRaw
    .map((record) => {
      const student = students.find((s) => s.id === record.studentId);
      return {
        id: record.studentId,
        name: student?.name || "Unknown",
        grade: student?.grade || "N/A",
        rate: record.total > 0 ? (record.present / record.total) * 100 : 0,
        present: record.present,
        total: record.total,
      };
    })
    .filter((record) =>
      record.name.toLowerCase().includes(studentNameFilter.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const isLoading =
    loadingTeachers ||
    loadingStudents ||
    loadingTeacherHours ||
    loadingStudentAttendance;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-heading font-bold tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights into school performance.
          </p>
        </div>
        <Card className="border-none shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="no-print flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight">
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground">
          Comprehensive insights into school performance.
        </p>
      </div>

      <Tabs defaultValue="teachers" className="w-full">
        <TabsList className="no-print grid w-full md:w-[400px] grid-cols-1 mb-8">
          <TabsTrigger value="teachers">Teacher Work Hours</TabsTrigger>
          {/* <TabsTrigger value="students">Student Attendance</TabsTrigger> */}
        </TabsList>

        <TabsContent value="teachers" className="space-y-6">
          <div className="no-print  flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by teacher name..."
                className="pl-8"
                value={teacherNameFilter}
                onChange={(e) => setTeacherNameFilter(e.target.value)}
                data-testid="input-filter-teacher-name"
              />
            </div>
            <Select
              value={teacherReportMonth.toISOString()}
              onValueChange={(val) => setTeacherReportMonth(new Date(val))}
            >
              <SelectTrigger
                className="w-full md:w-[200px]"
                data-testid="select-teacher-month"
              >
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={new Date().toISOString()}>
                  {format(new Date(), "MMMM yyyy")}
                </SelectItem>
                <SelectItem value={subMonths(new Date(), 1).toISOString()}>
                  {format(subMonths(new Date(), 1), "MMMM yyyy")}
                </SelectItem>
                <SelectItem value={subMonths(new Date(), 2).toISOString()}>
                  {format(subMonths(new Date(), 2), "MMMM yyyy")}
                </SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={() => window.print()}
              className="ml-auto px-4 py-2 rounded-md border bg-background hover:bg-accent text-sm font-medium"
            >
              Print Report
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-1">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground uppercase font-medium">
                      <tr>
                        <th className="px-4 py-3 rounded-l-md">Teacher</th>
                        <th className="px-4 py-3">Work Hours</th>
                        <th className="px-4 py-3 rounded-r-md">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {teacherHoursData.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium">{row.name}</td>
                          <td className="px-4 py-3 font-bold">
                            {" "}
                            {formatDurationFromHours(Number(row.hours))}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                Number(row.hours) > 0
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {Number(row.hours) > 0 ? "Active" : "No Logs"}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {teacherHoursData.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No matching records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* <TabsContent value="students" className="space-y-6">
          <Card className="border-none shadow-sm bg-muted/30">
            <CardContent className="pt-6">
              <div className="no-print flex flex-col md:flex-row gap-4 items-end">
                <div className="space-y-2 w-full md:w-auto">
                  <label className="text-sm font-medium">Filter By</label>
                  <div className="flex rounded-md shadow-sm">
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                        filterType === "day"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-input hover:bg-accent"
                      }`}
                      onClick={() => setFilterType("day")}
                      data-testid="button-filter-day"
                    >
                      Day
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium border-t border-b ${
                        filterType === "month"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-input hover:bg-accent"
                      }`}
                      onClick={() => setFilterType("month")}
                      data-testid="button-filter-month"
                    >
                      Month
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
                        filterType === "year"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-input hover:bg-accent"
                      }`}
                      onClick={() => setFilterType("year")}
                      data-testid="button-filter-year"
                    >
                      Year
                    </button>
                  </div>
                </div>

                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Select Period</label>
                  {filterType === "day" && (
                    <input
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      data-testid="input-filter-date"
                    />
                  )}
                  {filterType === "month" && (
                    <Select
                      value={filterMonth.toISOString()}
                      onValueChange={(val) => setFilterMonth(new Date(val))}
                    >
                      <SelectTrigger data-testid="select-filter-month">
                        <SelectValue placeholder="Select Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }).map((_, i) => {
                          const d = subMonths(new Date(), i);
                          return (
                            <SelectItem key={i} value={d.toISOString()}>
                              {format(d, "MMMM yyyy")}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                  {filterType === "year" && (
                    <Select value={filterYear} onValueChange={setFilterYear}>
                      <SelectTrigger data-testid="select-filter-year">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Filter by Name</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Student name..."
                      className="pl-8"
                      value={studentNameFilter}
                      onChange={(e) => setStudentNameFilter(e.target.value)}
                      data-testid="input-filter-student-name"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Attendance Report</CardTitle>
              <CardDescription>
                Showing records for{" "}
                {filterType === "day"
                  ? filterDate
                  : filterType === "month"
                  ? format(filterMonth, "MMMM yyyy")
                  : filterYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground uppercase font-medium">
                    <tr>
                      <th className="px-4 py-3 rounded-l-md">Student Name</th>
                      <th className="px-4 py-3">Grade</th>
                      <th className="px-4 py-3">Attendance Rate</th>
                      <th className="px-4 py-3">Sessions Attended</th>
                      <th className="px-4 py-3 rounded-r-md">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {studentReportData.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">{row.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.grade}
                        </td>
                        <td className="px-4 py-3 font-bold">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  row.rate >= 90
                                    ? "bg-emerald-500"
                                    : row.rate >= 75
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${row.rate}%` }}
                              />
                            </div>
                            {row.rate.toFixed(0)}%
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.present} / {row.total}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              row.rate >= 90
                                ? "bg-emerald-100 text-emerald-800"
                                : row.rate >= 75
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {row.rate >= 90
                              ? "Excellent"
                              : row.rate >= 75
                              ? "Fair"
                              : "Poor"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {studentReportData.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No matching records found for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
