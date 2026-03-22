CREATE TYPE "public"."auth_provider" AS ENUM('email', 'google', 'hybrid');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"password_hash" text,
	"auth_provider" "auth_provider" DEFAULT 'email' NOT NULL,
	"google_linked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "google_accounts" ADD COLUMN "google_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "google_accounts" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "google_accounts" ADD CONSTRAINT "google_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "google_accounts_user_id_idx" ON "google_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "google_accounts_user_id_google_id_key" ON "google_accounts" USING btree ("user_id","google_id");--> statement-breakpoint
ALTER TABLE "google_accounts" ADD CONSTRAINT "google_accounts_google_id_unique" UNIQUE("google_id");