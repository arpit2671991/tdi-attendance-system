import { 
  type Admin, 
  type Teacher,
  type DepartmentLevel,
  type Department, 
  type Student, 
  type Session, 
  type SessionStudent,
  type Attendance,
  type TeacherAttendance,
  type InsertAdmin,
  type InsertTeacher,
  type InsertDepartment,
  type InsertStudent,
  type InsertSession,
  type InsertSessionStudent,
  type InsertAttendance,
  type InsertTeacherAttendance,
  type InsertDepartmentLevel,
  type DepartmentHour,
  type InsertDepartmentHour, 
  type StudentCourseHoursReport,
  type TeachersHoursData,
  InsertSessionException,
  SessionException

} from "@shared/schema";
import { boolean } from "drizzle-orm/mysql-core";





const API_BASE = import.meta.env.VITE_API_BASE;

// const API_BASE = process.env.NODE_ENV === "production" ? "api" : "http://localhost:5000/api";


async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  const contentType = response.headers.get("content-type");
  if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
    return { success: true } as unknown as T;
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (mobile: string, password: string, role: "admin" | "teacher" ) =>
    fetchApi<{ user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ mobile, password, role }),
    }),

  logout: () =>
    fetchApi<{ success: boolean }>("/auth/logout", { method: "POST" }),

  getMe: () =>
    fetchApi<{ user: any }>("/auth/me"),
};

