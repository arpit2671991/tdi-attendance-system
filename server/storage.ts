import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "@shared/schema";
import { eq, and, gte, lte, like, or, sql, sum, desc, asc } from "drizzle-orm";
import {
  Admin,
  Teacher,
  DepartmentLevel,
  DepartmentHour,
  Department,
  Student,
  Session,
  SessionStudent,
  Attendance,
  DbNotification,
  TeacherAttendance,
  SessionException,

  // AttendanceRecord,

  InsertAdmin,
  InsertTeacher,
  InsertDepartmentLevel,
  InsertDepartmentHour,
  InsertDepartment,
  InsertStudent,
  InsertSession,
  InsertSessionStudent,
  InsertAttendance,
  InsertTeacherAttendance,
  InsertSessionException

  
} from "@shared/schema";

import dotenv from "dotenv";
dotenv.config();

console.log("database url", process.env.Database_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

import {
  getTeacherIdByName,
  getCourseIdByName,
  getLevelIdByName,
  getHoursIdByValue,
} from "./lookups";



export const db = drizzle(pool, { schema });

export interface IStorage {

  

  // Admin CRUD
  getAdmin(id: string): Promise<Admin | undefined>;
  getAdminByMobile(mobile: string): Promise<Admin | undefined>;
  getAllAdmins(): Promise<Admin[]>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  deleteAdmin(id: string): Promise<void>;

  // Teacher CRUD
  getTeacher(id: string): Promise<Teacher | undefined>;
  getTeacherByMobile(mobile: string): Promise<Teacher | undefined>;
  getAllTeachers(): Promise<Teacher[]>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher | undefined>;
  deleteTeacher(id: string): Promise<void>;

  // Department Level CRUD
  getDepartmentLevel(id: string): Promise<DepartmentLevel | undefined>;
  getAllDepartmentLevels(): Promise<DepartmentLevel[]>;
  createDepartmentLevel(departmentLevel: InsertDepartmentLevel): Promise<DepartmentLevel>;
  deleteDepartmentLevel(id: string): Promise<void>;
  updateDepartmentLevel(id: string, departmentLevel: Partial<InsertDepartmentLevel>): Promise<DepartmentLevel | undefined>;

  // Department hours CRUD
  getDepartmentHour(id: string): Promise<DepartmentHour | undefined>;
  getAllDepartmentHours(): Promise<DepartmentHour[]>;
  createDepartmentHour(departmentHour: InsertDepartmentHour): Promise<DepartmentHour>;
  deleteDepartmentHour(id: string): Promise<void>;
  updateDepartmentHour(id: string, departmentHour: Partial<InsertDepartmentHour>): Promise<DepartmentHour | undefined>;
 
  // Department CRUD
  getDepartment(id: string): Promise<Department | undefined>;
  getAllDepartments(): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: string, department: Partial<InsertDepartment>): Promise<Department | undefined>;
  deleteDepartment(id: string): Promise<void>;

  
  // Student CRUD
  getStudent(id: string): Promise<Student | undefined>;
  getAllStudents(): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: string): Promise<void>;
  

  // Session CRUD
  getSession(id: string): Promise<Session | undefined>;
  getAllSessions(): Promise<Session[]>;
  getSessionsByTeacher(teacherId: string): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: string, session: Partial<InsertSession>): Promise<Session | undefined>;
  deleteSession(id: string): Promise<void>;

  // Exception Methods
  createException(exception: InsertSessionException): Promise<SessionException>;
  getExceptionsBySession(sessionId: string): Promise<SessionException[]>;
  getExceptionByDate(sessionId: string, date: string): Promise<SessionException | undefined>;
  deleteException(id: string): Promise<void>;

  // Session Entrollment CRUD
  // getSessionEntollment(id: string): Promise<SessionStudent | undefined>;
  getAllSessionEntrollments(filters?: {
  sessionId?: string;
  studentId?: string;
}): Promise<SessionStudent[]>;
  createSessionEntrollments(sessionEntrollment: InsertSessionStudent): Promise<SessionStudent>;
  deleteSessionEnrollment(id: string): Promise<void>;
  
 // Attendance CRUD
  getAttendance(id: string): Promise<Attendance | undefined>;
  getAttendanceByFilters(filters: { sessionId?: string; studentId?: string; date?: string }): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, attendance: Partial<InsertAttendance>): Promise<Attendance | undefined>;

