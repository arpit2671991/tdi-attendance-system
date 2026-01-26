CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'late', 'excused');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"student_id" varchar,
	"message" text NOT NULL,
	"severity" text DEFAULT 'medium',
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teacher_attendance" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"teacher_id" varchar NOT NULL,
	"status" "attendance_status" DEFAULT 'present' NOT NULL,
	"date" text NOT NULL,
	"duration_hours" real NOT NULL,
	"marked_by" text NOT NULL,
	"check_in_time" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_teacher_id_teachers_id_fk";
--> statement-breakpoint
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_session_id_sessions_id_fk";
--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "session_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "status" SET DEFAULT 'present'::"public"."attendance_status";--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "status" SET DATA TYPE "public"."attendance_status" USING "status"::"public"."attendance_status";--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "marked_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "remarks" text;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_attendance" ADD CONSTRAINT "teacher_attendance_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_attendance" ADD CONSTRAINT "teacher_attendance_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_teacher_session_day" ON "teacher_attendance" USING btree ("session_id","teacher_id","date");--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_student_session_day" ON "attendance" USING btree ("session_id","student_id","date");--> statement-breakpoint
ALTER TABLE "attendance" DROP COLUMN "teacher_id";--> statement-breakpoint
ALTER TABLE "attendance" DROP COLUMN "actual_start_time";--> statement-breakpoint
ALTER TABLE "attendance" DROP COLUMN "actual_end_time";--> statement-breakpoint
ALTER TABLE "department_levels" ADD CONSTRAINT "department_levels_name_unique" UNIQUE("name");