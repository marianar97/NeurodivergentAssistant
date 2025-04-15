CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"thumbnail" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
