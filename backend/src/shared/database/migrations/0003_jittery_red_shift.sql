CREATE TYPE "public"."cycle_session_state" AS ENUM('idle', 'running', 'paused_manual', 'paused_inactivity', 'completed');--> statement-breakpoint
CREATE TYPE "public"."task_board_column" AS ENUM('backlog', 'in-progress', 'code-review', 'done');--> statement-breakpoint
CREATE TYPE "public"."task_cycle_assignment" AS ENUM('backlog', 'current', 'next');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('todo', 'doing', 'blocked', 'done');--> statement-breakpoint
CREATE TABLE "cycle_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"active_project_id" uuid,
	"state" "cycle_session_state" DEFAULT 'idle' NOT NULL,
	"cycle_date" date NOT NULL,
	"started_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_checklist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"label" varchar(255) NOT NULL,
	"position" integer NOT NULL,
	"is_done" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"cycle_session_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"column_id" "task_board_column" DEFAULT 'backlog' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"cycle_assignment" "task_cycle_assignment" DEFAULT 'backlog' NOT NULL,
	"due_date" date,
	"estimated_hours" double precision DEFAULT 0 NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cycle_sessions" ADD CONSTRAINT "cycle_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycle_sessions" ADD CONSTRAINT "cycle_sessions_active_project_id_projects_id_fk" FOREIGN KEY ("active_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_checklist_items" ADD CONSTRAINT "task_checklist_items_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_cycle_session_id_cycle_sessions_id_fk" FOREIGN KEY ("cycle_session_id") REFERENCES "public"."cycle_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cycle_sessions_user_id_idx" ON "cycle_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cycle_sessions_active_project_id_idx" ON "cycle_sessions" USING btree ("active_project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cycle_sessions_user_id_cycle_date_key" ON "cycle_sessions" USING btree ("user_id","cycle_date");--> statement-breakpoint
CREATE INDEX "task_checklist_items_task_id_idx" ON "task_checklist_items" USING btree ("task_id");--> statement-breakpoint
CREATE UNIQUE INDEX "task_checklist_items_task_id_position_key" ON "task_checklist_items" USING btree ("task_id","position");--> statement-breakpoint
CREATE INDEX "tasks_user_id_idx" ON "tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tasks_project_id_idx" ON "tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "tasks_cycle_session_id_idx" ON "tasks" USING btree ("cycle_session_id");--> statement-breakpoint
CREATE INDEX "tasks_user_id_column_id_idx" ON "tasks" USING btree ("user_id","column_id");--> statement-breakpoint
CREATE INDEX "tasks_user_id_cycle_assignment_idx" ON "tasks" USING btree ("user_id","cycle_assignment");