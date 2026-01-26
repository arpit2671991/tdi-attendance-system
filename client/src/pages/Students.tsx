import {useState, useEffect} from 'react'
import { useAttendance, useSessions, useBulkImportStudents, useCreateStudent, useDeleteStudent, useDepartmentHours, useDepartmentLevels, useDepartments, useStudents, useTeachers, useUpdateStudent, useSessionEnrollments } from '@/lib/hooks';
import type { Student } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CalendarClock, UserCheck, Pencil, Trash2, CalendarRange, Search, Upload, Badge  } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Papa from "papaparse";
import { useToast } from "@/hooks/use-toast";


export default function Students() {
const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
const [importError, setImportError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { toast } = useToast();

  const [searchName, setSearchName] = useState("");
  const [searchMobile, setSearchMobile] = useState("");
  
  const {data: students = [], isLoading: loadingStudents} = useStudents();
  const {data: teachers = [], isLoading: loadingTeachers} = useTeachers();
  const {data: courses = [], isLoading: loadingCourses} = useDepartments();
  const {data: courseLevels = [], isLoading: loadingCourseLevels} = useDepartmentLevels();
  const {data: courseHours = [], isLoading: loadingCourseHours} = useDepartmentHours();
   const {data: sessions = [], isLoading: loadingSessions} = useSessions();
   const { data: enrollments = [], isLoading: loadingEnrollments } = useSessionEnrollments();


  const bulkImportStudents = useBulkImportStudents();



  const createStudents = useCreateStudent()
  const updateStudents = useUpdateStudent()
  const deleteStudents = useDeleteStudent()

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
    civil_id: "",
    mobile: "",
    teacherId: "",
    courseLevelId: "",
    courseHoursId: "",
    courseId: "",
    classStartDate: "",
    classEndDate: "",
    classStartTime: "",
    classEndtime: "",
    remarks: "",
    isActive: true,
    totalCourseHours: 0
  })

 const isLoading = loadingCourseHours || loadingCourseLevels || loadingCourses || 
                  loadingTeachers || loadingStudents || loadingSessions || loadingEnrollments;
const filteredStudents = students.filter((student) => {
  const matchesName = student.name.toLowerCase().includes(searchName.toLowerCase());
  const matchesMobile = student.mobile.includes(searchMobile);
  return matchesName && matchesMobile;
});
  const totalPages = Math.ceil(filteredStudents.length / pageSize);

const paginatedStudents = filteredStudents.slice(
  (currentPage - 1) * pageSize,
  currentPage * pageSize
);

  const handleOpenDialog  = (student?: Student) => {
    if (student){
      setEditingId(student.id);
      setFormData({
        name: student.name,
        civil_id: student.civil_id,
        mobile: student.mobile,
        teacherId: student.teacherId,
        courseHoursId: student.courseHoursId,
        courseLevelId: student.courseLevelId,
        courseId: student.courseId,
        classStartDate: student.classStartDate,
        classEndDate: student.classEndDate,
        classStartTime: student.classStartTime,
        classEndtime: student.classEndtime,
        remarks: student.remarks,
        isActive: student.isActive,
        totalCourseHours: student.totalCourseHours

      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        civil_id: "",
        mobile: "",
        teacherId: "",
        courseLevelId: "",
        courseHoursId: "",
        courseId: "",
        classStartDate: "",
        classEndDate: "",
        classStartTime: "",
        classEndtime: "",
        remarks: "",
        isActive: true,
        totalCourseHours: 0,
      })
    }
    setIsDialogOpen(true)
  }
const handleStudentCsvUpload = (file: File) => {
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

        const res = await bulkImportStudents.mutateAsync(rows);

        toast({ title: "success",  description: `Imported ${res.inserted}, Failed ${res.failed}`
        
         
      });
      setIsImportDialogOpen(false)
      } catch {
        toast({ variant: "destructive", title:"Import Failed", description: "Import failed"});
      }
    },
  });
};


  
  const handleSubmit = async () => {
    if(
      !formData.name || 
      !formData.mobile || 
      !formData.teacherId ||
      !formData.courseLevelId ||
      !formData.courseHoursId ||
      !formData.courseId ||
      !formData.classStartDate ||
      !formData.classEndDate ||
      !formData.classStartTime ||
      !formData.classEndtime
    ) return


    if(editingId){
      await updateStudents.mutateAsync({id: editingId, data:formData})
    } else {
       await createStudents.mutateAsync(formData)
    }
    setIsDialogOpen(false)  
  }

  const handleDelete = async(id: string) => {
    await deleteStudents.mutateAsync(id)
  }
  


