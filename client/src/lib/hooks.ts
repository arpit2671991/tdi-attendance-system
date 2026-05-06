import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  adminApi, 
  teacherApi,
  departmentLevelApi,
  departmentHourApi,
  departmentApi, 
  studentApi, 
  sessionApi,
  sessionEntrollmentApi,
  attendanceApi,
  teacherAttendanceApi,
  reportsTeacherAttendanceApi,
  reportsStudentsAttendanceApi,
  payrollTeachers,
  reportsStudentCourseHoursApi,
  notificationApi
  

} from "./api";
import { useToast } from "@/hooks/use-toast";
import { error } from "console";
import { string } from "zod";
import { title } from "process";
import { toast } from "sonner";
import { InsertDepartment, InsertDepartmentHour, InsertDepartmentLevel, InsertTeacher } from "@shared/schema";

// Query keys
export const queryKeys = {
  admins: ["admins"] as const,
  teachers: ["teachers"] as const,
  teacher: (id: string) => ["teacher", id] as const,
  department_levels: ["departments_levels"] as const,
  department_level: (id: string) => ["department_level", id] as const,
  department_hours: ["department_hours"] as const,
  department_hour: (id: string) => ["department_hour", id] as const,
  departments: ["departments"] as const,
  department: (id: string) => ["department", id] as const,
  students: ["students"] as const,
  student: (id: string) => ["student", id] as const,
  sessions: ["sessions"] as const,
  session: (id: string) => ["session", id] as const,
  dailySchedule: (date: string) => ["schedule", "daily", date] as const,
  sessionExceptions: (sessionId: string) => ["sessions", sessionId, "exceptions"] as const,
  sessionEntrollments:{
    all: ["session-entrollment"] as const,
    bySession: (sessionId: string) => ["session-entrollment", "session", sessionId] as const,
    byStudent: (studentId: string) => ["session-entrollment", "student", studentId] as const,

  },
  attendance: {
    list: (filters: any) => ["attendance", filters] as const,
    teacher: (filters: any) => ["teachers-attendance", filters] as const,
  },
  teachersAttendanceReports: (filters?: any) => ["teachers-attendance-reports", filters] as const,
  studentsAttendanceReports: (filters?: any) => ["students-attendance-reports", filters] as const,
  teacherWorkHours: (filters?: any) => ["teacherWorkHours", filters] as const,
  studentCourseHours: (filters?: any) => ["studentCourseHours", filters] as const,
  notifications: ["notifications"] as const,

}; 




// Admin hooks
export function useAdmins() {
  return useQuery({
    queryKey: queryKeys.admins,
    queryFn: adminApi.getAll,
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: adminApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admins });
      toast({ title: "Admin created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create admin", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: adminApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admins });
      toast({ title: "Admin deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete admin", description: error.message, variant: "destructive" });
    },
  });
}

// Teacher hooks
export function useTeachers() {
  return useQuery({
    queryKey: queryKeys.teachers,
    queryFn: teacherApi.getAll,
  });
}

export function useTeacher(id: string) {
  return useQuery({
    queryKey: queryKeys.teacher(id),
    queryFn: () => teacherApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: teacherApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
      toast({ title: "Teacher created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create teacher", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => teacherApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
      toast({ title: "Teacher updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update teacher", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: teacherApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
      toast({ title: "Teacher deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete teacher", description: error.message, variant: "destructive" });
    },
  });
}

// Department Level hooks
export function useDepartmentLevels() {
  return useQuery({
    queryKey: queryKeys.department_levels,
    queryFn: departmentLevelApi.getAll,
  });
}

export function useCreateDepartmentLevel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: departmentLevelApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.department_levels });
      toast({ title: "Course Level created successfully" });
    },
    onError: (error: any) => {
      console.log(error)
      toast({ title: "Failed to create Course Level", description: error, variant: "destructive" });
    },
  });
}

export function useUpdateDepartmentLevel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => departmentLevelApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.department_levels });
      toast({ title: "Course Level updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update Course Level", description: error.message, variant: "destructive" });
    },
  });
}


export function useDeleteDepartmentLevel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: departmentLevelApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.department_levels });
      toast({ title: "Course Level deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete department level", description: error.message, variant: "destructive" });
    },
  });
}

// Department Hours hooks
export function useDepartmentHours(){
  return useQuery({
    queryKey: queryKeys.department_hours,
    queryFn: departmentHourApi.getAll,
  })
}