//  Students Attendance Get
  getStudentAttendanceByFilters(filters: { sessionId?: string; studentId?: string; date?: string }): Promise<Attendance[]>;


  // Teacher Attendance CRUD
  getTeacherAttendanceByFilters(filters: { sessionId?: string; teacherId?: string; date?: string }): Promise<TeacherAttendance[]>;
  createTeacherAttendance(attendance: InsertTeacherAttendance): Promise<TeacherAttendance>;
  deleteTeacherAttendance(id: string): Promise<void>;

}

export class DatabaseStorage implements IStorage {
  // Admin methods
  async getAdmin(id: string): Promise<Admin | undefined> {
    const result = await db.select().from(schema.admins).where(eq(schema.admins.id, id));
    return result[0];
  }

  async getAdminByMobile(mobile: string): Promise<Admin | undefined> {
    const result = await db.select().from(schema.admins).where(eq(schema.admins.mobile, mobile));
    return result[0];
  }

  async getAllAdmins(): Promise<Admin[]> {
    return await db.select().from(schema.admins);
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const result = await db.insert(schema.admins).values(admin).returning();
    return result[0];
  }

  async deleteAdmin(id: string): Promise<void> {
    await db.delete(schema.admins).where(eq(schema.admins.id, id));
  }

  // Teacher methods
  async getTeacher(id: string): Promise<Teacher | undefined> {
    const result = await db.select().from(schema.teachers).where(eq(schema.teachers.id, id));
    return result[0];
  }

  async getTeacherByMobile(mobile: string): Promise<Teacher | undefined> {
    const result = await db.select().from(schema.teachers).where(eq(schema.teachers.mobile, mobile));
    return result[0];
  }

  async getAllTeachers(): Promise<Teacher[]> {
    return await db.select().from(schema.teachers).orderBy(asc(schema.teachers.name));;
  }

  async createTeacher(teacher: InsertTeacher): Promise<Teacher> {
    const result = await db.insert(schema.teachers).values(teacher).returning();
    return result[0];
  }

  async updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher | undefined> {
    const result = await db.update(schema.teachers).set(teacher).where(eq(schema.teachers.id, id)).returning();
    return result[0];
  }

  async deleteTeacher(id: string): Promise<void> {
    await db.delete(schema.teachers).where(eq(schema.teachers.id, id));
  }


  // Department Level methods
  async getDepartmentLevel(id: string): Promise<DepartmentLevel | undefined> {
    const result = await db.select().from(schema.department_levels).where(eq(schema.department_levels.id, id));
    return result[0];
  }

    async getAllDepartmentLevels(): Promise<DepartmentLevel[]> {
    return await db.select().from(schema.department_levels).orderBy(asc(schema.department_levels.name));
  }

    async createDepartmentLevel(department: InsertDepartmentLevel): Promise<DepartmentLevel> {
    const result = await db.insert(schema.department_levels).values(department).returning();
    return result[0];
  }


   async updateDepartmentLevel(id: string, departmentLevel: Partial<InsertDepartmentLevel>): Promise<DepartmentLevel | undefined> {
    const result = await db.update(schema.department_levels).set(departmentLevel).where(eq(schema.department_levels.id, id)).returning();
    return result[0];
  }

    async deleteDepartmentLevel(id: string): Promise<void> {
    await db.delete(schema.department_levels).where(eq(schema.department_levels.id, id));
  }


  // Department Hours Methods
    async getDepartmentHour(id: string): Promise<DepartmentHour | undefined> {
      const result = await db.select().from(schema.department_hours).where(eq(schema.department_hours.id, id));
      return result[0];
    }

    async getAllDepartmentHours(): Promise<DepartmentHour[]>{
      return await db.select().from(schema.department_hours).orderBy(asc(schema.department_hours.hours));
    }

