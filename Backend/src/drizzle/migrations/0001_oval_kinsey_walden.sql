ALTER TABLE "verification_tokens" ALTER COLUMN "token" SET DATA TYPE varchar(10);--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD COLUMN "attempts" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD COLUMN "used" boolean DEFAULT false;