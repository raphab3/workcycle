CREATE TYPE "public"."pulse_record_resolution" AS ENUM('pending', 'confirmed', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."pulse_record_status" AS ENUM('confirmed', 'unconfirmed');--> statement-breakpoint
CREATE TYPE "public"."cycle_rollover_strategy" AS ENUM('auto-close-and-open-next', 'manual-start-next');--> statement-breakpoint
CREATE TABLE "cycle_time_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"confirmed_minutes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pulse_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid,
	"window_key" varchar(80) NOT NULL,
	"fired_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"responded_at" timestamp with time zone,
	"status" "pulse_record_status" NOT NULL,
	"resolution" "pulse_record_resolution" DEFAULT 'pending' NOT NULL,
	"reviewed_at" timestamp with time zone,
	"confirmed_minutes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cycle_sessions" ADD COLUMN "snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "cycle_sessions" ADD COLUMN "previous_cycle_date" date;--> statement-breakpoint
ALTER TABLE "cycle_sessions" ADD COLUMN "rollover_triggered_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "cycle_sessions" ADD COLUMN "rollover_strategy" "cycle_rollover_strategy" DEFAULT 'manual-start-next' NOT NULL;--> statement-breakpoint
ALTER TABLE "cycle_sessions" ADD COLUMN "rollover_notice_title" varchar(255);--> statement-breakpoint
ALTER TABLE "cycle_sessions" ADD COLUMN "rollover_notice_description" text;--> statement-breakpoint
ALTER TABLE "cycle_time_blocks" ADD CONSTRAINT "cycle_time_blocks_cycle_session_id_cycle_sessions_id_fk" FOREIGN KEY ("cycle_session_id") REFERENCES "public"."cycle_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycle_time_blocks" ADD CONSTRAINT "cycle_time_blocks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycle_time_blocks" ADD CONSTRAINT "cycle_time_blocks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_records" ADD CONSTRAINT "pulse_records_cycle_session_id_cycle_sessions_id_fk" FOREIGN KEY ("cycle_session_id") REFERENCES "public"."cycle_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_records" ADD CONSTRAINT "pulse_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_records" ADD CONSTRAINT "pulse_records_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cycle_time_blocks_cycle_session_id_idx" ON "cycle_time_blocks" USING btree ("cycle_session_id");--> statement-breakpoint
CREATE INDEX "cycle_time_blocks_user_id_idx" ON "cycle_time_blocks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cycle_time_blocks_project_id_idx" ON "cycle_time_blocks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "pulse_records_cycle_session_id_idx" ON "pulse_records" USING btree ("cycle_session_id");--> statement-breakpoint
CREATE INDEX "pulse_records_user_id_idx" ON "pulse_records" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pulse_records_cycle_session_window_key_key" ON "pulse_records" USING btree ("cycle_session_id","window_key");--> statement-breakpoint
CREATE INDEX "cycle_sessions_previous_cycle_date_idx" ON "cycle_sessions" USING btree ("previous_cycle_date");