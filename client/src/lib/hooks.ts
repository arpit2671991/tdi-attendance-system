import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  adminApi, 
  teacherApi, 
  studentApi, 
  sessionApi, 
  attendanceApi, 
  reportsApi 
} from "./api";
import { useToast } from "@/hooks/use-toast";

// Query keys
export const queryKeys = {
  admins: ["admins"] as const,
  teachers: ["teachers"] as const,
  teacher: (id: string) => ["teacher", id] as const,
  students: ["students"] as const,
  sessions: ["sessions"] as const,
  attendance: (filters?: any) => ["attendance", filters] as const,
  teacherWorkHours: (filters?: any) => ["teacherWorkHours", filters] as const,
  studentAttendance: (filters?: any) => ["studentAttendance", filters] as const,
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

// Attendance hooks
export function useAttendance(filters?: any) {
  return useQuery({
    queryKey: queryKeys.attendance(filters),
    queryFn: () => attendanceApi.getAll(filters),
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: attendanceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.teacherWorkHours() });
      queryClient.invalidateQueries({ queryKey: queryKeys.studentAttendance() });
      toast({ title: "Attendance marked successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to mark attendance", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: attendanceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.teacherWorkHours() });
      queryClient.invalidateQueries({ queryKey: queryKeys.studentAttendance() });
      toast({ title: "Attendance deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete attendance", description: error.message, variant: "destructive" });
    },
  });
}

// Reports hooks
export function useTeacherWorkHours(filters?: any) {
  return useQuery({
    queryKey: queryKeys.teacherWorkHours(filters),
    queryFn: () => reportsApi.getTeacherWorkHours(filters),
  });
}

export function useStudentAttendanceReport(filters?: any) {
  return useQuery({
    queryKey: queryKeys.studentAttendance(filters),
    queryFn: () => reportsApi.getStudentAttendance(filters),
  });
}