// Admin API
export const adminApi = {
  getAll: () => fetchApi<Omit<Admin, "password">[]>("/admins"),
  create: (data: InsertAdmin) =>
    fetchApi<Omit<Admin, "password">>("/admins", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/admins/${id}`, { method: "DELETE" }),
};

// Teacher API
export const teacherApi = {
  getAll: () => fetchApi<Omit<Teacher, "password">[]>("/teachers"),
  getById: (id: string) => fetchApi<Omit<Teacher, "password">>(`/teachers/${id}`),
  create: (data: InsertTeacher) =>
    fetchApi<Omit<Teacher, "password">>("/teachers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<InsertTeacher>) =>
    fetchApi<Omit<Teacher, "password">>(`/teachers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/teachers/${id}`, { method: "DELETE" }),

  bulkImport: (teachers: InsertTeacher[]) =>
    fetchApi<{ success: boolean; requested: number; inserted: number }>(
      "/teachers/bulk",
      {
        method: "POST",
        body: JSON.stringify({ teachers }), // note: backend expects { teachers: [...] }
      }
    ),
};

// Department Level API
export const departmentLevelApi = {
  getAll: () => fetchApi<DepartmentLevel[]>("/departments_levels"),
  create: (data: InsertDepartmentLevel) =>
    fetchApi<DepartmentLevel>("/departments_levels", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<InsertDepartmentLevel>) =>
    fetchApi<DepartmentLevel>(`/departments_levels/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/departments_levels/${id}`, { method: "DELETE" }),
bulkImport: (levels: InsertDepartmentLevel[]) =>
    fetchApi<{
      success: boolean;
      requested: number;
      inserted: number;
    }>("/departments_levels/bulk", {
      method: "POST",
      body: JSON.stringify({ levels }), // ✅ WRAP DATA
    }),
};

//  Department Hour API

export const departmentHourApi = {
  getAll: () => fetchApi<DepartmentHour[]>("/departments_hours"),
  create: (data: InsertDepartmentHour) =>
    fetchApi<DepartmentHour>("/departments_hours", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<InsertDepartmentHour>) =>
      fetchApi<DepartmentHour>(`/departments_hours/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi<{success: boolean}>(`/departments_hours/${id}`, {method: "DELETE"}),

    bulkImport: (hours: InsertDepartmentHour[]) =>
  fetchApi<{
    success: boolean;
    requested: number;
    inserted: number;
  }>("/departments_hours/bulk", {
    method: "POST",
    body: JSON.stringify({ hours }), // ✅ wrap in { hours: [...] }
  }),

};

// Department API

export const departmentApi = {
  getAll: () => fetchApi<Department[]>("/departments"),
  create: (data: InsertDepartment) =>
    fetchApi<Department>("/departments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<InsertDepartment>) =>
    fetchApi<Department>(`/departments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/departments/${id}`, { method: "DELETE" }),

   bulkImport: (name: InsertDepartment[]) =>
  fetchApi<{
    success: boolean;
    requested: number;
    inserted: number;
  }>("/departments/bulk", {
    method: "POST",
    body: JSON.stringify({ name }), // ✅ wrap in { hours: [...] }
  }),
};

// Student API
export const studentApi = {
  getAll: () => fetchApi<Student[]>("/students"),
  create: (data: InsertStudent) =>
    fetchApi<Student>("/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<InsertStudent>) =>
    fetchApi<Student>(`/students/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/students/${id}`, { method: "DELETE" }),
  bulkImport: (rows: any[]) =>
    fetchApi<{
      success: boolean;
      inserted: number;
      failed: number;
      errors?: { row: number; reason: string }[];
    }>("/students/bulk", {
      method: "POST",
      body: JSON.stringify(rows),
    }),
};

// Session API
export const sessionApi = {
  getAll: () => fetchApi<Session[]>("/sessions"),
  create: (data: InsertSession) =>
    fetchApi<Session>("/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<InsertSession>) =>
    fetchApi<Session>(`/sessions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/sessions/${id}`, { method: "DELETE" }),
  // Create a new cancellation or postponement
 createException: async (sessionId: string, data: Omit<InsertSessionException, "sessionId">) => {
    return fetchApi<SessionException>(`/sessions/${sessionId}/exceptions`, {
      method: "POST",
      body: JSON.stringify(data), // This was missing!
    });
    
  },
getAllExceptions: (date: string) => {
    return fetchApi<SessionException[]>(`/exceptions?date=${date}`);
  },

  // FIX: Simplified to match your existing pattern
  getExceptions: async (sessionId: string) => {
    return fetchApi<SessionException[]>(`/sessions/${sessionId}/exceptions`);
  },

  deleteException: async (id: string) => {
    await fetchApi<{ success: boolean }>(`/exceptions/${id}`, { 
      method: "DELETE" 
    });
  },

  getDailySchedule: (date: string, teacherId?: string) => {
    const params = new URLSearchParams({ date });
    if (teacherId && teacherId !== "undefined") {
      params.append("teacherId", teacherId);
    }
    return fetchApi<any[]>(`/schedule/daily?${params.toString()}`);
  },
bulkImport: (rows: any[]) =>
    fetchApi<{
      success: boolean;
      inserted: number;
      failed: number;
      errors?: { row: number; reason: string }[];
    }>("/sessions/bulk", {
      method: "POST",
      body: JSON.stringify(rows),
    }),
  

// getDailySchedule: async (date: string) => {
//     return  fetchApi<any[]>(`/schedule/daily?date=${date}`)
//   },
//   // Add to sessionApi in api.ts
// getTeacherDailySchedule: (teacherId: string, date: string) => {
//   return fetchApi<any[]>(`/schedule/daily?date=${date}&teacherId=${teacherId}`);
// }
};

// Session Enrollment API
export const sessionEntrollmentApi = {
  getAll: (filters?: {
    sessionId?: string;
    studentId?: string;
    teacherId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.teacherId) params.set("teacherId", filters.teacherId);
    if (filters?.sessionId) params.set("sessionId", filters.sessionId);
    if (filters?.studentId) params.set("studentId", filters.studentId);
    
    const queryString = params.toString();
    return fetchApi<SessionStudent[]>(`/session-entrollment${queryString ? `?${queryString}` : ""}`);
  },
  create: (data: InsertSessionStudent) =>
    fetchApi<SessionStudent>("/session-entrollment", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<InsertSessionStudent>) =>
    fetchApi<SessionStudent>(`/session-entrollment/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/session-entrollment/${id}`, { method: "DELETE" }),
};

// Attendance API

// Student Attendance API
export const attendanceApi = {
  get: (filters: { sessionId?: string; studentId?: string; date?: string }) => {
    const params = new URLSearchParams();
    if (filters.sessionId) params.set("sessionId", filters.sessionId);
    if (filters.studentId) params.set("studentId", filters.studentId);
    if (filters.studentId) params.set("studentId", filters.studentId);
    if (filters.date) params.set("date", filters.date);
    
    return fetchApi<Attendance[]>(`/attendance?${params.toString()}`);
  },
  mark: (data: InsertAttendance) =>
    fetchApi<Attendance>("/attendance", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<InsertAttendance>) =>
    fetchApi<Attendance>(`/attendance/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete:(id: string) => fetchApi<{success: boolean}>(`/attendance/${id}`, {method: "DELETE"})
};

// Teacher Attendance API
export const teacherAttendanceApi = {
  get: (filters: { sessionId?: string; teacherId?: string; date?: string }) => {
    const params = new URLSearchParams();
    if (filters.sessionId) params.set("sessionId", filters.sessionId);
    if (filters.teacherId) params.set("teacherId", filters.teacherId);
    if (filters.date) params.set("date", filters.date);
    
    return fetchApi<TeacherAttendance[]>(`/teacher-attendance?${params.toString()}`);
  },
  mark: (data: InsertTeacherAttendance) =>
    fetchApi<TeacherAttendance>("/teacher-attendance", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    delete:(id: string) => fetchApi<{success: boolean}>(`/teacher-attendance/${id}`, {method: "DELETE"})
};

// Attendance API
export const reportsTeacherAttendanceApi = {
  getAll: (filters?: {
    startDate?: string;
    endDate?: string;
    teacherId?: string;
    sessionId?: string;
    studentId?: string;
    
  }) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);
    if (filters?.teacherId) params.set("teacherId", filters.teacherId);
    if (filters?.sessionId) params.set("sessionId", filters.sessionId);
    if (filters?.studentId) params.set("studentId", filters.studentId);
    
    const queryString = params.toString();
    return fetchApi<TeacherAttendance[]>(`/reports/teachers-attendance${queryString ? `?${queryString}` : ""}`);
  },
  
  
  //  update: (id: string, data: Partial<InsertSession>) =>
  //   fetchApi<Session>(`/attendance/${id}`, {
  //     method: "PATCH",
  //     body: JSON.stringify(data),
  //   }),
  // delete: (id: string) =>
  //   fetchApi<{ success: boolean }>(`/attendance/${id}`, { method: "DELETE" }),
};



export const reportsStudentsAttendanceApi = {
  getAll: (filters?: {
    startDate?: string;
    endDate?: string;
    teacherId?: string;
    sessionId?: string;
    studentId?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);
    if (filters?.teacherId) params.set("teacherId", filters.teacherId);
    if (filters?.sessionId) params.set("sessionId", filters.sessionId);
    if (filters?.studentId) params.set("studentId", filters.studentId);
    if (filters?.status) params.set("status", filters.status);
    
    const queryString = params.toString();
    return fetchApi<Attendance[]>(`/reports/students-attendance${queryString ? `?${queryString}` : ""}`);
    }}

    export const  payrollTeachers = {
  getTeacherWorkHours: (filters?: {
    teacherId?: string;
    month?: string;
   
  }) => {
    const params = new URLSearchParams();
    if (filters?.teacherId) params.set("teacherId", filters.teacherId);
    if (filters?.month) params.set("startDate", filters.month);
  
  
    
    const queryString = params.toString();
    return fetchApi<TeachersHoursData[]>(`/payroll/teacher-work-hours${queryString ? `?${queryString}` : ""}`);
  }}

 export const reportsStudentCourseHoursApi = {
  getAll: () =>
    fetchApi<StudentCourseHoursReport[]>(
      "/students/course-hours"
    ),
};

// Notification API
export const notificationApi = {
  /**
   * Fetches all unread notifications for the admin
   */
  getAll: () => 
    fetchApi<any[]>("/notifications"),

  /**
   * Marks a specific notification as read so it disappears from the active list
   */
  markAsRead: (id: string) =>
    fetchApi<{ success: boolean }>(`/notifications/${id}/read`, {
      method: "POST",
    }),
};