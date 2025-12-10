import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAdminSchema, 
  insertTeacherSchema, 
  insertStudentSchema, 
  insertSessionSchema,
  insertAttendanceSchema 
} from "@shared/schema";
import bcrypt from "bcryptjs";

declare module "express-session" {
  interface SessionData {
    userId: string;
    role: "admin" | "teacher";
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({ error: "Email, password, and role are required" });
      }

      let user;
      if (role === "admin") {
        user = await storage.getAdminByEmail(email);
      } else if (role === "teacher") {
        user = await storage.getTeacherByEmail(email);
      } else {
        return res.status(400).json({ error: "Invalid role" });
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.role = role;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        user: { 
          ...userWithoutPassword, 
          role 
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId || !req.session.role) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      let user;
      if (req.session.role === "admin") {
        user = await storage.getAdmin(req.session.userId);
      } else {
        user = await storage.getTeacher(req.session.userId);
      }

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        user: { 
          ...userWithoutPassword, 
          role: req.session.role 
        } 
      });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session.userId || req.session.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  };

  // Admin routes
  app.get("/api/admins", requireAdmin, async (req, res) => {
    try {
      const admins = await storage.getAllAdmins();
      const adminsWithoutPasswords = admins.map(({ password, ...admin }) => admin);
      res.json(adminsWithoutPasswords);
    } catch (error) {
      console.error("Get admins error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admins", requireAdmin, async (req, res) => {
    try {
      const data = insertAdminSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const admin = await storage.createAdmin({ ...data, password: hashedPassword });
      const { password: _, ...adminWithoutPassword } = admin;
      res.status(201).json(adminWithoutPassword);
    } catch (error) {
      console.error("Create admin error:", error);
      res.status(400).json({ error: "Invalid data" });
    }
  });

  app.delete("/api/admins/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteAdmin(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete admin error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Teacher routes
  app.get("/api/teachers", requireAuth, async (req, res) => {
    try {
      const teachers = await storage.getAllTeachers();
      const teachersWithoutPasswords = teachers.map(({ password, ...teacher }) => teacher);
      res.json(teachersWithoutPasswords);
    } catch (error) {
      console.error("Get teachers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/teachers/:id", requireAuth, async (req, res) => {
    try {
      const teacher = await storage.getTeacher(req.params.id);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      const { password: _, ...teacherWithoutPassword } = teacher;
      res.json(teacherWithoutPassword);
    } catch (error) {
      console.error("Get teacher error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/teachers", requireAdmin, async (req, res) => {
    try {
      const data = insertTeacherSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const teacher = await storage.createTeacher({ ...data, password: hashedPassword });
      const { password: _, ...teacherWithoutPassword } = teacher;
      res.status(201).json(teacherWithoutPassword);
    } catch (error) {
      console.error("Create teacher error:", error);
      res.status(400).json({ error: "Invalid data" });
    }
  });

  app.patch("/api/teachers/:id", requireAdmin, async (req, res) => {
    try {
      const data = req.body;
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }
      const teacher = await storage.updateTeacher(req.params.id, data);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      const { password: _, ...teacherWithoutPassword } = teacher;
      res.json(teacherWithoutPassword);
    } catch (error) {
      console.error("Update teacher error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/teachers/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteTeacher(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete teacher error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Student routes
  app.get("/api/students", requireAuth, async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      console.error("Get students error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/students", requireAdmin, async (req, res) => {
    try {
      const data = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(data);
      res.status(201).json(student);
    } catch (error) {
      console.error("Create student error:", error);
      res.status(400).json({ error: "Invalid data" });
    }
  });

  app.patch("/api/students/:id", requireAdmin, async (req, res) => {
    try {
      const student = await storage.updateStudent(req.params.id, req.body);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      console.error("Update student error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/students/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteStudent(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete student error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Session routes
  app.get("/api/sessions", requireAuth, async (req, res) => {
    try {
      let sessions;
      if (req.session.role === "teacher") {
        sessions = await storage.getSessionsByTeacher(req.session.userId);
      } else {
        sessions = await storage.getAllSessions();
      }
      res.json(sessions);
    } catch (error) {
      console.error("Get sessions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/sessions", requireAdmin, async (req, res) => {
    try {
      const data = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(data);
      res.status(201).json(session);
    } catch (error) {
      console.error("Create session error:", error);
      res.status(400).json({ error: "Invalid data" });
    }
  });

  app.patch("/api/sessions/:id", requireAdmin, async (req, res) => {
    try {
      const session = await storage.updateSession(req.params.id, req.body);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Update session error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/sessions/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteSession(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete session error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Attendance routes
  app.get("/api/attendance", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate, teacherId, sessionId, studentId } = req.query;
      
      const filters: any = {};
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;
      if (teacherId) filters.teacherId = teacherId as string;
      if (sessionId) filters.sessionId = sessionId as string;
      if (studentId) filters.studentId = studentId as string;

      const attendance = await storage.getAttendanceByFilters(filters);
      res.json(attendance);
    } catch (error) {
      console.error("Get attendance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/attendance", requireAuth, async (req, res) => {
    try {
      const data = insertAttendanceSchema.parse(req.body);
      
      // Check if attendance already exists for this date and session
      const existing = await storage.getAttendanceByDateAndSession(data.date, data.sessionId);
      if (existing) {
        return res.status(400).json({ error: "Attendance already marked for this session on this date" });
      }

      // Verify session exists and is active for this date
      const session = await storage.getSession(data.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (data.date < session.startDate || data.date > session.endDate) {
        return res.status(400).json({ error: "Cannot mark attendance outside session date range" });
      }

      const attendance = await storage.createAttendance(data);
      res.status(201).json(attendance);
    } catch (error) {
      console.error("Create attendance error:", error);
      res.status(400).json({ error: "Invalid data" });
    }
  });

  app.delete("/api/attendance/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteAttendance(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete attendance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Analytics/Reports routes
  app.get("/api/reports/teacher-work-hours", requireAuth, async (req, res) => {
    try {
      const { teacherId, startDate, endDate } = req.query;
      
      const filters: any = {};
      if (teacherId) filters.teacherId = teacherId as string;
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;

      const attendance = await storage.getAttendanceByFilters(filters);
      
      // Group by teacher and calculate total hours
      const teacherHours: { [key: string]: number } = {};
      attendance.forEach(record => {
        if (!teacherHours[record.teacherId]) {
          teacherHours[record.teacherId] = 0;
        }
        teacherHours[record.teacherId] += record.durationHours;
      });

      res.json(teacherHours);
    } catch (error) {
      console.error("Get teacher work hours error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/reports/student-attendance", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate, studentId } = req.query;
      
      const filters: any = {};
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;
      if (studentId) filters.studentId = studentId as string;

      const attendance = await storage.getAttendanceByFilters(filters);
      const students = await storage.getAllStudents();
      
      // Calculate attendance stats per student
      const studentStats: { [key: string]: { present: number; total: number; name: string } } = {};
      
      students.forEach(student => {
        studentStats[student.id] = { present: 0, total: 0, name: student.name };
      });

      attendance.forEach(record => {
        record.presentStudentIds.forEach(studentId => {
          if (studentStats[studentId]) {
            studentStats[studentId].present += 1;
          }
        });
        
        // Get all students from session to count total possible attendance
        // For now, we'll count based on present students
        // In a real implementation, you'd also track absent students
      });

      const result = Object.entries(studentStats).map(([id, stats]) => ({
        studentId: id,
        studentName: stats.name,
        present: stats.present,
        total: stats.present, // Simplified - in real app, track total sessions
      }));

      res.json(result);
    } catch (error) {
      console.error("Get student attendance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
