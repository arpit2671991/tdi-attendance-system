import { db } from "./storage";
import * as schema from "@shared/schema";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Starting database seed...");

  // Clear existing data
  await db.delete(schema.attendance);
  await db.delete(schema.sessions);
  await db.delete(schema.students);
  await db.delete(schema.teachers);
  await db.delete(schema.admins);

  console.log("Cleared existing data");

  // Create admin
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const [admin] = await db.insert(schema.admins).values({
    name: "System Admin",
    email: "admin@school.edu",
    password: hashedAdminPassword,
  }).returning();

  console.log("Created admin:", admin.email);

  // Create teachers
  const hashedTeacherPassword = await bcrypt.hash("password123", 10);
  const teachers = await db.insert(schema.teachers).values([
    {
      name: "Sarah Wilson",
      email: "sarah@school.edu",
      department: "Mathematics",
      password: hashedTeacherPassword,
    },
    {
      name: "James Chen",
      email: "james@school.edu",
      department: "Science",
      password: hashedTeacherPassword,
    },
    {
      name: "Emily Rodriguez",
      email: "emily@school.edu",
      department: "History",
      password: hashedTeacherPassword,
    },
  ]).returning();

  console.log("Created teachers:", teachers.length);

  // Create students
  const students = await db.insert(schema.students).values([
    { name: "Alex Johnson", grade: "10th" },
    { name: "Bella Davis", grade: "10th" },
    { name: "Charlie Brown", grade: "11th" },
    { name: "Diana Prince", grade: "11th" },
    { name: "Evan Wright", grade: "10th" },
  ]).returning();

  console.log("Created students:", students.length);

  // Create sessions
  const sessions = await db.insert(schema.sessions).values([
    {
      name: "Algebra 101",
      teacherId: teachers[0].id,
      startTime: "09:00",
      endTime: "10:30",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      studentIds: [students[0].id, students[1].id, students[4].id],
    },
    {
      name: "Physics Lab",
      teacherId: teachers[1].id,
      startTime: "11:00",
      endTime: "12:30",
      startDate: "2024-01-01",
      endDate: "2024-06-30",
      studentIds: [students[0].id, students[1].id, students[2].id, students[3].id],
    },
    {
      name: "World History",
      teacherId: teachers[2].id,
      startTime: "14:00",
      endTime: "15:00",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      studentIds: [students[2].id, students[3].id, students[4].id],
    },
  ]).returning();

  console.log("Created sessions:", sessions.length);

  // Create some attendance records for the current month
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const attendanceRecords = [];
  
  // Generate attendance for weekdays of current month up to today
  for (let day = 1; day <= today.getDate(); day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dayOfWeek = date.getDay();
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    const dateStr = date.toISOString().split('T')[0];
    
    for (const session of sessions) {
      // Check if session is active on this date
      if (dateStr < session.startDate || dateStr > session.endDate) continue;
      
      // 90% chance class happened
      if (Math.random() > 0.1) {
        // Randomly select present students (90% attendance rate)
        const presentStudents = session.studentIds.filter(() => Math.random() > 0.1);
        
        // Calculate duration
        const [startH, startM] = session.startTime.split(':').map(Number);
        const [endH, endM] = session.endTime.split(':').map(Number);
        const duration = (endH + endM/60) - (startH + startM/60);
        
        attendanceRecords.push({
          date: dateStr,
          sessionId: session.id,
          presentStudentIds: presentStudents,
          teacherId: session.teacherId,
          durationHours: duration,
        });
      }
    }
  }

  if (attendanceRecords.length > 0) {
    await db.insert(schema.attendance).values(attendanceRecords);
    console.log("Created attendance records:", attendanceRecords.length);
  }

  console.log("Database seeded successfully!");
  console.log("\nLogin credentials:");
  console.log("Admin: admin@school.edu / admin123");
  console.log("Teachers: sarah@school.edu, james@school.edu, emily@school.edu / password123");
  
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