export function useCreateDepartmentHour(){
  const queryClient = useQueryClient()
  const {toast} = useToast()
  return useMutation({
    mutationFn: departmentHourApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.department_hours})
      toast({title: "Course hour created successfully"})
    },
    onError: (error: any) => {
      console.log(error)
      toast({title: "Failed to create course hour", description: error.message, variant: "destructive"})
    }
  })
}

export function useUpdateDepartmentHour(){
  const queryClient = useQueryClient()
  const {toast} = useToast()
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: any}) => departmentHourApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.department_hours}),
      toast({title: "Course hour updated successfully"})
    },
    onError: (error: any) => {
      toast({title: "Failed to update course hour", description: error.message, variant: "destructive"})
    }
    
  })

}

export function useDeleteDepartmentHour(){
   const queryClient = useQueryClient();
   const { toast } = useToast();
   return useMutation({
    mutationFn: departmentHourApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.department_hours });
      toast({ title: "Course hour deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete department hour", description: error.message, variant: "destructive" });
    },
  });
}


// Department hooks
export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments,
    queryFn: departmentApi.getAll,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: departmentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments });
      toast({ title: "Department created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create department", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => departmentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments });
      toast({ title: "Department updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update department", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: departmentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments });
      toast({ title: "Department deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete department", description: error.message, variant: "destructive" });
    },
  });
}

// Student hooks
export function useStudents() {
  return useQuery({
    queryKey: queryKeys.students,
    queryFn: studentApi.getAll,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: studentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students });
      toast({ title: "Student created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create student", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => studentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students });
      toast({ title: "Student updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update student", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: studentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students });
      toast({ title: "Student deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete student", description: error.message, variant: "destructive" });
    },
  });
}

// Session hooks
export function useSessions() {
  return useQuery({
    queryKey: queryKeys.sessions,
    queryFn: sessionApi.getAll,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: sessionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
      toast({ title: "Session created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create session", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => sessionApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
      toast({ title: "Session updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update session", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: sessionApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
      toast({ title: "Session deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete session", description: error.message, variant: "destructive" });
    },
  });
}


// Session Enrollment Hooks

export function useSessionEnrollmentsBySession(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.sessionEntrollments.bySession(sessionId),
    queryFn: () => sessionEntrollmentApi.getAll({sessionId}),
    enabled: !!sessionId, // only run if sessionId exists
  });
}

export function useSessionEnrollmentsByStudent(studentId: string) {
  return useQuery({
    queryKey: queryKeys.sessionEntrollments.byStudent(studentId),
    queryFn: () => sessionEntrollmentApi.getAll({ studentId }),
    enabled: !!studentId,
  });
}


export function useCreateSessionEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionEntrollmentApi.create,

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessionEntrollments.bySession(variables.sessionId),
      });
    },
  });
}


export function useDeleteSessionEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sessionEntrollmentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessionEntrollments.all });
    },
  });
}

export function useSessionEnrollments(studentId: string) {
  return useQuery({
    queryKey:  queryKeys.sessionEntrollments.byStudent(studentId),
    queryFn: sessionEntrollmentApi.getAll,
    // enabled: !!studentId 
  });
}


export function useCreateSesssionEntrollment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: sessionEntrollmentApi.create,
    onSuccess: (__, variable) => {
      const {studentId, sessionId} = variable
      queryClient.invalidateQueries({ queryKey: queryKeys.sessionEntrollments.byStudent(studentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessionEntrollments.bySession(sessionId) });
      toast({ title: "Session created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create session", description: error.message, variant: "destructive" });
    },
  });
}
// Attendance hooks