    async createDepartmentHour(departmentHour: InsertDepartmentHour): Promise<DepartmentHour> {
      const result = await db.insert(schema.department_hours).values(departmentHour).returning();
      return result[0];
    }

    async updateDepartmentHour(id: string, departmentHour: Partial<InsertDepartmentHour>): Promise<DepartmentHour | undefined> {
      const result = await db.update(schema.department_hours).set(departmentHour).where(eq(schema.department_hours.id, id)).returning();
      return result[0]
    }

    async deleteDepartmentHour(id: string): Promise<void> {
      await db.delete(schema.department_hours).where(eq(schema.department_hours.id, id));
    }

  // Department methods
  async getDepartment(id: string): Promise<Department | undefined> {
    const result = await db.select().from(schema.departments).where(eq(schema.departments.id, id));
    return result[0];
  }

  async getAllDepartments(): Promise<Department[]> {
    return await db.select().from(schema.departments).orderBy(asc(schema.departments.name));
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const result = await db.insert(schema.departments).values(department).returning();
    return result[0];
  }

  async updateDepartment(id: string, department: Partial<InsertDepartment>): Promise<Department | undefined> {
    const result = await db.update(schema.departments).set(department).where(eq(schema.departments.id, id)).returning();
    return result[0];
  }

  async deleteDepartment(id: string): Promise<void> {
    await db.delete(schema.departments).where(eq(schema.departments.id, id));
  }


  // Student methods
  async getStudent(id: string): Promise<Student | undefined> {
    const result = await db.select().from(schema.students).where(eq(schema.students.id, id));
    return result[0];
  }

  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(schema.students).orderBy(asc(schema.students.name));
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const result = await db.insert(schema.students).values(student).returning();
    return result[0];
  }

  async updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined> {
    const result = await db.update(schema.students).set(student).where(eq(schema.students.id, id)).returning();
    return result[0];
  }

  async deleteStudent(id: string): Promise<void> {
    await db.delete(schema.students).where(eq(schema.students.id, id));
  }

  // Session methods
  async getSession(id: string): Promise<Session | undefined> {
    const result = await db.select().from(schema.sessions).where(eq(schema.sessions.id, id));
    return result[0];
  }

  async getAllSessions(): Promise<Session[]> {
    return await db.select().from(schema.sessions).orderBy(asc(schema.sessions.name));
  }

  async getSessionsByTeacher(teacherId: string): Promise<Session[]> {
    return await db.select().from(schema.sessions).where(eq(schema.sessions.teacherId, teacherId));
  }

  async getSessionsByDepartment(departmentId: string): Promise<Session[]> {
    return await db.select().from(schema.sessions).where(eq(schema.sessions.departmentId, departmentId));
  }
  async createSession(session: InsertSession): Promise<Session> {
    const result = await db.insert(schema.sessions).values(session).returning();
    return result[0];
  }

  async updateSession(id: string, session: Partial<InsertSession>): Promise<Session | undefined> {
    const result = await db.update(schema.sessions).set(session).where(eq(schema.sessions.id, id)).returning();
    return result[0];
  }

  async deleteSession(id: string): Promise<void> {
    await db.delete(schema.sessions).where(eq(schema.sessions.id, id));
  }

  // Implementation of Exception Methods
  async createException(insertException: InsertSessionException): Promise<SessionException> {
    const [exception] = await db
      .insert(schema.sessionExceptions)
      .values(insertException)
      .returning();
    return exception;
  }

  async getExceptionsBySession(sessionId: string): Promise<SessionException[]> {
    return await db
      .select()
      .from(schema.sessionExceptions)
      .where(eq(schema.sessionExceptions.sessionId, sessionId));
  }

  async getExceptionByDate(sessionId: string, date: string): Promise<SessionException | undefined> {
    const [exception] = await db
      .select()
      .from(schema.sessionExceptions)
      .where(
        and(
          eq(schema.sessionExceptions.sessionId, sessionId),
          eq(schema.sessionExceptions.exceptionDate, date)
        )
      );
    return exception;
  }

  async getAllExceptionsByDate(date: string): Promise<SessionException[]> {
  return await db
    .select()
    .from(schema.sessionExceptions)
    .where(eq(schema.sessionExceptions.exceptionDate, date));
}

  async deleteException(id: string): Promise<void> {
    await db.delete(schema.sessionExceptions).where(eq(schema.sessionExceptions.id, id));
  }

