import { db } from "./storage";
import {
  teachers,
  departments,
  department_levels,
  department_hours,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export async function getTeacherIdByName(name: string) {
  const [row] = await db
    .select({ id: teachers.id })
    .from(teachers)
    .where(eq(teachers.name, name.trim()));

  return row?.id;
}

export async function getCourseIdByName(name: string) {
  const [row] = await db
    .select({ id: departments.id })
    .from(departments)
    .where(eq(departments.name, name.trim()));

  return row?.id;
}

export async function getLevelIdByName(name: string) {
  const [row] = await db
    .select({ id: department_levels.id })
    .from(department_levels)
    .where(eq(department_levels.name, name.trim()));

  return row?.id;
}

export async function getHoursIdByValue(hours: number) {
  const [row] = await db
    .select({ id: department_hours.id })
    .from(department_hours)
    .where(eq(department_hours.hours, hours));

  return row?.id;
}
