CREATE TABLE "departments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admins" ALTER COLUMN "mobile" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "teachers" ALTER COLUMN "mobile" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "department_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" DROP COLUMN "department";