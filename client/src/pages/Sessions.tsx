// import { useEffect, useState } from "react";
// import { Link } from "wouter";
// import {
//   useSessions,
//   useCreateSession,
//   useUpdateSession,
//   useDeleteSession,
//   useTeachers,
//   useStudents,
//   useDepartments,
//   useBulkImportSessions,
//   useSessionEnrollments,
// } from "@/lib/hooks";
// import type { Session } from "@shared/schema";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Plus,
//   CalendarClock,
//   UserCheck,
//   Pencil,
//   Trash2,
//   CalendarRange,
//   Search,
//   Upload,
// } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Skeleton } from "@/components/ui/skeleton";
// import { ManageExceptionsDialog } from "./ManageExceptionsDialog";
// import { CalendarX } from "lucide-react"; // Add this icon
// import Papa from "papaparse";
// import { useToast } from "@/hooks/use-toast";

// export default function Sessions() {
//   const [searchMobile, setSearchMobile] = useState("");
//   const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
//   const [importError, setImportError] = useState<string | null>(null);
//   const [exceptionSession, setExceptionSession] = useState<Session | null>(
//     null,
//   );
//   const [currentPage, setCurrentPage] = useState(1);
//   const pageSize = 10;
//   const { toast } = useToast();
//   const [searchName, setSearchName] = useState("");
//   const { data: sessions = [], isLoading: loadingSessions } = useSessions();
//   const { data: teachers = [], isLoading: loadingTeachers } = useTeachers();
//   const { data: students = [], isLoading: loadingStudents } = useStudents();
//   const { data: departments = [], isLoading: loadingDepartments } =
//     useDepartments();

//   const createSession = useCreateSession();
//   const updateSession = useUpdateSession();
//   const deleteSession = useDeleteSession();
//   const bulkImportSessions = useBulkImportSessions();
//   const { data: allEnrollments = [], isLoading: loadingEnrollments } = useSessionEnrollments();

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);

// const formatDate = (value: string | Date) => {
//   return new Date(value)
//     .toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     })
//     .replace(/ /g, "-");
// };

// const formatTime = (value: string) => {
//   const [hours, minutes] = value.split(":").map(Number);

//   const date = new Date();
//   date.setHours(hours, minutes, 0);

//   return date.toLocaleTimeString("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   });
// };


//   const [formData, setFormData] = useState({
//     name: "",
//     teacherId: "",
//     session_type: "private" as "private" | "group",
//     departmentId: "",
//     startTime: "09:00",
//     endTime: "10:00",
//     startDate: "2024-01-01",
//     endDate: "2024-12-31",
//     // studentIds: [] as string[]
//   });

//  const isLoading = loadingSessions || loadingTeachers || 
//                   loadingDepartments || loadingStudents || 
//                   loadingEnrollments;

//  const filteredClasses = sessions.filter((session) => {
//   const matchesName = session.name.toLowerCase().includes(searchName.toLowerCase());
  
//   // Mobile search logic
//   const matchesMobile = searchMobile === "" || allEnrollments
//     .filter(enrollment => enrollment.sessionId === session.id) // Get students in this session
//     .some(enrollment => {
//       const student = students.find(s => s.id === enrollment.studentId);
//       return student?.mobile?.includes(searchMobile); // Adjust 'mobile' to your schema property name
//     });

//   return matchesName && matchesMobile;
// });
//   const totalPages = Math.ceil(filteredClasses.length / pageSize);

//   const paginatedClasses = filteredClasses.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize,
//   );
//   const handleOpenDialog = (session?: Session) => {
//     if (session) {
//       setEditingId(session.id);
//       setFormData({
//         name: session.name,
//         teacherId: session.teacherId,
//         session_type: session.session_type,
//         departmentId: session.departmentId,
//         startTime: session.startTime,
//         endTime: session.endTime,
//         startDate: session.startDate,
//         endDate: session.endDate,
//         // studentIds: session.studentIds
//       });
//     } else {
//       setEditingId(null);
//       setFormData({
//         name: "",
//         teacherId: "",
//         departmentId: "",
//         startTime: "09:00",
//         endTime: "10:00",
//         startDate: "2026-01-01",
//         endDate: "2026-12-31",
//         session_type: "private",
//         // studentIds: []
//       });
//     }
//     setIsDialogOpen(true);
//   };