useEffect(() => {
  setCurrentPage(1);
}, [searchName]);

  if(isLoading){
    return(
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-bold tracking-tight">Student Registration</h1>
            <p className="text-muted-foreground">Manage students registration</p>
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
    )
  }

 

  return(
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold tracking-tight">Students Registration</h1>
          <p className="text-muted-foreground">Manage students registration.</p>
        </div>
        
       <div className="flex gap-2">
        
  <Button className="gap-2" onClick={() => handleOpenDialog()}>
    <Plus className="h-4 w-4" /> Register New Student
  </Button>
  <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
    <Upload className="h-4 w-4 mr-2" />
    Import CSV
  </Button>
</div>

        
      </div>

<Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Import Students from CSV</DialogTitle>
      <DialogDescription>
        Upload a CSV file using names instead of IDs
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      <Input
        type="file"
        accept=".csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleStudentCsvUpload(file);
        }}
      />

      {importError && (
        <p className="text-sm text-destructive">{importError}</p>
      )}

      <div className="text-sm text-muted-foreground">
        Required columns:
        <ul className="list-disc ml-4 mt-1">
          <li>name</li>
          <li>mobile</li>
          <li>teacher_name</li>
          <li>course_name</li>
          <li>course_level</li>
          <li>course_hours</li>
          <li>class_start_date</li>
          <li>class_end_date</li>
          <li>class_start_time</li>
          <li>class_end_time</li>
        </ul>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
        Cancel
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Registration Details' : 'Register new student'}</DialogTitle>
            <DialogDescription>
              Manage registration details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Student full name</label>
                <Input 
                  placeholder="e.g. Full name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  data-testid="input-stduent-name"
                />
              </div>
               <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Civil ID</label>
                <Input 
                  placeholder="e.g. Civil ID" 
                  value={formData.civil_id}
                  onChange={(e) => setFormData({...formData, civil_id: e.target.value})}
                  data-testid="input-civil-id"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Mobile Number</label>
                <Input 
                  placeholder="e.g. Mobile No." 
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  data-testid="input-mobile"
                />
              </div>
              <div className="space-y-2 col-span-2">
                 <label className="text-sm font-medium">Teacher</label>
                 <Select 
                   value={formData.teacherId} 
                   onValueChange={(val) => setFormData({...formData, teacherId: val})}
                 >
                   <SelectTrigger data-testid="select-session-teacher">
                     <SelectValue placeholder="Select Teacher" />
                   </SelectTrigger>
                   <SelectContent className="max-h-60 overflow-y-auto">
                     {teachers.map(t => (
                       <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>
              <div className="space-y-2 col-span-2">
                 <label className="text-sm font-medium">Course</label>
                 <Select 
                   value={formData.courseId} 
                   onValueChange={(val) => setFormData({...formData, courseId: val})}
                 >
                   <SelectTrigger data-testid="select-course">
                     <SelectValue placeholder="Select Course" />
                   </SelectTrigger>
                   <SelectContent className="max-h-60 overflow-y-auto">
                     {courses.map(d => (
                       <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>
                <div className="space-y-2 col-span-2">
                 <label className="text-sm font-medium">Course Level</label>
                 <Select 
                   value={formData.courseLevelId} 
                   onValueChange={(val) => setFormData({...formData, courseLevelId: val})}
                 >
                   <SelectTrigger data-testid="select-course-level">
                     <SelectValue placeholder="Select Course Level" />
                   </SelectTrigger>
                   <SelectContent className="max-h-60 overflow-y-auto">
                     {courseLevels.map(l => (
                       <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>
                <div className="space-y-2 col-span-2">
                 <label className="text-sm font-medium">Course Hours</label>
                 <Select 
                   value={formData.courseHoursId} 
                   onValueChange={(val) => setFormData({...formData, courseHoursId: val})}
                 >
                   <SelectTrigger data-testid="select-hours">
                     <SelectValue placeholder="Select Course Hours" />
                   </SelectTrigger>
                   <SelectContent className="max-h-60 overflow-y-auto">
                     {courseHours.map(h => (
                       <SelectItem key={h.id} value={h.id}>{h.hours}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Class Start Date</label>
                <Input 
                  type="date"
                  value={formData.classStartDate}
                  onChange={(e) => setFormData({...formData, classStartDate: e.target.value})}
                  data-testid="input-class-start-date"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Class End Date</label>
                <Input 
                  type="date"
                  value={formData.classEndDate}
                  onChange={(e) => setFormData({...formData, classEndDate: e.target.value})}
                  data-testid="input-class-end-date"
                />
              </div>
                <div className="space-y-2">
                <label className="text-sm font-medium">Class Start Time</label>
                <Input 
                  type="time"
                  value={formData.classStartTime}
                  onChange={(e) => setFormData({...formData, classStartTime: e.target.value})}
                  data-testid="input-class-start-time"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Class End Time</label>
                <Input 
                  type="time"
                  value={formData.classEndtime}
                  onChange={(e) => setFormData({...formData, classEndtime: e.target.value})}
                  data-testid="input-class-end-time"
                />
              </div>
              <div className="space-y-2 col-span-2 hidden">
                <label className="text-sm font-medium">Total Course Hours</label>
                <Input 
                  type="number"
                  placeholder="e.g. 40" 
                  value={formData.totalCourseHours}
                  onChange={(e) => setFormData({...formData, totalCourseHours: parseFloat(e.target.value) || 0})}
                  data-testid="input-total-course-hours"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Remarks</label>
                <Textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  data-testid="input-remarks"
                />
              </div>
               <div className="space-y-2">
                <label>Is Active</label>
                <RadioGroup value={formData.isActive ? "true" : "false"} onValueChange={(val) => setFormData({...formData, isActive: val === "true"})}>
                 <div className="flex items-center space-x-2">
                   <RadioGroupItem value="true" id="active-true" />
                   <label htmlFor="active-true" className="font-normal cursor-pointer">Yes</label>
                 </div>
                 <div className="flex items-center space-x-2">
                   <RadioGroupItem value="false" id="active-false" />
                   <label htmlFor="active-false" className="font-normal cursor-pointer">No</label>
                 </div>
                </RadioGroup>
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createStudents.isPending || updateStudents.isPending}
              data-testid="button-submit-student"
            >
              {editingId ? 'Save Changes' : 'Register'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
     
          
  
            
         
      <Card className="border-none shadow-sm">
        <CardHeader className='flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 pb-4'>
  <CardTitle className="text-lg">Students List</CardTitle>
  
  <div className='flex flex-wrap gap-2 w-full md:w-auto'>
    {/* Name Search */}
    <div className='relative w-full sm:w-64'>
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search by name..."
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        className="pl-8"
      />
    </div>

    {/* Mobile Search */}
    <div className='relative w-full sm:w-48'>
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search by mobile..."
        value={searchMobile}
        onChange={(e) => setSearchMobile(e.target.value)}
        className="pl-8"
        type="tel"
      />
    </div>

    {/* Optional: Clear Filters Button */}
    {(searchName || searchMobile) && (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => { setSearchName(""); setSearchMobile(""); }}
        className="text-muted-foreground"
      >
        Clear
      </Button>
    )}
  </div>
</CardHeader>
        <CardContent>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Class Dates</TableHead>
                <TableHead>Class Time</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Is Active</TableHead>

                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.map((student) => {
                const teacher = teachers.find(t => t.id === student.teacherId);
                const course = courses.find(c => c.id === student.courseId);
                const courseLevel = courseLevels.find(l => l.id === student.courseLevelId);
                const CourseHour = courseHours.find(h => h.id === student.courseHoursId);
                // 1. Find if this student has an enrollment record
    const studentEnrollment = enrollments.find((e) => e.studentId === student.id);
    
    // 2. If an enrollment exists, find the session details
    const session = sessions.find((s) => s.id === studentEnrollment?.sessionId);
               

                return (
                  <TableRow key={student.id} data-testid={`row-session-${student.id}`}>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>
          {session ? (
            <span className="font-medium ">{session.name}</span>
          ) : (
            <span className="text-muted-foreground text-xs italic">Not Enrolled</span>
          )}
        </TableCell>

        {/* --- Session Type Cell --- */}
       <TableCell>
        {session?.session_type ?
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          session?.session_type === "group"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {session?.session_type}
                      </span> 
                : <span>-</span>
                      }
                    </TableCell>
                    <TableCell>
                      {teacher?.name || 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      {course?.name || 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      {courseLevel?.name || 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      {CourseHour?.hours || 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarRange className="h-3 w-3" />
                        {formatDate(student.classStartDate)} to {formatDate(student.classEndDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm ">
                        <CalendarClock className="h-3 w-3" />
                          {formatTime(student.classStartTime)} - {formatTime(student.classEndtime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {student.remarks || "N/A"}
                    </TableCell>
                    <TableCell>
                      {student.isActive ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenDialog(student)}
                          data-testid={`button-edit-session-${student.id}`}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              data-testid={`button-delete-session-${student.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete the student and all attendance records associated with it.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                                onClick={() => handleDelete(student.id)}
                                disabled={deleteStudents.isPending}
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
              {students.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                     No sessions scheduled.
                   </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
  <span className="text-sm text-muted-foreground">
    Page {currentPage} of {totalPages}
  </span>

  <div className="flex gap-2">
    <Button
      variant="outline"
      size="sm"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
    >
      Previous
    </Button>

    <Button
      variant="outline"
      size="sm"
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((p) => p + 1)}
    >
      Next
    </Button>
  </div>
</div>

        </CardContent>
      </Card>
    </div>
  )

}