export function useAttendance(filters: { sessionId?: string; studentId?: string; date?: string }) {
  return useQuery({
    queryKey: queryKeys.attendance.list(filters),
    queryFn: () => attendanceApi.get(filters),
    // enabled: !!(filters.sessionId || filters.studentId),
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: attendanceApi.mark,
    onSuccess: (_, variables) => {
      // Invalidate the specific list currently being viewed
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.attendance.list({ 
          sessionId: variables.sessionId, 
          date: variables.date 
        }) 
      });
      toast({ title: "Attendance updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to mark attendance", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
}
/** Teacher Attendance */
export function useTeacherAttendance(filters: { sessionId?: string; teacherId?: string; date?: string }) {
  return useQuery({
    queryKey: queryKeys.attendance.teacher(filters),
    queryFn: () => teacherAttendanceApi.get(filters),
  });
}


export function useDeleteTStudentAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: attendanceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students-attendance-reports"] });
      toast({ title: "Student attendance deleted successfully" });
    },
    onError: (error: any) => {
      console.log(error)
      toast({ title: "Failed to delete student attendance", description: error.message, variant: "destructive" });
    },
  });
}
export function useMarkTeacherAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: teacherAttendanceApi.mark,
    onSuccess: (_, variables) => {
      // Refresh the teacher attendance view for this session/date
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.attendance.teacher({ 
          sessionId: variables.sessionId, 
          date: variables.date 
        }) 
      });
      toast({ title: "Teacher attendance logged successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });
}

export function useTeachersAttendanceReports(filters?: any) {
  return useQuery({
    queryKey: queryKeys.teachersAttendanceReports(filters),
    queryFn: () => reportsTeacherAttendanceApi.getAll(filters),
  });
}

export function useDeleteTeacherAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: teacherAttendanceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers-attendance-reports"] });
      toast({ title: "Teacher attendance deleted successfully" });
    },
    onError: (error: any) => {
      console.log(error)
      toast({ title: "Failed to delete Teacher attendance", description: error.message, variant: "destructive" });
    },
  });
}

export function useStudentsAttendanceReports(filters?: any) {
  return useQuery({
    queryKey: queryKeys.studentsAttendanceReports(filters),
    queryFn: () => reportsStudentsAttendanceApi.getAll(filters),
  });
}

export function useTeacherWorkHours(filters?: any) {
  return useQuery({
    queryKey: queryKeys.teacherWorkHours(filters),
    queryFn: () => payrollTeachers.getTeacherWorkHours(filters),
  });
}

// export function useStudentCourseHours(filters?: any) {
//   return useQuery({
//     queryKey: queryKeys.studentCourseHours(filters),
//     queryFn: () => studentsCourseHoursApi.getStudentsCourseHours(filters),
//   });
// }



export function useStudentCourseHours() {
  return useQuery({
    queryKey: ["students-course-hours"],
    queryFn: () => reportsStudentCourseHoursApi.getAll(),
    
  });
}


// BULK IMPORTS 
// COURSE HOURS

export const useBulkImportDepartmentHours = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (hours: InsertDepartmentHour[]) =>
      departmentHourApi.bulkImport(hours),

    onSuccess: (res) => {
      // 1️⃣ Refresh department hours query
      queryClient.invalidateQueries({
        queryKey: ["department_hours"],
      });

      // 2️⃣ Show actual inserted vs requested
      toast.success(
        `Successfully imported ${res.inserted} of ${res.requested} department hours`
      );
    },

    onError: (err: any) => {
      console.error("Bulk import error:", err);
      toast.error("Failed to import department hours");
    },
  });
};


// COURSE LEVELS

export const useBulkImportDepartmentLevels = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (levels: InsertDepartmentLevel[]) =>
      departmentLevelApi.bulkImport(levels),

    onSuccess: (res) => {
      // 1️⃣ Refresh department levels query
      queryClient.invalidateQueries({
        queryKey: ["departments_levels"],
      });

      // 2️⃣ Show toast with actual inserted vs requested
      toast.success(
        `Successfully imported ${res.inserted} of ${res.requested} course levels`
      );
    },

    onError: (err: any) => {
      console.error("Bulk import error:", err);
      toast.error("Failed to import course levels");
    },
  });
};

// COURSES
export const useBulkImportDepartmentCourses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: InsertDepartment[]) =>
      departmentApi.bulkImport(name),

    onSuccess: (res) => {
      // 1️⃣ Refresh department levels query
      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });

      // 2️⃣ Show toast with actual inserted vs requested
      toast.success(
        `Successfully imported ${res.inserted} of ${res.requested} courses`
      );
    },

    onError: (err: any) => {
      console.error("Bulk import error:", err);
      toast.error("Failed to import courses");
    },
  });
};

// Bulk import teachers hook
export const useBulkImportTeachers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teachers: InsertTeacher[]) => teacherApi.bulkImport(teachers),

    onSuccess: (res) => {
      // Invalidate the teachers query so the list updates automatically
      queryClient.invalidateQueries({ queryKey: ["teachers"] });

      // Show toast notification with inserted count
      toast.success(
        `Imported ${res.inserted} of ${res.requested} teachers successfully`
      );
    },

    onError: (err) => {
      console.error("Bulk import teachers error:", err);
      toast.error("Failed to import teachers");
    },
  });
};

