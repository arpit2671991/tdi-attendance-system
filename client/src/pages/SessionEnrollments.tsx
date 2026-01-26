import { useState, useMemo } from "react";
import { useParams } from "wouter";
import {
  useSessions,
  useTeachers,
  useDepartments,
  useStudents,
} from "@/lib/hooks";
import {
  useSessionEnrollmentsBySession,
  useCreateSessionEnrollment,
  useDeleteSessionEnrollment,
} from "@/lib/hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function SessionEnrollmentPage() {
  const [search, setSearch] = useState("");
  const [searchMobile, setSearchMobile] = useState("");
  const { toast } = useToast();

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

  const params = useParams<{ sessionId: string }>();
  const sessionId = params?.sessionId;

  // Fetch all needed data
  const { data: sessions = [], isLoading: loadingSessions } = useSessions();
  const { data: teachers = [] } = useTeachers();
  const { data: departments = [] } = useDepartments();
  const { data: allStudents = [] } = useStudents();

  // Find the current session
  const session = useMemo(() => {
    if (!sessionId || loadingSessions) return undefined;
    return sessions.find((s) => s.id === sessionId);
  }, [sessions, sessionId, loadingSessions]);

  // Session enrollments
  const {
    data: enrolledStudents = [],
    refetch: refetchEnrollments,
  } = useSessionEnrollmentsBySession(sessionId ?? "");

  // Mutations
  const createEnrollment = useCreateSessionEnrollment();
  const deleteEnrollment = useDeleteSessionEnrollment();
 
  
 // Filter students: must be active AND match search criteria
const filteredStudents = useMemo(() => {
  return allStudents.filter((s) => {
    // 1. Only show active students
    const isActive = s.isActive === true;

    // 2. Apply search filters
    const matchesName = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesMobile = s.mobile.includes(searchMobile); // Mobile filter

    return isActive && matchesName && matchesMobile;
  });
}, [allStudents, search, searchMobile]); // Add searchMobile to dependency array
  // Loading state
  if (loadingSessions) return <Skeleton className="h-10 w-full" />;

  if (!session) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Session not found.
      </div>
    );
  }

  const sessionTeacher = teachers.find((t) => t.id === session.teacherId);
  const sessionDepartment = departments.find((d) => d.id === session.departmentId);

  // Check if student is enrolled
  const isStudentEnrolled = (studentId: string) =>
    enrolledStudents.some((e) => e.studentId === studentId);

  // Enroll or remove student
  const toggleEnrollment = (studentId: string) => {
    const enrolledRecord = enrolledStudents.find((e) => e.studentId === studentId);

    console.log(enrolledRecord)
    if (enrolledRecord?.id) {
      // Remove enrollment
      deleteEnrollment.mutate(enrolledRecord.id, {
        onSuccess: () => {
          toast({ title: "Enrollment removed successfully" });
          refetchEnrollments();
        },
        onError: (err: any) => {
          toast({
            title: "Failed to remove enrollment",
            description: err.message,
            variant: "destructive",
          });
        },
      });
    } else {
      // Prevent duplicate
      if (isStudentEnrolled(studentId)) {
        toast({ title: "Student is already enrolled", variant: "destructive" });
        return;
      }

      // Add enrollment
      createEnrollment.mutate(
        { sessionId: session.id, studentId },
        {
          onSuccess: () => {
            toast({ title: "Student enrolled successfully" });
            refetchEnrollments();
          },
          onError: (err: any) => {
            toast({
              title: "Failed to enroll student",
              description: err.message,
              variant: "destructive",
            });
          },
        }
      );
    }
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{session.name}</CardTitle>
          <p className="text-sm">
            {sessionTeacher?.name || "Unassigned Teacher"} |{" "}
            {sessionDepartment?.name || "Unassigned Course"}
          </p>
          <p className="text-sm">
            {formatTime(session.startTime)} - {formatTime(session.endTime)} | {formatDate(session.startDate)} to {formatDate(session.endDate)}
          </p>
        </CardHeader>

        <CardContent>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
    <Input
      placeholder="Search by name..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    <Input
      placeholder="Search by mobile..."
      value={searchMobile}
      onChange={(e) => setSearchMobile(e.target.value)}
      type="tel"
    />
  </div>

          <h3 className="text-lg font-medium mb-2">Enroll Students</h3>
          <Badge variant="secondary" className="mb-4">
            {enrolledStudents.length} / {allStudents.length} Enrolled
          </Badge>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredStudents.map((student) => {
                const enrolled = isStudentEnrolled(student.id);
                return (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell className="text-right">
                      {enrolled ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleteEnrollment.isPending}
                          onClick={() => toggleEnrollment(student.id)}
                        >
                          Enrolled
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          disabled={createEnrollment.isPending}
                          onClick={() => toggleEnrollment(student.id)}
                        >
                          Enroll
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

             {filteredStudents.length === 0 && (
  <TableRow>
    <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
      {search ? "No students match your search." : "No active students available for enrollment."}
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
