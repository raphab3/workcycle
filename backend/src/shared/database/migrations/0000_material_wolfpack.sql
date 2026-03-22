CREATE TYPE "public"."accounting_status" AS ENUM('pending', 'approved', 'ignored', 'silenced');--> statement-breakpoint
CREATE TYPE "public"."event_response_status" AS ENUM('accepted', 'declined', 'tentative', 'needsAction');--> statement-breakpoint
CREATE TABLE "google_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"token_expires_at" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "google_accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "google_calendars" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"color_hex" varchar(32) NOT NULL,
	"is_included" boolean DEFAULT true NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" text PRIMARY KEY NOT NULL,
	"calendar_id" text NOT NULL,
	"title" varchar(512) NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"location" text,
	"description" text,
	"meet_link" text,
	"recurrence_rule" text,
	"recurring_event_id" text,
	"attendees" jsonb NOT NULL,
	"response_status" "event_response_status" DEFAULT 'needsAction' NOT NULL,
	"is_all_day" boolean DEFAULT false NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"project_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_accounting_statuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" text NOT NULL,
	"date" varchar(10) NOT NULL,
	"status" "accounting_status" DEFAULT 'pending' NOT NULL,
	"silenced_event_id" text,
	"approved_minutes" integer,
	"project_id" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "google_calendars" ADD CONSTRAINT "google_calendars_account_id_google_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."google_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_calendar_id_google_calendars_id_fk" FOREIGN KEY ("calendar_id") REFERENCES "public"."google_calendars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_accounting_statuses" ADD CONSTRAINT "event_accounting_statuses_event_id_calendar_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."calendar_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "google_calendars_account_id_idx" ON "google_calendars" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "calendar_events_calendar_id_idx" ON "calendar_events" USING btree ("calendar_id");--> statement-breakpoint
CREATE INDEX "calendar_events_project_id_idx" ON "calendar_events" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "calendar_events_recurring_event_id_idx" ON "calendar_events" USING btree ("recurring_event_id");--> statement-breakpoint
CREATE INDEX "calendar_events_start_at_idx" ON "calendar_events" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "event_accounting_statuses_date_idx" ON "event_accounting_statuses" USING btree ("date");--> statement-breakpoint
CREATE INDEX "event_accounting_statuses_project_id_idx" ON "event_accounting_statuses" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "event_accounting_statuses_silenced_event_id_idx" ON "event_accounting_statuses" USING btree ("silenced_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_accounting_statuses_event_id_date_key" ON "event_accounting_statuses" USING btree ("event_id","date");