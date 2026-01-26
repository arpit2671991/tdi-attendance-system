CREATE TABLE "session_students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"student_id" varchar NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "student_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "status" text DEFAULT 'present' NOT NULL;--> statement-breakpoint
ALTER TABLE "session_students" ADD CONSTRAINT "session_students_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_students" ADD CONSTRAINT "session_students_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_session_student" ON "session_students" USING btree ("session_id","student_id");--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" DROP COLUMN "present_student_ids";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "student_ids";