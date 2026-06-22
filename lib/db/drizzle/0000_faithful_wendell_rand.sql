CREATE TABLE "couple_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner1_name" text DEFAULT 'Partner 1' NOT NULL,
	"partner2_name" text DEFAULT 'Partner 2' NOT NULL,
	"partner1_status" text DEFAULT '' NOT NULL,
	"partner2_status" text DEFAULT '' NOT NULL,
	"partner1_emoji" text,
	"partner2_emoji" text,
	"anniversary_date" text,
	"couple_title" text,
	"partner1_happiness_value" integer DEFAULT 0 NOT NULL,
	"partner1_happiness_pressed_at" timestamp with time zone,
	"partner2_happiness_value" integer DEFAULT 0 NOT NULL,
	"partner2_happiness_pressed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"note" text,
	"added_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"note" text,
	"target_date" text,
	"category" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"note" text,
	"link" text,
	"added_by" text,
	"purchased" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bucketlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"note" text,
	"target_date" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"note" text,
	"emoji" text,
	"is_anniversary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
