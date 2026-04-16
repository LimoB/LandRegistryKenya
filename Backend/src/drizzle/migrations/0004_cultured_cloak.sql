CREATE TYPE "public"."payment_method" AS ENUM('stripe', 'mpesa');--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'processing' BEFORE 'completed';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'requires_payment';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'canceled';--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "payment_method" SET DATA TYPE "public"."payment_method" USING "payment_method"::"public"."payment_method";--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "stripe_session_id" varchar(255);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "stripe_event_id" varchar(255);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "stripe_event_type" varchar(100);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "stripe_raw" jsonb;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "confirmed_at" timestamp;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "confirmed_by" varchar(50);--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_stripe_session_id_unique" UNIQUE("stripe_session_id");