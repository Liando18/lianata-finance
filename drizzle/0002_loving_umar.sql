CREATE TYPE "public"."segment" AS ENUM('Hemat', 'Konsumtif', 'Impulsif');--> statement-breakpoint
CREATE TABLE "user_segments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"segment" "segment" NOT NULL,
	"total_expense" varchar(20),
	"txn_count" integer DEFAULT 0,
	"avg_amount" varchar(20),
	"variance" varchar(20),
	"calculated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_segments_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user_segments" ADD CONSTRAINT "user_segments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;