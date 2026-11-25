CREATE TABLE "application_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" uuid NOT NULL,
	"status" varchar(30) NOT NULL,
	"note" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ref" varchar(20) NOT NULL,
	"user_id" uuid NOT NULL,
	"destination" varchar(60) NOT NULL,
	"visa_type" varchar(120) NOT NULL,
	"travelers" integer DEFAULT 1 NOT NULL,
	"travel_date" varchar(20) NOT NULL,
	"full_name" varchar(120) NOT NULL,
	"passport_number" varchar(40) NOT NULL,
	"passport_expiry" varchar(20) NOT NULL,
	"dob" varchar(20) NOT NULL,
	"email" varchar(200) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"purpose" varchar(40) DEFAULT 'Tourism' NOT NULL,
	"payment_method" varchar(30) DEFAULT 'bKash' NOT NULL,
	"amount_bdt" integer NOT NULL,
	"status" varchar(30) DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "applications_ref_unique" UNIQUE("ref")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"token_hash" varchar(100) NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(200) NOT NULL,
	"password_hash" text NOT NULL,
	"phone" varchar(40) DEFAULT '' NOT NULL,
	"nationality" varchar(80) DEFAULT 'Bangladesh' NOT NULL,
	"passport_number" varchar(40) DEFAULT '' NOT NULL,
	"passport_expiry" varchar(20) DEFAULT '' NOT NULL,
	"dob" varchar(20) DEFAULT '' NOT NULL,
	"city" varchar(80) DEFAULT 'Dhaka' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "visa_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"destination" varchar(60) NOT NULL,
	"visa_type" varchar(120) NOT NULL,
	"issued_on" varchar(20) NOT NULL,
	"expires_on" varchar(20) DEFAULT '' NOT NULL,
	"outcome" varchar(20) DEFAULT 'approved' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application_events" ADD CONSTRAINT "application_events_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visa_history" ADD CONSTRAINT "visa_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_app_idx" ON "application_events" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "applications_user_idx" ON "applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "history_user_idx" ON "visa_history" USING btree ("user_id");