//   const handleSubmit = async () => {
//     if (!formData.name || !formData.teacherId || !formData.departmentId) return;

//     if (editingId) {
//       await updateSession.mutateAsync({ id: editingId, data: formData });
//     } else {
//       await createSession.mutateAsync(formData);
//     }
//     setIsDialogOpen(false);
//   };

//   const handleDelete = async (id: string) => {
//     await deleteSession.mutateAsync(id);
//   };

//   const handleCsvUpload = (file: File) => {
//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       complete: async (results) => {
//         try {
//           const rows = results.data as any[];

//           if (!rows.length) {
//             toast({
//               variant: "destructive",
//               title: "Error",
//               description: "No data found in csv file",
//             });
//             return;
//           }

//           const res = await bulkImportSessions.mutateAsync(rows);

//           toast({
//             title: "success",
//             description: `Imported ${res.inserted}, Failed ${res.failed}`,
//           });
//           setIsImportDialogOpen(false);
//         } catch {
//           toast({
//             variant: "destructive",
//             title: "Import Failed",
//             description: "Import failed",
//           });
//         }
//       },
//     });
//   };

//   // const toggleStudent = (studentId: string) => {
//   //   setFormData(prev => ({
//   //     ...prev,
//   //     studentIds: prev.studentIds.includes(studentId)
//   //       ? prev.studentIds.filter(id => id !== studentId)
//   //       : [...prev.studentIds, studentId]
//   //   }));
//   // };
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchName]);