// Add this to your hooks file
export function useAllSessionExceptions(date?: string) {
  return useQuery({
    queryKey: ["session-exceptions", date],
    queryFn: () => sessionApi.getAllExceptions(date),
  });
}

export function useSessionExceptions(sessionId: string) {
  return useQuery({
    queryKey: ["sessions", sessionId, "exceptions"],
    queryFn: () => sessionApi.getExceptions(sessionId),
    enabled: !!sessionId,
  });
}

// Hook to create an exception (Cancel/Postpone)
export function useCreateException() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: any }) => 
      sessionApi.createException(sessionId, data),
    onSuccess: (_, variables) => {
      // Invalidate the exceptions list and the general sessions list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.sessionExceptions(variables.sessionId) 
      });
     queryClient.invalidateQueries({ 
        queryKey: ["schedule", "daily"] // Clears all daily schedule caches
      });
      toast({
        title: "Schedule Updated",
        description: "The change has been applied to the calendar.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      console.log(error)
    }
  });
}

// Hook to delete an exception
export function useDeleteException(sessionId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => sessionApi.deleteException(id),
    onSuccess: () => {
     // Refresh the exceptions list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.sessionExceptions(sessionId) 
      });
      // Refresh the daily agenda
      queryClient.invalidateQueries({ 
        queryKey: ["schedule", "daily"] 
      });
      toast({ title: "Exception removed", description: "Reverted to normal schedule." });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useDailySchedule(date: string, teacherId?: string | number) {
  return useQuery({
    // We include teacherId in the queryKey. 
    // This creates separate cache entries for Admin (undefined) vs Teacher (ID)
    queryKey: ["schedule", "daily", date, teacherId?.toString()],
    
    // Explicitly typing the query function return based on our new API structure
    queryFn: async () => {
      const data = await sessionApi.getDailySchedule(date, teacherId?.toString());
      return data;
    },
    
    // Only run if we have a date. 
    enabled: !!date, 
    
    // Keep the dashboard live - 5 minute refetch
    refetchInterval: 1000 * 60 * 5, 

    // Optional: Add placeholder or initial data logic if needed
    staleTime: 1000 * 30, // Consider data fresh for 30 seconds
  });
}

// export function useDailySchedule(date: string, teacherId?: string | number) {
//   return useQuery({
//     // We include teacherId in the queryKey. 
//     // This creates separate cache entries for Admin (undefined) vs Teacher (ID)
//     queryKey: ["schedule", "daily", date, teacherId?.toString()],
    
//     queryFn: () => sessionApi.getDailySchedule(date, teacherId?.toString()),
    
//     // Only run if we have a date. 
//     // Note: We don't require teacherId here so it works for Admin.
//     enabled: !!date, 
    
//     // Keep the dashboard live
//     refetchInterval: 1000 * 60 * 5, 
//   });
// }

export const useBulkImportStudents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rows: any[]) => studentApi.bulkImport(rows),

    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["students"],
      });

      if (res.failed && res.failed > 0) {
        toast.warning(
          `Imported ${res.inserted} students, ${res.failed} failed`
        );
      } else {
        toast.success(`Successfully imported ${res.inserted} students`);
      }
    },

    onError: (error: any) => {
      console.error("Student bulk import failed:", error);
      toast.error("Failed to import students");
    },
  });
};

// Bulk Sessions
export const useBulkImportSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rows: any[]) => sessionApi.bulkImport(rows),

    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["sessions"],
      });

      if (res.failed && res.failed > 0) {
        toast.warning(
          `Imported ${res.inserted} classes, ${res.failed} failed`
        );
      } else {
        toast.success(`Successfully imported ${res.inserted} classes`);
      }
    },

    onError: (error: any) => {
      console.error("Classes bulk import failed:", error);
      toast.error("Failed to import classes");
    },
  });
};

// Notifications
export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: notificationApi.getAll,
    // Refetch every 2 minutes to keep the admin updated on new alerts
    refetchInterval: 1000 * 60 * 2,
  });
}

/**
 * Marks a notification as read and removes it from the active list
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      // Invalidate the notifications list to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to dismiss notification",
        variant: "destructive",
      });
    },
  });
}