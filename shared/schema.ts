import { table } from "console";
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, real, pgEnum, boolean, uniqueIndex, uuid, date  } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { number, TypeOf, z } from "zod";

export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent", "late", "excused"]);
export const sessionTypeEnum = pgEnum("session_type", ["private", "group"])


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
  mobile: varchar("mobile", { length: 20 }).notNull().unique(),
  password: text("password").notNull(),
  
});

export const department_levels = pgTable("department_levels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique() // e.g., A1, A2, A3
});

export const department_hours = pgTable("department_hours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hours: real("hours").notNull()
});


export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
});

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  civil_id: varchar("civil_id"),
  mobile: varchar("mobile").notNull(),
  teacherId: varchar("teacher_id").notNull().references(() => teachers.id),
  courseLevelId: varchar("course_level_id").notNull().references(() => department_levels.id),
  courseHoursId: varchar("course_hours_id").notNull().references(() => department_hours.id),
  courseId: varchar("course_id").notNull().references(() => departments.id),
  classStartDate: text("class_start_date").notNull(),
  classEndDate: text("class_end_date").notNull(),
  classStartTime: text("class_start_time").notNull(),
  classEndtime: text("class_end_time").notNull(),
  remarks: text("remarks"),
  isActive: boolean().notNull().default(true),
  totalCourseHours: real("total_course_hours").notNull(),
  consumedHours: real("consumed_hours").notNull().default(0),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  session_type: sessionTypeEnum("session_type").notNull().default("private"),
  teacherId: varchar("teacher_id").notNull().references(() => teachers.id),
  departmentId: varchar("department_id").notNull().references(() => departments.id),
  startTime: text("start_time").notNull(), // HH:mm
  endTime: text("end_time").notNull(),     // HH:mm
  startDate: text("start_date").notNull(), // YYYY-MM-DD
  endDate: text("end_date").notNull(),     // YYYY-MM-DD

  // studentIds: text("student_ids").array().notNull().default(sql`ARRAY[]::text[]`),
});

export const sessionExceptions = pgTable("session_exceptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .references(() => sessions.id, { onDelete: "cascade" })
    .notNull(),
  exceptionDate: date("exception_date").notNull(), 
  status: text("status", { enum: ["cancelled", "postponed", "rescheduled"] }).notNull(),
  overrideStartTime: text("override_start_time"), 
  overrideEndTime: text("override_end_time"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});



// export const attendance = pgTable("attendance", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   date: text("date").notNull(), // YYYY-MM-DD
//   sessionId: varchar("session_id").references(() => sessions.id, {onDelete: "set null"}),
//   studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
//   status: text("status").notNull().default("present"),
//   // presentStudentIds: text("present_student_ids").array().notNull().default(sql`ARRAY[]::text[]`),
//   teacherId: varchar("teacher_id").notNull().references(() => teachers.id),
//   actualStartTime: timestamp("actual_start_time", { mode: "string", withTimezone: true, }),
//   actualEndTime: timestamp("actual_end_time", { mode: "string", withTimezone: true, }),
//   // durationHours: real("duration_hours").notNull(),
// });

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  status: attendanceStatusEnum("status").notNull().default("present"),
  date: text("date").notNull(), // YYYY-MM-DD
  markedBy: text("marked_by").notNull(), // ID of the Admin or Teacher who did the marking
  remarks: text("remarks"),
  durationHours: real("duration_hours").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Prevents duplicate attendance for the same student in the same session on the same day
  uniqueStudentSessionDay: uniqueIndex("unique_student_session_day").on(table.sessionId, table.studentId, table.date),
}));

export const teacherAttendance = pgTable("teacher_attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  teacherId: varchar("teacher_id").notNull().references(() => teachers.id, { onDelete: "cascade" }),
  status: attendanceStatusEnum("status").notNull().default("present"),
  date: text("date").notNull(),
  durationHours: real("duration_hours").notNull(),
  markedBy: text("marked_by").notNull(), // Admin ID or Self
  checkInTime: text("check_in_time"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueTeacherSessionDay: uniqueIndex("unique_teacher_session_day").on(table.sessionId, table.teacherId, table.date),
}));

export const sessionStudents = pgTable("session_students", {
  id: uuid("id").defaultRandom().primaryKey(),
   sessionId: varchar("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
   studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  isActive: boolean().notNull().default(true),
}, (table) => ({
    uniqueSessionStudent: uniqueIndex(
      "unique_session_student"
    ).on(table.sessionId, table.studentId),
  }))

export const DbNotification = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(), // e.g., "consecutive_absence"
  studentId: varchar("student_id").references(() => students.id),
  message: text("message").notNull(),
  severity: text("severity").default("medium"), // medium, high
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});


export type StudentCourseHoursReport = {
  studentId: string;
  studentName: string;
  studentMobile: string;
  courseName: string;
  courseHours: number;
  consumedHours: number;
  remainingHours: number;
};

export type TeachersHoursData = {
  teacherId: string;
  teacherName: string;
  month: string;
  totalHours: number;
};

// Types and Validation Schemas
export const insertExceptionSchema = createInsertSchema(sessionExceptions);
export const selectExceptionSchema = createSelectSchema(sessionExceptions);
export type SessionException = z.infer<typeof selectExceptionSchema>;
export type InsertSessionException = z.infer<typeof insertExceptionSchema>;

// Add to your Zod schemas
export const insertDbNotification = createInsertSchema(DbNotification);
export type DbNotification = typeof DbNotification.$inferSelect;

  
// Insert schemas
export const insertAdminSchema = createInsertSchema(admins).omit({ id: true });
export const insertTeacherSchema = createInsertSchema(teachers).omit({ id: true });
export const insertDepartmentLevelSchema = createInsertSchema(department_levels).omit({ id: true });
export const insertDepartmentHourSchema = createInsertSchema(department_hours).omit({ id: true });  
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true });
// export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true });
export const insertSessionStudentSchema = createInsertSchema(sessionStudents).omit({id: true});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true, createdAt: true });
export const insertTeacherAttendanceSchema = createInsertSchema(teacherAttendance).omit({ id: true, createdAt: true });
// export const inserTeacherAttendanceSchema = createInsertSchema(teacherAttendance).omit({id: true})

// Select types
export type Admin = typeof admins.$inferSelect;
export type Teacher = typeof teachers.$inferSelect;
export type DepartmentLevel = typeof department_levels.$inferSelect;
export type DepartmentHour = typeof department_hours.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Session = typeof sessions.$inferSelect;
// export type AttendanceRecord = typeof attendance.$inferSelect;
export type SessionStudent = typeof sessionStudents.$inferInsert;
export type Attendance = typeof attendance.$inferSelect;
export type TeacherAttendance = typeof teacherAttendance.$inferSelect;

// Insert types
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type InsertDepartmentLevel = z.infer<typeof insertDepartmentLevelSchema>;
export type InsertDepartmentHour = z.infer<typeof insertDepartmentHourSchema>;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
// export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertSessionStudent = z.infer<typeof insertSessionStudentSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertTeacherAttendance = z.infer<typeof insertTeacherAttendanceSchema>;
export type InsertDbNotification = z.infer<typeof insertDbNotification>;

// export type InserTeacherAttendance = z.infer<typeof inserTeacherAttendanceSchema>;

