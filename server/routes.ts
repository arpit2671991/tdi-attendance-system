import { validate as isUuid } from "uuid";
import type { Express } from "express";
import { createServer, type Server } from "http";
import {   storage } from "./storage";
import { 
  insertAdminSchema, 
  insertTeacherSchema,
  insertDepartmentLevelSchema,
  insertDepartmentHourSchema, 
  insertDepartmentSchema,
  insertStudentSchema, 
  insertSessionSchema,
  insertAttendanceSchema,
  insertTeacherAttendanceSchema,
  sessionExceptions,
  insertExceptionSchema,
 
   
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { count, error } from "console";
import { z } from "zod";



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
      const { mobile, password, role } = req.body;

      if (!mobile || !password || !role) {
        return res.status(400).json({ error: "Mobile, password, and role are required" });
      }

      let user;
      if (role === "admin") {
        user = await storage.getAdminByMobile(mobile);
      } else if (role === "teacher") {
        user = await storage.getTeacherByMobile(mobile);
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


  
  app.get("/api/departments_levels",requireAdmin, async (req, res) => {
   try {
      const departmentLevels = await storage.getAllDepartmentLevels();
      res.json(departmentLevels);
    } catch (error) {
      console.error("Get department levels error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })

  app.post("/api/departments_levels",requireAdmin, async (req, res) => {
    try {
      const data = insertDepartmentLevelSchema.parse(req.body);
      const departmentLevel = await storage.createDepartmentLevel(data);
      res.status(201).json(departmentLevel);
    } catch (error) {
      console.error("Create department level error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
  app.patch("/api/departments_levels/:id",requireAdmin, async (req, res) => {
    try {
      const departmentLevel = await storage.updateDepartmentLevel(req.params.id, req.body);
      if (!departmentLevel) {
        return res.status(404).json({ error: "Department level not found" });
      }
      res.json(departmentLevel);
    } catch (error) {
      console.error("Update department level error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
  app.delete("/api/departments_levels/:id",requireAdmin, async (req, res) => {
    try {
      await storage.deleteDepartmentLevel(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete department level error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
 
  // Department Hours Routes
  app.get("/api/departments_hours", requireAdmin, async (req, res) => {
    try {
      const departmentHours = await storage.getAllDepartmentHours();
      res.json(departmentHours)
    } catch (error) {
      console.log("Get departments error:", error)
      res.status(500).json({error: "Inertnal server error"})
    }
  })

  app.post("/api/departments_hours", requireAdmin, async(req, res) => {
    try {
      const data = await insertDepartmentHourSchema.parse(req.body);
      const departmentHour = await storage.createDepartmentHour(data);
      res.status(201).json(departmentHour)
    } catch (error) {
      console.log("Create department hours error:", error)
      res.status(500).json({error: "Internal server error"})
    }
  })

  app.patch("/api/departments_hours/:id", requireAdmin, async(req, res) => {
    try {
     const departmentHour =    await storage.updateDepartmentHour(req.params.id, req.body)
     if(!departmentHour){
      return res.status(404).json({error: "Department hour not found!"})
     }
     res.json(departmentHour)
    } catch (error) {
      console.error("Update department hour error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })

  app.delete("/api/departments_hours/:id", requireAdmin, async(req, res) => {
    try {
    await storage.deleteDepartmentHour(req.params.id)
     res.json({success: true})
    } catch (error) {
      console.error("Delete department hour error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })


  // Department routes
  app.get("/api/departments", requireAuth, async(req, res) => {
    try { 
      const departments = await storage.getAllDepartments();
      res.json(departments)
    } catch (error) {
      console.log("Get departments:", error);
      res.status(500).json({error: "Internal server error"});
    }
  })

  app.post("/api/departments", requireAdmin, async(req, res) => {
    try {
      const data = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(data)
      res.status(201).json(department)
    } catch (error) {
      console.log("Create department error:", error)
      res.status(500).json({error: "Internal server error"});
    }
  })

   app.patch("/api/departments/:id", requireAdmin, async (req, res) => {
    try {
      const department = await storage.updateDepartment(req.params.id, req.body);
      if (!department) {
        return res.status(404).json({ error: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      console.error("Update department error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

   app.delete("/api/departments/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteDepartment(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete department error:", error);
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

  // Session Exceptions

  app.post("/api/sessions/:id/exceptions", async (req, res) => {
  try {
    const sessionId = req.params.id;
    console.log(sessionId)
    console.log(req.body)
    
    // Validate the incoming body against our Zod schema
    
    const validatedData = insertExceptionSchema.parse({
      ...req.body,
      sessionId,
    });

    // Check if an exception already exists for this date
    const existing = await storage.getExceptionByDate(
      sessionId, 
      validatedData.exceptionDate
    );

    if (existing) {
      return res.status(409).json({ 
        message: "An exception already exists for this date." 
      });
    }

    const exception = await storage.createException(validatedData);
    res.status(201).json(exception);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      res.status(500).json({error});
    }
  }
});

app.delete("/api/exceptions/:id", async (req, res) => {
  try {
    await storage.deleteException(req.params.id);
    res.status(200).json({success: true});
  } catch (error) {
    res.status(500).json({ message: "Failed to delete exception" });
  
  }
});


app.get("/api/schedule/daily", async (req, res) => {
  const { date, teacherId } = req.query;
  const schedule = await storage.getDailySchedule(
    date as string, 
    teacherId as string // If this is undefined, the filter is ignored
  );
  res.json(schedule);
});


// Add this to your routes file
app.get("/api/exceptions", async (req, res) => {
  const date = req.query.date as string;
  
  if (!date) {
    return res.status(400).json({ message: "Date parameter is required" });
  }

  // You will need to implement this method in your storage
  const exceptions = await storage.getAllExceptionsByDate(date);
  res.json(exceptions);
});

app.get("/api/sessions/:id/exceptions", async (req, res) => {
  const exceptions = await storage.getExceptionsBySession(req.params.id);
  res.json(exceptions);
});

  // Session Enrollment Routes

  app.get("/api/session-entrollment", requireAuth, async (req, res) => {
  try {
    const { sessionId, studentId } = req.query;

    const enrollments = await storage.getAllSessionEntrollments({
      sessionId: sessionId as string | undefined,
      studentId: studentId as string | undefined,
    });

    res.json(enrollments);
  } catch (error) {
    console.error("Get enrollments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

  app.post("/api/session-entrollment", requireAdmin, async (req, res) => {
     try {
    const { studentId, sessionId } = req.body;

    // Validate input
    if (!studentId || !sessionId) {
      return res.status(400).json({ error: "Missing studentId or sessionId" });
    }
  const existing = await storage.getAllSessionEntrollments({ sessionId, studentId });

if (existing.length > 0) {
  return res.status(400).json({ error: "Student already enrolled in this session" });
}

   
    // Create enrollment
    const enrollment = await storage.createSessionEntrollments({ sessionId, studentId });

    // Send success response
    return res.json({ success: true, enrollment });
  } catch (err: any) {
    // Send error response
    return res.status(500).json({ error: err.message });
  }
  })


   app.delete("/api/session-entrollment/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;

    if (!isUuid(id)) {
    return res.status(400).json({ error: "Invalid enrollment ID" });
  }
    try {
      await storage.deleteSessionEnrollment(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete session error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
 
  // Get student attendance with filters (sessionId, studentId, date)
  app.get("/api/attendance", requireAuth, async (req, res) => {
    try {
      const { sessionId, studentId, date } = req.query;
      const records = await storage.getAttendanceByFilters({
        sessionId: sessionId as string,
        studentId: studentId as string,
        date: date as string,
      });
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attendance" });
    }
  });


  // Mark student attendance
// app.post("/api/attendance", requireAuth, async (req, res) => {
//   try {
  
//     const data = insertAttendanceSchema.parse({
//       ...req.body,
//       markedBy: req.session.userId 
//     });

//     // 1. Check for existing record
//     const existing = await storage.getAttendanceByFilters({
//       sessionId: data.sessionId,
//       studentId: data.studentId,
//       date: data.date,
//     });

//     if (existing && existing.length > 0) {
//       // --- GOAL IMPLEMENTATION: ROLE CHECK ---
//       // Only allow the update if the user is an admin
//       if (req.session.role !== "admin") {
//         return res.status(403).json({ 
//           error: "Attendance already marked. Only admins can modify existing records." 
//         });
//       }

//       if(data.status === "absent"){
//         const history = await storage.getRecentAttendanceForStudent(data.studentId, data.sessionId, 3);
//         const consecutiveAbsences = history.filter(h => h.status === "absent").length;
//         if (consecutiveAbsences >= 3) {
//           await storage.createNotification({
//           type: "consecutive_absence",
//           studentId: data.studentId,
//           message: `Student has been absent for 3 consecutive sessions.`,
//           severity: "high",
//           read: false
//         });
//         console.log(`[ALERT] Admin Notification: Student ${data.studentId} absent for 3 days.`);
//         }
//       }
//       // 2. Update if found (Admins only)
//       const record = await storage.updateAttendance(existing[0].id, data);
//       return res.status(200).json(record);
//     } else {
//       // 3. Create if new (Both Teachers and Admins can create)
//       const record = await storage.createAttendance(data);
//       return res.status(201).json(record);
//     }
//   } catch (error: any) {
//     console.error("Attendance validation error:", error);
//     res.status(400).json({ error: error.message || "Invalid attendance data" });
//   }
// });

app.post("/api/attendance", requireAuth, async (req, res) => {
  try {
    const data = insertAttendanceSchema.parse({
      ...req.body,
      markedBy: String(req.session.userId) 
    });

    // 1. Check for existing record
    const existing = await storage.getAttendanceByFilters({
      sessionId: data.sessionId,
      studentId: data.studentId,
      date: data.date,
    });

    if (existing && existing.length > 0) {
      // Only allow the update if the user is an admin
      if (req.session.role !== "admin") {
        return res.status(403).json({ 
          error: "Attendance already marked. Only admins can modify existing records." 
        });
      }

      // 2. Update existing record (Admins only)
      // Note: We don't trigger the "consecutive absence" logic on updates 
      // to prevent accidental double-penalties if an admin is just fixing a typo.
      const record = await storage.updateAttendance(existing[0].id, data);
      return res.status(200).json(record);
    } else {
      // 3. Create new record
      // This call now handles the 3-day check and 3-hour penalty internally!
      const record = await storage.createAttendance(data);
      return res.status(201).json(record);
    }
  } catch (error: any) {
    console.error("Attendance process error:", error);
    res.status(400).json({ error: error.message || "Invalid attendance data" });
  }
});


app.delete("/api/attendance/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteStudentAttendance(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete student attendance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  // Teacher self-check-in or Admin marking teacher attendance
 app.post("/api/teacher-attendance", requireAuth, async (req, res) => {
  try {
    const data = insertTeacherAttendanceSchema.parse({
      ...req.body,
      // Record who performed the action
      markedBy: req.session.role === "admin" ? String(req.session.userId) : "self"
    });

    // 1. Check if a record already exists for this Teacher, Session, and Date
    const existing = await storage.getTeacherAttendanceByFilters({
      sessionId: data.sessionId,
      teacherId: data.teacherId,
      date: data.date,
    });

    if (existing && existing.length > 0) {
      // 2. GOAL: Only Admins can modify existing hours
      if (req.session.role !== "admin") {
        return res.status(403).json({ 
          error: "Attendance already logged. Only admins can modify records." 
        });
      }

      // 3. Update existing record if Admin
      const record = await storage.updateTeacherAttendance(existing[0].id, data);
      return res.status(200).json(record);
    }

    // 4. Create new if no record found
    const record = await storage.createTeacherAttendance(data);
    res.status(201).json(record);

  } catch (error: any) {
    console.error("Teacher attendance error:", error);
    res.status(400).json({ error: "Failed to process teacher attendance" });
  }
});

  app.get("/api/teacher-attendance", requireAuth, async (req, res) => {
    const { sessionId, teacherId, date } = req.query;
    const records = await storage.getTeacherAttendanceByFilters({
      sessionId: sessionId as string,
      teacherId: teacherId as string,
      date: date as string
    });
    res.json(records);
  });

  app.delete("/api/teacher-attendance/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteTeacherAttendance(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete teacher attendance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


app.get("/api/notifications", requireAuth, async (req, res) => {
  if (req.session.role !== "admin") return res.sendStatus(403);
  const data = await storage.getNotifications();
  res.json(data);
});

app.post("/api/notifications/:id/read", requireAuth, async (req, res) => {
  await storage.markNotificationRead(req.params.id);
  res.sendStatus(200);
});

app.get("/api/reports/teachers-attendance", requireAdmin, async (req, res) => {
    try {
     
      const { startDate, endDate, teacherId, sessionId, studentId } = req.query;
      
      const filters: any = {};
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;
      if (teacherId) filters.teacherId = teacherId as string;
      if (sessionId) filters.sessionId = sessionId as string;
      if (studentId) filters.studentId = studentId as string;

      const teachersAttendance = await storage.getTeacherAttendanceByFilters(filters);
      console.log(teachersAttendance)
      res.json(teachersAttendance);
    } catch (error) {
      console.error("Get attendance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

app.get("/api/reports/students-attendance", requireAdmin, async (req, res) => {
    try {
     
      const { startDate, endDate, teacherId, sessionId, studentId, status, page ="1", pageSize="10" } = req.query;
      
       const limit = Number(pageSize);
       const offset = (Number(page) - 1) * limit;

       const whereConditions = [];

      const filters: any = {};
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;
      if (teacherId) filters.teacherId = teacherId as string;
      if (sessionId) filters.sessionId = sessionId as string;
      if (studentId) filters.studentId = studentId as string;
      if (status) filters.status = status as string;

      const studentsAttendance = await storage.getStudentAttendanceByFilters(filters);
      console.log(studentsAttendance)
      res.json(studentsAttendance);
    } catch (error) {
      console.error("Get attendance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
});
app.get("/api/payroll/teacher-work-hours", requireAuth, async (req, res) => {
    try {
      // const { teacherId, startDate, endDate } = req.query;
      
      // const filters: any = {};
      // if (teacherId) filters.teacherId = teacherId as string;
      // if (startDate) filters.startDate = startDate as string;
      // if (endDate) filters.endDate = endDate as string;

      // const teacherAttendance = await storage.getTeacherAttendanceByFilters(filters);
      
      // // Group by teacher and calculate total hours
      // const teacherHours: { [key: string]: number } = {};
      // teacherAttendance.forEach(record => {
      //   if (!teacherHours[record.teacherId]) {
      //     teacherHours[record.teacherId] = 0;
      //   }
      //   teacherHours[record.teacherId] += record.durationHours;
      // });

      // res.json(teacherHours);
       const data = await storage.getTeacherMonthlyHours();
        res.json(data);
    } catch (error) {
      console.error("Get teacher work hours error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
// app.get("/api/students-course-hours", requireAuth, async (req, res) => {
//     try {
//       const { studentId } = req.query;
      
//       const filters: any = {};
//       if (studentId) filters.studentId = studentId as string;
    

//       const studentAttendance = await storage.getAttendanceByFilters(filters);
//       const studentCourseHours = await storage.getDepartmentHour(filters)
      
//       // Group by teacher and calculate total hours
//       const courseHours: { [key: string]: number } = {};
//       studentAttendance.forEach(record => {
//         if (!courseHours[record.studentId]) {
//           courseHours[record.studentId] = 0;
//         }
//         courseHours[record.studentId] = record.durationHours;
//       });

//       res.json(courseHours);
//     } catch (error) {
//       console.error("Get teacher work hours error:", error);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   });
app.get("/api/students/course-hours", async (_req, res) => {
  try {
    const data = await storage.getStudentsCourseHours();
    console.log(data)
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load course hours" });
  }
});





// BULK IMPORTS ROUTES
// COURSE HOURS
app.post("/api/departments_hours/bulk", requireAdmin, async (req, res) => {
  try {
    const { hours } = req.body as { hours: { hours: number }[] };

    // 1️⃣ Validate request
    if (!Array.isArray(hours) || hours.length === 0) {
      return res.status(400).json({ message: "Invalid CSV data" });
    }

    // 2️⃣ Normalize and filter invalid numbers
    const sanitized = hours
      .map(h => ({ hours: Number(h.hours) }))
      .filter(h => !isNaN(h.hours) && h.hours > 0);

    if (!sanitized.length) {
      return res.status(400).json({ message: "No valid department hours found" });
    }

    // 3️⃣ Bulk insert
    const result = await storage.bulkInsertCourseHours(sanitized);

    // 4️⃣ Return response with actual inserted count
    res.status(201).json({
      success: true,
      requested: hours.length,
      inserted: result.insertedCount,
    });

  } catch (error) {
    console.error("Create department hours error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Bulk Course Levels Import 
app.post("/api/departments_levels/bulk", requireAdmin, async (req, res) => {
    try {
      
      const { levels } = req.body as {
        levels: { name: string }[];
      };
       console.log("BODY:", req.body);
      if (!Array.isArray(levels) || levels.length === 0) {
        return res.status(400).json({
          message: "Invalid CSV data",
        });
      }
     


      const sanitized = levels
        .map((l) => ({
          name: l.name?.trim(),
        }))
        .filter((l) => l.name);

      if (sanitized.length === 0) {
        return res.status(400).json({
          message: "No valid course levels found",
        });
      }

      const result = await storage.bulkInsertCourseLevels(sanitized);

      res.status(201).json({
        success: true,
        requested: levels.length,
        inserted: result.insertedCount,
      });
    } catch (error) {
      console.error("Bulk insert failed:", error);
      res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }
);
// Bulk import courses
app.post("/api/departments/bulk", requireAdmin, async (req, res) => {
    try {
      
      const { name } = req.body as {
        name: { name: string }[];
      };
       console.log("BODY:", req.body);
      if (!Array.isArray(name) || name.length === 0) {
        return res.status(400).json({
          message: "Invalid CSV data",
        });
      }
     


      const sanitized = name
        .map((l) => ({
          name: l.name?.trim(),
        }))
        .filter((l) => l.name);

      if (sanitized.length === 0) {
        return res.status(400).json({
          message: "No valid course courses found",
        });
      }

      const result = await storage.bulkInsertCourses(sanitized);

      res.status(201).json({
        success: true,
        requested: name.length,
        inserted: result.insertedCount,
      });
    } catch (error) {
      console.error("Bulk insert failed:", error);
      res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }
);
// Bulk import teachers
app.post("/api/teachers/bulk", requireAdmin, async(req, res) => {
  try {
    const rows = req.body.teachers as {
      name: string;
      email: string;
      mobile: string;
      password: string;
    }[];

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: "Invalid CSV data" });
    }

    // sanitize and filter invalid rows
    const sanitized = rows
      .map(r => ({
        name: r.name?.trim() || "",
        email: r.email?.trim() || "",
        mobile: r.mobile?.trim() || "",
        password: r.password?.trim() || "",
      }))
      .filter(r => r.name && r.email && r.mobile && r.password);

      // hash passwords
    const hashed = await Promise.all(
      sanitized.map(async r => ({
        ...r,
        password: await bcrypt.hash(r.password, 10),
      }))
    );

      const result = await storage.bulkInsertTeachers(hashed);

       res.status(201).json({
      success: true,
      requested: sanitized.length,
      inserted: result.insertedCount,
    });
  } catch (error) {
     console.error("Bulk import teachers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

// Bulk import students
app.post("/api/students/bulk", requireAdmin, async (req, res) => {
  try {
    const rows = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: "Invalid CSV data" });
    }

    const result = await storage.bulkInsertStudentsFromCsv(rows);

    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/sessions/bulk", requireAdmin, async(req, res) => {
  try {
     const rows = req.body;
     if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: "Invalid CSV data" });
    }
      const result = await storage.bulkInsertClassesFromCsv(rows);
      res.status(201).json({
       success: true,
      ...result,
      })


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
})


}