async getDailySchedule(targetDate: string, teacherId?: string) {
  // 1. Build the base conditions for date range
  const conditions = [
    lte(schema.sessions.startDate, targetDate),
    gte(schema.sessions.endDate, targetDate)
  ];

  // 2. Add teacher filter as a RAW STRING (since it's varchar)
  // We check for "undefined" as a string because some frontend clients 
  // might literally send the string "undefined" in the URL.
  if (teacherId && teacherId !== "undefined" && teacherId !== "") {
    // REMOVED: parseInt()
    conditions.push(eq(schema.sessions.teacherId, teacherId));
  }

  const results = await db
    .select({
      session: schema.sessions,
      exception: schema.sessionExceptions,
    })
    .from(schema.sessions)
    .leftJoin(
      schema.sessionExceptions,
      and(
        eq(schema.sessionExceptions.sessionId, schema.sessions.id),
        eq(schema.sessionExceptions.exceptionDate, targetDate)
      )
    )
    .where(and(...conditions))
    .orderBy(asc(schema.sessions.name));

  return results.map(({ session, exception }) => {
    if (exception) {
      return {
        ...session,
        status: exception.status,
        startTime: exception.overrideStartTime || session.startTime,
        endTime: exception.overrideEndTime || session.endTime,
        isException: true,
        reason: exception.reason,
      };
    }

    return {
      ...session,
      status: "scheduled" as const,
      isException: false,
      reason: null,
    };
  });
}

  // Session Entrollment Methods
  async getAllSessionEntrollments(filters?: {
  sessionId?: string;
  studentId?: string;
}) {
  const where: any[] = [];

  if (filters?.sessionId) {
    where.push(eq(schema.sessionStudents.sessionId, filters.sessionId));
  }

  if (filters?.studentId) {
    where.push(eq(schema.sessionStudents.studentId, filters.studentId));
  }

  return await db
    .select()
    .from(schema.sessionStudents)
    .where(where.length ? and(...where) : undefined);
}

  async createSessionEntrollments(sessionEntrollment: InsertSessionStudent): Promise<SessionStudent>{
    const result = await db.insert(schema.sessionStudents).values(sessionEntrollment).returning();
    return result[0]
  }


  async deleteSessionEnrollment(id: string): Promise<void> {
    await db.delete(schema.sessionStudents).where(eq(schema.sessionStudents.id, id));
  }

 

// Attendance Methods
  async getAttendance(id: string): Promise<Attendance | undefined> {
    const [record] = await db.select().from(schema.attendance).where(eq(schema.attendance.id, id));
    return record;
  }

  async getAttendanceByFilters(filters: { sessionId?: string; studentId?: string; date?: string }): Promise<Attendance[]> {
    const conditions = [];
    if (filters.sessionId) conditions.push(eq(schema.attendance.sessionId, filters.sessionId));
    if (filters.studentId) conditions.push(eq(schema.attendance.studentId, filters.studentId));
    if (filters.date) conditions.push(eq(schema.attendance.date, filters.date));

    return await db
      .select()
      .from(schema.attendance)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(schema.attendance.date));
  }

  // async createAttendance(attendance: InsertAttendance): Promise<Attendance> {
  //   const [result] = await db.insert(schema.attendance).values(attendance).returning();
  //   return result;
  // }
  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    return await db.transaction(async (tx) => {
      // 1. Insert the current attendance record
      const [result] = await tx
        .insert(schema.attendance)
        .values(attendanceData)
        .returning();

      // 2. Fetch the last 3 records for this student in this session 
      // to check for consecutive absences
      const history = await tx
        .select()
        .from(schema.attendance)
        .where(
          and(
            eq(schema.attendance.studentId, attendanceData.studentId),
            eq(schema.attendance.sessionId, attendanceData.sessionId)
          )
        )
        .orderBy(desc(schema.attendance.date))
        .limit(3);

      // 3. Check if we have exactly 3 records and all are marked 'absent'
      const isConsecutiveAbsent = 
        history.length === 3 && 
        history.every((rec) => rec.status === "absent");

      if (isConsecutiveAbsent) {
        // A. Increase student's consumedHours by 3
        await tx
          .update(schema.students)
          .set({
            consumedHours: sql`${schema.students.consumedHours} + 3`,
          })
          .where(eq(schema.students.id, attendanceData.studentId));

        // B. Create Admin Notification
        await tx.insert(schema.DbNotification).values({
          type: "consecutive_absence",
          studentId: attendanceData.studentId,
          severity: "high",
          message: `Attendance Alert: Student was absent for 3 consecutive sessions.`,
        });
      }

      return result;
    });
  }