//   if (isLoading) {
//     return (
//       <div className="space-y-8 animate-in fade-in duration-500">
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//           <div className="space-y-1">
//             <h1 className="text-3xl font-heading font-bold tracking-tight">
//               Classes
//             </h1>
//             <p className="text-muted-foreground">
//               Manage classes, dates, and enrollments.
//             </p>
//           </div>
//           <Skeleton className="h-10 w-32" />
//         </div>
//         <Card className="border-none shadow-sm">
//           <CardHeader>
//             <Skeleton className="h-6 w-32" />
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {[1, 2, 3].map((i) => (
//               <Skeleton key={i} className="h-16 w-full" />
//             ))}
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8 animate-in fade-in duration-500">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div className="space-y-1">
//           <h1 className="text-3xl font-heading font-bold tracking-tight">
//             Classes
//           </h1>
//           <p className="text-muted-foreground">
//             Manage classes, dates, and enrollments.
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <Button
//             className="gap-2"
//             onClick={() => handleOpenDialog()}
//             data-testid="button-add-session"
//           >
//             <Plus className="h-4 w-4" /> Create Class
//           </Button>
//           <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
//             <Upload className="h-4 w-4 mr-2" />
//             Import CSV
//           </Button>
//         </div>
//       </div>
//       <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Import Sessions from CSV</DialogTitle>
//             <DialogDescription>
//               Upload a CSV file 
//             </DialogDescription>
//           </DialogHeader>
      
//           <div className="space-y-4">
//             <Input
//               type="file"
//               accept=".csv"
//               onChange={(e) => {
//                 const file = e.target.files?.[0];
//                 if (file) handleCsvUpload(file);
//               }}
//             />
      
//             {importError && (
//               <p className="text-sm text-destructive">{importError}</p>
//             )}
//           </div>
      
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
//               Cancel
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>
//               {editingId ? "Edit Class" : "Create New Class"}
//             </DialogTitle>
//             <DialogDescription>
//               Set up class details, duration, and assign students.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-6 py-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2 col-span-2">
//                 <label className="text-sm font-medium">Class Name</label>
//                 <Input
//                   placeholder="e.g. Advanced Biology"
//                   value={formData.name}
//                   onChange={(e) =>
//                     setFormData({ ...formData, name: e.target.value })
//                   }
//                   data-testid="input-session-name"
//                 />
//               </div>
//               <div className="space-y-2 col-span-2">
//                 <label className="text-sm font-medium">Session Type</label>
//                 <Select
//                   value={formData.session_type}
//                   onValueChange={(val: "private" | "group") =>
//                     setFormData({ ...formData, session_type: val })
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select session type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="private">Private</SelectItem>
//                     <SelectItem value="group">Group</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2 col-span-2">
//                 <label className="text-sm font-medium">Teacher</label>
//                 <Select
//                   value={formData.teacherId}
//                   onValueChange={(val) =>
//                     setFormData({ ...formData, teacherId: val })
//                   }
//                 >
//                   <SelectTrigger data-testid="select-session-teacher">
//                     <SelectValue placeholder="Select Teacher" />
//                   </SelectTrigger>
//                   <SelectContent className="max-h-60 overflow-y-auto">
//                     {teachers.map((t) => (
//                       <SelectItem key={t.id} value={t.id}>
//                         {t.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2 col-span-2">
//                 <label className="text-sm font-medium">Course</label>
//                 <Select
//                   value={formData.departmentId}
//                   onValueChange={(val) =>
//                     setFormData({ ...formData, departmentId: val })
//                   }
//                 >
//                   <SelectTrigger data-testid="select-session-department">
//                     <SelectValue placeholder="Select Department" />
//                   </SelectTrigger>
//                   <SelectContent className="max-h-60 overflow-y-auto">
//                     {departments.map((d) => (
//                       <SelectItem key={d.id} value={d.id}>
//                         {d.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm font-medium">Start Time</label>
//                 <Input
//                   type="time"
//                   value={formData.startTime}
//                   onChange={(e) =>
//                     setFormData({ ...formData, startTime: e.target.value })
//                   }
//                   data-testid="input-session-start-time"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label className="text-sm font-medium">End Time</label>
//                 <Input
//                   type="time"
//                   value={formData.endTime}
//                   onChange={(e) =>
//                     setFormData({ ...formData, endTime: e.target.value })
//                   }
//                   data-testid="input-session-end-time"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm font-medium">Start Date</label>
//                 <Input
//                   type="date"
//                   value={formData.startDate}
//                   onChange={(e) =>
//                     setFormData({ ...formData, startDate: e.target.value })
//                   }
//                   data-testid="input-session-start-date"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label className="text-sm font-medium">End Date</label>
//                 <Input
//                   type="date"
//                   value={formData.endDate}
//                   onChange={(e) =>
//                     setFormData({ ...formData, endDate: e.target.value })
//                   }
//                   data-testid="input-session-end-date"
//                 />
//               </div>
//             </div>

//             {/* <div className="space-y-2">
//               <label className="text-sm font-medium">Assign Students ({formData.studentIds.length} selected)</label>
//               <div className="border rounded-md p-4 h-48 overflow-y-auto space-y-2">
//                  {students.map(student => (
//                    <div key={student.id} className="flex items-center space-x-2">
//                      <Checkbox 
//                        id={`student-${student.id}`} 
//                        checked={formData.studentIds.includes(student.id)}
//                        onCheckedChange={() => toggleStudent(student.id)}
//                        data-testid={`checkbox-student-${student.id}`}
//                      />
//                      <label 
//                        htmlFor={`student-${student.id}`} 
//                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
//                      >
//                        {student.name} <span className="text-muted-foreground text-xs">({student.grade})</span>
//                      </label>
//                    </div>
//                  ))}
//               </div>
//             </div> */}
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSubmit}
//               disabled={createSession.isPending || updateSession.isPending}
//               data-testid="button-submit-session"
//             >
//               {editingId ? "Save Changes" : "Create Class"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//       <ManageExceptionsDialog
//         session={exceptionSession}
//         open={!!exceptionSession}
//         onOpenChange={(open) => !open && setExceptionSession(null)}
//       />
//       <Card className="border-none shadow-sm">
//      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4">
//   <CardTitle className="text-lg">Scheduled Classes</CardTitle>
//   <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
//     {/* Name Search */}
//     <div className="relative w-full sm:w-64">
//       <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//       <Input
//         placeholder="Search class name..."
//         value={searchName}
//         onChange={(e) => setSearchName(e.target.value)}
//         className="pl-8"
//       />
//     </div>
    
//     {/* Mobile Search */}
//     <div className="relative w-full sm:w-64">
//       <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//       <Input
//         placeholder="Search student mobile..."
//         value={searchMobile}
//         onChange={(e) => setSearchMobile(e.target.value)}
//         className="pl-8"
//         type="tel"
//       />
//     </div>
//   </div>
// </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Class Name</TableHead>
//                 <TableHead>Class Type</TableHead>
//                 <TableHead>Instructor</TableHead>
//                 <TableHead>Time</TableHead>
//                 <TableHead>Date Range</TableHead>
//                 <TableHead>Students</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {paginatedClasses.map((session) => {
//                 const teacher = teachers.find(
//                   (t) => t.id === session.teacherId,
//                 );
//                 return (
//                   <TableRow
//                     key={session.id}
//                     data-testid={`row-session-${session.id}`}
//                   >
//                     <TableCell className="font-medium">
//                       {session.name}
//                     </TableCell>
//                     <TableCell>
//                       <span
//                         className={`px-2 py-1 rounded text-xs font-medium capitalize ${
//                           session.session_type === "group"
//                             ? "bg-blue-100 text-blue-700"
//                             : "bg-green-100 text-green-700"
//                         }`}
//                       >
//                         {session.session_type}
//                       </span>
//                     </TableCell>
//                     <TableCell>{teacher?.name || "Unassigned"}</TableCell>
//                     <TableCell>
//                       <div className="flex items-center gap-2 text-sm">
//                         <CalendarClock className="h-3 w-3" />
//                        {formatTime(session.startTime)} - {formatTime(session.endTime)}

//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <div className="flex items-center gap-2 text-sm">
//                         <CalendarRange className="h-3 w-3" />
//                      {formatDate(session.startDate)} to {formatDate(session.endDate)}
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <div className="flex items-center gap-2 text-sm">
//                         <UserCheck className="h-3 w-3 text-muted-foreground" />
//                         {/* {session.studentIds.length} Enrolled */}
//                         <Link href={`/sessions/${session.id}/enrollments`}>
//                           <Button size="sm" variant="outline">
//                             Enroll Students
//                           </Button>
//                         </Link>
//                       </div>
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex just ify-end gap-2">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           title="Schedule Exception"
//                           onClick={() => setExceptionSession(session)}
//                         >
//                           <CalendarX className="h-4 w-4 text-orange-500" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => handleOpenDialog(session)}
//                           data-testid={`button-edit-session-${session.id}`}
//                         >
//                           <Pencil className="h-4 w-4 text-muted-foreground" />
//                         </Button>

//                         <AlertDialog>
//                           <AlertDialogTrigger asChild>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               data-testid={`button-delete-session-${session.id}`}
//                             >
//                               <Trash2 className="h-4 w-4 text-destructive" />
//                             </Button>
//                           </AlertDialogTrigger>
//                           <AlertDialogContent>
//                             <AlertDialogHeader>
//                               <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                               <AlertDialogDescription>
//                                 This will delete the session and all attendance
//                                 records associated with it.
//                               </AlertDialogDescription>
//                             </AlertDialogHeader>
//                             <AlertDialogFooter>
//                               <AlertDialogCancel>Cancel</AlertDialogCancel>
//                               <AlertDialogAction
//                                 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//                                 onClick={() => handleDelete(session.id)}
//                                 disabled={deleteSession.isPending}
//                               >
//                                 Delete
//                               </AlertDialogAction>
//                             </AlertDialogFooter>
//                           </AlertDialogContent>
//                         </AlertDialog>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 );
//               })}
//               {sessions.length === 0 && (
//                 <TableRow>
//                   <TableCell
//                     colSpan={6}
//                     className="text-center py-8 text-muted-foreground"
//                   >
//                     No sessions scheduled.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//           <div className="flex justify-between items-center mt-4">
//             <span className="text-sm text-muted-foreground">
//               Page {currentPage} of {totalPages}
//             </span>

//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 disabled={currentPage === 1}
//                 onClick={() => setCurrentPage((p) => p - 1)}
//               >
//                 Previous
//               </Button>

//               <Button
//                 variant="outline"
//                 size="sm"
//                 disabled={currentPage === totalPages}
//                 onClick={() => setCurrentPage((p) => p + 1)}
//               >
//                 Next
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  useSessions,
  useCreateSession,
  useUpdateSession,
  useDeleteSession,
  useTeachers,
  useStudents,
  useDepartments,
  useBulkImportSessions,
  useSessionEnrollments,
} from "@/lib/hooks";
import type { Session } from "@shared/schema";
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
  Upload,
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
import { ManageExceptionsDialog } from "./ManageExceptionsDialog";
import { CalendarX } from "lucide-react";
import Papa from "papaparse";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Helper for Day Names
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Sessions() {
  const [searchMobile, setSearchMobile] = useState("");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [exceptionSession, setExceptionSession] = useState<Session | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { toast } = useToast();
  const [searchName, setSearchName] = useState("");
  const { data: sessions = [], isLoading: loadingSessions } = useSessions();
  const { data: teachers = [], isLoading: loadingTeachers } = useTeachers();
  const { data: students = [], isLoading: loadingStudents } = useStudents();
  const { data: departments = [], isLoading: loadingDepartments } = useDepartments();

  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();
  const bulkImportSessions = useBulkImportSessions();
  const { data: allEnrollments = [], isLoading: loadingEnrollments } = useSessionEnrollments();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const [formData, setFormData] = useState({
    name: "",
    teacherId: "",
    session_type: "private" as "private" | "group",
    departmentId: "",
    startTime: "09:00",
    endTime: "10:00",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    daysOfWeek: [] as number[], // Added this
  });

  const toggleDay = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(dayIndex)
        ? prev.daysOfWeek.filter(i => i !== dayIndex)
        : [...prev.daysOfWeek, dayIndex].sort()
    }));
  };

  const isLoading = loadingSessions || loadingTeachers || loadingDepartments || loadingStudents || loadingEnrollments;

  const filteredClasses = sessions.filter((session) => {
    const matchesName = session.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesMobile = searchMobile === "" || allEnrollments
      .filter(enrollment => enrollment.sessionId === session.id)
      .some(enrollment => {
        const student = students.find(s => s.id === enrollment.studentId);
        return student?.mobile?.includes(searchMobile);
      });
    return matchesName && matchesMobile;
  });

  const totalPages = Math.ceil(filteredClasses.length / pageSize);
  const paginatedClasses = filteredClasses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenDialog = (session?: Session) => {
    if (session) {
      setEditingId(session.id);
      setFormData({
        name: session.name,
        teacherId: session.teacherId,
        session_type: session.session_type,
        departmentId: session.departmentId,
        startTime: session.startTime,
        endTime: session.endTime,
        startDate: session.startDate,
        endDate: session.endDate,
        daysOfWeek: session.daysOfWeek || [], // Load existing days
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        teacherId: "",
        departmentId: "",
        startTime: "09:00",
        endTime: "10:00",
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        session_type: "private",
        daysOfWeek: [], // Default empty
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.teacherId || !formData.departmentId) return;

    if (editingId) {
      await updateSession.mutateAsync({ id: editingId, data: formData });
    } else {
      await createSession.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteSession.mutateAsync(id);
  };

  const handleCsvUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as any[];
          if (!rows.length) {
            toast({ variant: "destructive", title: "Error", description: "No data found in csv file" });
            return;
          }
          const res = await bulkImportSessions.mutateAsync(rows);
          toast({ title: "success", description: `Imported ${res.inserted}, Failed ${res.failed}` });
          setIsImportDialogOpen(false);
        } catch {
          toast({ variant: "destructive", title: "Import Failed", description: "Import failed" });
        }
      },
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchName]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-bold tracking-tight">Classes</h1>
            <p className="text-muted-foreground">Manage classes, dates, and enrollments.</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="border-none shadow-sm">
          <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (<Skeleton key={i} className="h-16 w-full" />))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">Manage classes, dates, and enrollments.</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" onClick={() => handleOpenDialog()} data-testid="button-add-session">
            <Plus className="h-4 w-4" /> Create Class
          </Button>
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" /> Import CSV
          </Button>
        </div>
      </div>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Sessions from CSV</DialogTitle>
            <DialogDescription>Upload a CSV file</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input type="file" accept=".csv" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCsvUpload(file);
            }} />
            {importError && <p className="text-sm text-destructive">{importError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Class" : "Create New Class"}</DialogTitle>
            <DialogDescription>Set up class details, duration, and assign students.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Class Name</label>
                <Input placeholder="e.g. Advanced Biology" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} data-testid="input-session-name" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Session Type</label>
                <Select value={formData.session_type} onValueChange={(val: "private" | "group") => setFormData({ ...formData, session_type: val })}>
                  <SelectTrigger><SelectValue placeholder="Select session type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Teacher</label>
                <Select value={formData.teacherId} onValueChange={(val) => setFormData({ ...formData, teacherId: val })}>
                  <SelectTrigger data-testid="select-session-teacher"><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Course</label>
                <Select value={formData.departmentId} onValueChange={(val) => setFormData({ ...formData, departmentId: val })}>
                  <SelectTrigger data-testid="select-session-department"><SelectValue placeholder="Select Department" /></SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* NEW LOGIC: Days of the week selection */}
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Repeat on Days</label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map((day, index) => (
                    <Button
                      key={day}
                      type="button"
                      variant={formData.daysOfWeek.includes(index) ? "default" : "outline"}
                      className="w-12 h-10 p-0"
                      onClick={() => toggleDay(index)}
                    >
                      {day[0]}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} data-testid="input-session-start-time" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Time</label>
                <Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} data-testid="input-session-end-time" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} data-testid="input-session-start-date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} data-testid="input-session-end-date" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createSession.isPending || updateSession.isPending} data-testid="button-submit-session">
              {editingId ? "Save Changes" : "Create Class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ManageExceptionsDialog session={exceptionSession} open={!!exceptionSession} onOpenChange={(open) => !open && setExceptionSession(null)} />

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4">
          <CardTitle className="text-lg">Scheduled Classes</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search class name..." value={searchName} onChange={(e) => setSearchName(e.target.value)} className="pl-8" />
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search student mobile..." value={searchMobile} onChange={(e) => setSearchMobile(e.target.value)} className="pl-8" type="tel" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Class Type</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClasses.map((session) => {
                const teacher = teachers.find((t) => t.id === session.teacherId);
                return (
                  <TableRow key={session.id} data-testid={`row-session-${session.id}`}>
                    <TableCell className="font-medium">
                      {session.name}
                      {/* Sub-label for days in the table cell */}
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {session.daysOfWeek?.length > 0 
                          ? session.daysOfWeek.map(d => DAYS[d]).join(", ") 
                          : "No days set"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${session.session_type === "group" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                        {session.session_type}
                      </span>
                    </TableCell>
                    <TableCell>{teacher?.name || "Unassigned"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarClock className="h-3 w-3" />
                        {formatTime(session.startTime)} - {formatTime(session.endTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarRange className="h-3 w-3" />
                        {formatDate(session.startDate)} to {formatDate(session.endDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <UserCheck className="h-3 w-3 text-muted-foreground" />
                        <Link href={`/sessions/${session.id}/enrollments`}>
                          <Button size="sm" variant="outline">Enroll Students</Button>
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Schedule Exception" onClick={() => setExceptionSession(session)}>
                          <CalendarX className="h-4 w-4 text-orange-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(session)} data-testid={`button-edit-session-${session.id}`}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-delete-session-${session.id}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>This will delete the session and all attendance records associated with it.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDelete(session.id)} disabled={deleteSession.isPending}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No sessions scheduled.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}