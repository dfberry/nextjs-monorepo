ALTER TABLE "session" ADD CONSTRAINT "session_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "token" ADD CONSTRAINT "token_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_id_unique" UNIQUE("id");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_github_id_unique" UNIQUE("github_id");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");