async updateAttendance(id: string, data: Partial<InsertAttendance>): Promise<Attendance> {
  const [updated] = await db
    .update(schema.attendance)
    .set({
      ...data,
      // If you want to track when it was modified:
      // updatedAt: new Date() 
    })
    .where(eq(schema.attendance.id, id))
    .returning();

  if (!updated) {
    throw new Error("Attendance record not found");
  }

  return updated;
}

async updateTeacherAttendance(id: string, data: Partial<InsertTeacherAttendance>): Promise<TeacherAttendance> {
  const [updated] = await db
    .update(schema.teacherAttendance)
    .set(data)
    .where(eq(schema.teacherAttendance.id, id))
    .returning();

  if (!updated) {
    throw new Error("Teacher attendance record not found");
  }

  return updated;
}

async deleteStudentAttendance(id: string): Promise<void> {
    await db.delete(schema.attendance).where(eq(schema.attendance.id, id));
  }
  // Teacher Attendance Methods
  async getTeacherAttendanceByFilters(filters: { sessionId?: string; teacherId?: string; date?: string }): Promise<TeacherAttendance[]> {
    const conditions = [];
    if (filters.sessionId) conditions.push(eq(schema.teacherAttendance.sessionId, filters.sessionId));
    if (filters.teacherId) conditions.push(eq(schema.teacherAttendance.teacherId, filters.teacherId));
    if (filters.date) conditions.push(eq(schema.teacherAttendance.date, filters.date));

    return await db
      .select()
      .from(schema.teacherAttendance)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(schema.teacherAttendance.date));
  }

  async createTeacherAttendance(attendance: InsertTeacherAttendance): Promise<TeacherAttendance> {
    const [result] = await db.insert(schema.teacherAttendance).values(attendance).returning();
    return result;
  }

async getRecentAttendanceForStudent(studentId: string, sessionId: string, limit: number) {
  return await db
    .select()
    .from(schema.attendance)
    .where(
      and(
        eq(schema.attendance.studentId, studentId),
        eq(schema.attendance.sessionId, sessionId)
      )
    )
    .orderBy(desc(schema.attendance.date)) // Get the most recent dates first
    .limit(limit);
}


async deleteTeacherAttendance(id: string): Promise<void> {
    await db.delete(schema.teacherAttendance).where(eq(schema.teacherAttendance.id, id));
  }


// Ensure these are present in your class as well
async createNotification(data: schema.InsertDbNotification) {
  // We ensure the return type is captured for immediate UI updates
  const [result] = await db
    .insert(schema.DbNotification)
    .values(data)
    .returning();
  return result;
}

async getNotifications(studentId?: string): Promise<DbNotification[]> {
  const conditions = [eq(schema.DbNotification.isRead, false)];

  // If a studentId is provided, filter for that specific student's alerts
  if (studentId) {
    conditions.push(eq(schema.DbNotification.studentId, studentId));
  }

  return await db
    .select()
    .from(schema.DbNotification)
    .where(and(...conditions))
    .orderBy(desc(schema.DbNotification.createdAt));
}

