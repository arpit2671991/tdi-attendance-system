ALTER TABLE "department_hours" ALTER COLUMN "hours" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "total_course_hours" real NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "consumed_hours" real DEFAULT 0 NOT NULL;