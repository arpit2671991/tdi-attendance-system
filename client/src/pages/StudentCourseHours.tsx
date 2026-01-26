import { useState } from "react";
import {  useStudentCourseHours } from "@/lib/hooks";
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function StudentCourseHours() {
  const [searchName, setSearchName] = useState("");
  const [searchMobile, setSearchMobile] = useState("");

  const { data: studentsCourseHours = [], isLoading: loadingCourseHours } =
    useStudentCourseHours();


  const isLoading = loadingCourseHours;

 

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-bold tracking-tight">
              Student Course Hours
            </h1>
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

 const filteredStudents = studentsCourseHours.filter((student) => {
  const matchesName = student.studentName.toLowerCase().includes(searchName.toLowerCase());
  // Ensure we check if mobile exists before calling includes
  const matchesMobile = student.studentMobile?.includes(searchMobile) || student.studentMobile?.includes(searchMobile); 
  
  return matchesName && matchesMobile;
});

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold tracking-tight">
            Student Course Hours
          </h1>
        </div>
      </div>

     
      
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              placeholder="Search student by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="max-w-sm"
              data-testid="input-search-student"
            />
            <Input
    placeholder="Search by mobile number..."
    value={searchMobile}
    onChange={(e) => setSearchMobile(e.target.value)}
    className="w-full"
    type="tel"
    data-testid="input-search-student-mobile"
  />
          </div>
        
 
      <Card className="border-none shadow-sm">
        <CardContent>
          <CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Consumed</TableHead>
                <TableHead>Remaining</TableHead>

              
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((row) => {
                return (
                  <TableRow
                    key={row.studentId}
                    data-testid={`row-session-${row.studentId}`}
                  >
                    <TableCell className="font-medium">
                      {row.studentName}
                    </TableCell>
                    <TableCell>{row.courseName || "Unassigned"}</TableCell>
                    <TableCell>{row.courseHours || "Unassigned"}</TableCell>
                    <TableCell>{row.consumedHours || "0"}</TableCell>
                    <TableCell>{row.remainingHours || "Unassigned"}</TableCell>
                    
                  </TableRow>
                );
              })}
              {studentsCourseHours.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No sessions data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </CardHeader>
        </CardContent>
      </Card>
    </div>
  );
}