async markNotificationRead(id: string): Promise<void> {
  // Convert id to number if your schema uses serial/integer IDs
  await db
    .update(schema.DbNotification)
    .set({ isRead: true })
    .where(eq(schema.DbNotification.id, id));
}








  //STUDENTS ATTENDANCE REPORTS ROUTES 

async getStudentAttendanceByFilters(filters: { sessionId?: string; studentId?: string; date?: string; status?:string; }): Promise<Attendance[]> {
    const conditions = [];
    if (filters.sessionId) conditions.push(eq(schema.attendance.sessionId, filters.sessionId));
    if (filters.studentId) conditions.push(eq(schema.attendance.studentId, filters.studentId));
    if (filters.date) conditions.push(eq(schema.attendance.date, filters.date));
    if (filters.status) conditions.push(eq(schema.attendance.status, filters.status));

    return await db
      .select()
      .from(schema.attendance)
      .where(conditions.length ? and(...conditions) : undefined);
  }


async getStudentsCourseHours(): Promise<any[]> {
  return await db
  .select({
      studentId: schema.students.id,
      studentName: schema.students.name,
      studentMobile: schema.students.mobile,
      courseName: schema.departments.name,
      courseHours: schema.department_hours.hours,
      consumedHours: sql<number>`
        COALESCE(SUM(${schema.attendance.durationHours}), 0)
      `,
      remainingHours: sql<number>`
        ${schema.department_hours.hours}
        - COALESCE(SUM(${schema.attendance.durationHours}), 0)
      `,
  })
  .from(schema.students)
    .innerJoin(
      schema.departments,
      eq(schema.students.courseId, schema.departments.id)
    )
    .innerJoin(
      schema.department_hours,
      eq(schema.students.courseHoursId, schema.department_hours.id)
    )
    .leftJoin(
      schema.attendance,
      eq(schema.attendance.studentId, schema.students.id)
    )
    .groupBy(
      schema.students.id,
      schema.departments.name,
      schema.department_hours.hours
    )
    .orderBy(asc(schema.students.name))

}





async getTeacherMonthlyHours (): Promise<any[]> {
  return db
    .select({
      teacherId: schema.teacherAttendance.teacherId,
      teacherName: schema.teachers.name,
      month: sql<string>`DATE_TRUNC('month', ${schema.teacherAttendance.date}::date)`,
      totalHours: sql<number>`SUM(${schema.teacherAttendance.durationHours})`,
    })
    .from(schema.teacherAttendance)
    .innerJoin(schema.teachers, sql`${schema.teachers.id} = ${schema.teacherAttendance.teacherId}`)
    .groupBy(
      schema.teacherAttendance.teacherId,
      schema.teachers.name,
      sql`DATE_TRUNC('month', ${schema.teacherAttendance.date}::date)`
    )
    .orderBy(
      sql`DATE_TRUNC('month', ${schema.teacherAttendance.date}::date) DESC`
    );
};



// BULK IMPORTS
// COURSE HOURS
async bulkInsertCourseHours(data: { hours: number }[]) {
  if (!data.length) {
    return { insertedCount: 0 };
  }

  // 1️⃣ Normalize and validate
  const normalized = data
    .map(d => ({ hours: Number(d.hours) })) // ensure numbers
    .filter(d => !isNaN(d.hours) && d.hours > 0); // remove invalid / zero

  if (!normalized.length) {
    return { insertedCount: 0 };
  }

  // 2️⃣ Insert in a transaction
  return db.transaction(async (tx) => {
    const result = await tx
      .insert(schema.department_hours)
      .values(normalized)
      .onConflictDoNothing() // prevent duplicates
      .returning({ id: schema.department_hours.id }); // return inserted rows

    return {
      insertedCount: result.length, // how many actually inserted
    };
  });
}


// Bulk Course Levels

