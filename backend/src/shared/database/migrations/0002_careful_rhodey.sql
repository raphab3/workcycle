CREATE TYPE "public"."project_status" AS ENUM('active', 'paused');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('fixed', 'rotative');--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"color_hex" varchar(32) NOT NULL,
	"allocation_pct" integer NOT NULL,
	"type" "project_type" NOT NULL,
	"sprint_days" integer NOT NULL,
	"status" "project_status" DEFAULT 'active' NOT NULL,
	"fixed_days" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"fixed_hours_per_day" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "projects_user_id_idx" ON "projects" USING btree ("user_id");