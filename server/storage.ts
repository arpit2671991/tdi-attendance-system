import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "@shared/schema";
import { eq, and, gte, lte, like, or, sql } from "drizzle-orm";
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
  InsertAttendance,
} from "@shared/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export interface IStorage {
  // Admin CRUD
  getAdmin(id: string): Promise<Admin | undefined>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  getAllAdmins(): Promise<Admin[]>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  deleteAdmin(id: string): Promise<void>;

  // Teacher CRUD
  getTeacher(id: string): Promise<Teacher | undefined>;
  getTeacherByEmail(email: string): Promise<Teacher | undefined>;
  getAllTeachers(): Promise<Teacher[]>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher | undefined>;
  deleteTeacher(id: string): Promise<void>;

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

  // Attendance CRUD
  getAttendanceRecord(id: string): Promise<AttendanceRecord | undefined>;
  getAllAttendance(): Promise<AttendanceRecord[]>;
  getAttendanceByDateAndSession(date: string, sessionId: string): Promise<AttendanceRecord | undefined>;
  getAttendanceByFilters(filters: {
    startDate?: string;
    endDate?: string;
    teacherId?: string;
    sessionId?: string;
    studentId?: string;
  }): Promise<AttendanceRecord[]>;
  createAttendance(attendance: InsertAttendance): Promise<AttendanceRecord>;
  deleteAttendance(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Admin methods
  async getAdmin(id: string): Promise<Admin | undefined> {
    const result = await db.select().from(schema.admins).where(eq(schema.admins.id, id));
    return result[0];
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const result = await db.select().from(schema.admins).where(eq(schema.admins.email, email));
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

  async getTeacherByEmail(email: string): Promise<Teacher | undefined> {
    const result = await db.select().from(schema.teachers).where(eq(schema.teachers.email, email));
    return result[0];
  }

  async getAllTeachers(): Promise<Teacher[]> {
    return await db.select().from(schema.teachers);
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

  // Student methods
  async getStudent(id: string): Promise<Student | undefined> {
    const result = await db.select().from(schema.students).where(eq(schema.students.id, id));
    return result[0];
  }

  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(schema.students);
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
    return await db.select().from(schema.sessions);
  }

  async getSessionsByTeacher(teacherId: string): Promise<Session[]> {
    return await db.select().from(schema.sessions).where(eq(schema.sessions.teacherId, teacherId));
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

  // Attendance methods
  async getAttendanceRecord(id: string): Promise<AttendanceRecord | undefined> {
    const result = await db.select().from(schema.attendance).where(eq(schema.attendance.id, id));
    return result[0];
  }

  async getAllAttendance(): Promise<AttendanceRecord[]> {
    return await db.select().from(schema.attendance);
  }

  async getAttendanceByDateAndSession(date: string, sessionId: string): Promise<AttendanceRecord | undefined> {
    const result = await db
      .select()
      .from(schema.attendance)
      .where(and(eq(schema.attendance.date, date), eq(schema.attendance.sessionId, sessionId)));
    return result[0];
  }

  async getAttendanceByFilters(filters: {
    startDate?: string;
    endDate?: string;
    teacherId?: string;
    sessionId?: string;
    studentId?: string;
  }): Promise<AttendanceRecord[]> {
    const conditions = [];

    if (filters.startDate) {
      conditions.push(gte(schema.attendance.date, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(schema.attendance.date, filters.endDate));
    }
    if (filters.teacherId) {
      conditions.push(eq(schema.attendance.teacherId, filters.teacherId));
    }
    if (filters.sessionId) {
      conditions.push(eq(schema.attendance.sessionId, filters.sessionId));
    }
    if (filters.studentId) {
      conditions.push(sql`${filters.studentId} = ANY(${schema.attendance.presentStudentIds})`);
    }

    if (conditions.length === 0) {
      return await db.select().from(schema.attendance);
    }

    return await db.select().from(schema.attendance).where(and(...conditions));
  }

  async createAttendance(attendance: InsertAttendance): Promise<AttendanceRecord> {
    const result = await db.insert(schema.attendance).values(attendance).returning();
    return result[0];
  }

  async deleteAttendance(id: string): Promise<void> {
    await db.delete(schema.attendance).where(eq(schema.attendance.id, id));
  }
}

export const storage = new DatabaseStorage();
