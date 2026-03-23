CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"timezone" varchar(120) DEFAULT 'UTC' NOT NULL,
	"notifications_enabled" boolean DEFAULT false NOT NULL,
	"daily_review_time" varchar(5) DEFAULT '18:00' NOT NULL,
	"cycle_start_hour" varchar(5) DEFAULT '00:00' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_settings_user_id_idx" ON "user_settings" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings" USING btree ("user_id");