async bulkInsertCourseLevels(data: { name: string }[]) {
  if (!data.length) {
    return { insertedCount: 0 };
  }

  const normalized = data.map(d => ({
    name: d.name.trim(),
  }));

  return db.transaction(async (tx) => {
    const result = await tx
      .insert(schema.department_levels)
      .values(normalized)
      .onConflictDoNothing()
      .returning({ id: schema.department_levels.id });

    return {
      insertedCount: result.length,
    };
  });
}

// Bulk Courses


async bulkInsertCourses(data: { name: string }[]) {
  if (!data.length) {
    return { insertedCount: 0 };
  }

  const normalized = data.map(d => ({
    name: d.name.trim(),
  }));

  return db.transaction(async (tx) => {
    const result = await tx
      .insert(schema.departments)
      .values(normalized)
      .onConflictDoNothing()
      .returning({ id: schema.departments.id });

    return {
      insertedCount: result.length,
    };
  });
} 
 /**
   * Bulk insert teachers
   * Prevents duplicates on email or mobile
   * @param data Array of teachers with name, email, mobile, password
   * @returns insertedCount
   */
  async bulkInsertTeachers(data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
  }[]) {
    if (!data.length) return { insertedCount: 0 };

    // Normalize / trim data
    const normalized = data.map(d => ({
      name: d.name.trim(),
      email: d.email.trim(),
      mobile: d.mobile.trim(),
      password: d.password.trim(),
    }));

    // Perform transaction
    const result = await db.transaction(async (tx) => {
      const insertRes = await tx
        .insert(schema.teachers)
        .values(normalized)
        .onConflictDoNothing({
          target: [schema.teachers.email, schema.teachers.mobile], // prevent duplicates
          
        });

      return insertRes;
    });

    // Drizzle's insert usually returns the rows affected
    const insertedCount = Array.isArray(result) ? result.length : 0;

    return { insertedCount };
  }

// Bulk Students
 async  bulkInsertStudentsFromCsv(rows: any[]) {
  const validStudents = [];
  const errors: any[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];

    const teacherId = await getTeacherIdByName(r.teacher);
    const courseId = await getCourseIdByName(r.course);
    const courseLevelId = await getLevelIdByName(r.level);
    const courseHoursId = await getHoursIdByValue(Number(r.hours));

    if (!teacherId || !courseId || !courseLevelId || !courseHoursId) {
      errors.push({
        row: i + 2,
        reason: "Invalid teacher/course/level/hours",
      });
      continue;
    }

    validStudents.push({
      name: r.name.trim(),
      civil_id: r.civil_id?.trim(),
      mobile: r.mobile.trim(),
      teacherId,
      courseId,
      courseLevelId,
      courseHoursId,
      classStartDate: r.classStartDate,
      classEndDate: r.classEndDate,
      classStartTime: r.classStartTime,
      classEndtime: r.classEndtime,
      totalCourseHours: Number(r.totalCourseHours) || 0,
      remarks: r.remarks,
      isActive: r.isActive !== "false",
    });
  }

  if (validStudents.length) {
    await db
      .insert(schema.students)
      .values(validStudents)
      .onConflictDoNothing();
  }

  return {
    inserted: validStudents.length,
    failed: errors.length,
    errors,
  };
}


// Bulk Classes
async bulkInsertClassesFromCsv(rows: any[]){
  const validSessions = [];
  const errors: any = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const teacherId = await getTeacherIdByName(r.teacher);
    const departmentId = await getCourseIdByName(r.course);
    if (!teacherId || !departmentId ) {
      errors.push({
        row: i + 2,
        reason: "Invalid teacher/course",
      });
      continue;
    }
    validSessions.push({
      name: r.name.trim(),
      session_type: r.session_type?.trim(),
      teacherId,
      departmentId,
      startTime: r.startTime,
      endTime: r.endTime,
      startDate: r.startDate,
      endDate: r.endDate,
    });
}
 if (validSessions.length) {
    await db
      .insert(schema.sessions)
      .values(validSessions)
      .onConflictDoNothing();
  }
   return {
    inserted: validSessions.length,
    failed: errors.length,
    errors,
  };

  
}


}


export const storage = new DatabaseStorage();
