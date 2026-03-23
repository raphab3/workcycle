CREATE TABLE "weekly_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"week_key" varchar(8) NOT NULL,
	"week_starts_at" date NOT NULL,
	"week_ends_at" date NOT NULL,
	"timezone" varchar(120) NOT NULL,
	"is_final" boolean DEFAULT true NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "weekly_snapshots" ADD CONSTRAINT "weekly_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "weekly_snapshots_user_id_idx" ON "weekly_snapshots" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "weekly_snapshots_week_key_idx" ON "weekly_snapshots" USING btree ("week_key");--> statement-breakpoint
CREATE UNIQUE INDEX "weekly_snapshots_user_id_week_key_key" ON "weekly_snapshots" USING btree ("user_id","week_key");