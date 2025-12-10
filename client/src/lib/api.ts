import type { 
  Admin, 
  Teacher, 
  Student, 
  Session, 
  AttendanceRecord,
  InsertAdmin,
  InsertTeacher,
  InsertStudent,
  InsertSession,
  InsertAttendance
} from "@shared/schema";

const API_BASE = "/api";

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

  return response.json();
}

// Auth API
export const authApi = {
  login: (email: string, password: string, role: "admin" | "teacher") =>
    fetchApi<{ user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
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
};

// Attendance API
export const attendanceApi = {
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
    return fetchApi<AttendanceRecord[]>(`/attendance${queryString ? `?${queryString}` : ""}`);
  },
  
  create: (data: InsertAttendance) =>
    fetchApi<AttendanceRecord>("/attendance", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/attendance/${id}`, { method: "DELETE" }),
};

// Reports API
export const reportsApi = {
  getTeacherWorkHours: (filters?: {
    teacherId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.teacherId) params.set("teacherId", filters.teacherId);
    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);
    
    const queryString = params.toString();
    return fetchApi<{ [teacherId: string]: number }>(`/reports/teacher-work-hours${queryString ? `?${queryString}` : ""}`);
  },
  
  getStudentAttendance: (filters?: {
    startDate?: string;
    endDate?: string;
    studentId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);
    if (filters?.studentId) params.set("studentId", filters.studentId);
    
    const queryString = params.toString();
    return fetchApi<Array<{ studentId: string; studentName: string; present: number; total: number }>>(`/reports/student-attendance${queryString ? `?${queryString}` : ""}`);
  },
};
