import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { number, z } from "zod";

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  mobile: varchar("mobile", { length: 8 }).notNull().unique(),
  password: text("password").notNull(),
});

export const teachers = pgTable("teachers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  mobile: varchar("mobile", { length: 8 }).notNull().unique(),
  password: text("password").notNull(),
  
});
export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  
});
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  grade: text("grade").notNull(), 
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  teacherId: varchar("teacher_id").notNull().references(() => teachers.id),
  departmentId: varchar("department_id").notNull().references(() => departments.id),
  startTime: text("start_time").notNull(), // HH:mm
  endTime: text("end_time").notNull(),     // HH:mm
  startDate: text("start_date").notNull(), // YYYY-MM-DD
  endDate: text("end_date").notNull(),     // YYYY-MM-DD
  studentIds: text("student_ids").array().notNull().default(sql`ARRAY[]::text[]`),
});

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(), // YYYY-MM-DD
  sessionId: varchar("session_id").references(() => sessions.id, {onDelete: "set null"}),
  presentStudentIds: text("present_student_ids").array().notNull().default(sql`ARRAY[]::text[]`),
  teacherId: varchar("teacher_id").notNull().references(() => teachers.id),
  actualStartTime: timestamp("actual_start_time", { mode: "string", withTimezone: true, }),
  actualEndTime: timestamp("actual_end_time", { mode: "string", withTimezone: true, }),
  durationHours: real("duration_hours").notNull(),
});

// Insert schemas
export const insertAdminSchema = createInsertSchema(admins).omit({ id: true });
export const insertTeacherSchema = createInsertSchema(teachers).omit({ id: true });
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true });

// Select types
export type Admin = typeof admins.$inferSelect;
export type Teacher = typeof teachers.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type AttendanceRecord = typeof attendance.$inferSelect;

// Insert types
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
