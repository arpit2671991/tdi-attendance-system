import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const teachers = pgTable("teachers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  department: text("department").notNull(),
  password: text("password").notNull(),
});

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  grade: text("grade").notNull(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  teacherId: varchar("teacher_id").notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  startTime: text("start_time").notNull(), // HH:mm
  endTime: text("end_time").notNull(),     // HH:mm
  startDate: text("start_date").notNull(), // YYYY-MM-DD
  endDate: text("end_date").notNull(),     // YYYY-MM-DD
  studentIds: text("student_ids").array().notNull().default(sql`ARRAY[]::text[]`),
});

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(), // YYYY-MM-DD
  sessionId: varchar("session_id").notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  presentStudentIds: text("present_student_ids").array().notNull().default(sql`ARRAY[]::text[]`),
  teacherId: varchar("teacher_id").notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  durationHours: real("duration_hours").notNull(),
});

// Insert schemas
export const insertAdminSchema = createInsertSchema(admins).omit({ id: true });
export const insertTeacherSchema = createInsertSchema(teachers).omit({ id: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true });

// Select types
export type Admin = typeof admins.$inferSelect;
export type Teacher = typeof teachers.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type AttendanceRecord = typeof attendance.$inferSelect;

// Insert types
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
