import { createFiberplane, createOpenAPISpec } from "@fiberplane/hono";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { users } from "./db/schema";

type Bindings = {
  DATABASE_URL: string;
  BUCKET: R2Bucket;
  AI: Ai;
};


const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Honc! 🪿");
});

app.get("/api/users", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  return c.json({
    users: await db.select().from(users),
  });
});

app.post("/api/user", async (c) => {
  const db = drizzle(c.env.DATABASE_URL);
  const r2 = c.env.BUCKET;
  const formData = await c.req.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const profile = formData.get("profile-pic") as File;

  if (!name || !email) {
    return c.json({ error: "Name and email are required" }, 400);
  }

  // Generate a unique filename to prevent collisions
  const uniqueFilename = `${Date.now()}-${profile.name}`;
  await r2.put("profile-pics/" + uniqueFilename, profile);

  try {
    const [newUser] = await db
      .insert(users)
      .values({
        name: name.toString(),
        email: email.toString(),
        thumbnail: "profile-pics/" + uniqueFilename,
      })
      .returning();

    return c.json(newUser);
  } catch (error) {
    console.error("Database error:", error);
    return c.json({ error: "Failed to create user" }, 500);
  }
});

app.post("/api/ai", async (c) => {
  const { message } = await c.req.json();
  const messages = [
    { role: "system", content: "You are a friendly assistant" },
    {
      role: "user",
      content: message,
    },
  ];
  const response = await c.env.AI.run(
    "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    { messages }
  );
  return c.json(response);
});

/**
 * Serve a simplified api specification for your API
 * As of writing, this is just the list of routes and their methods.
 */
app.get("/openapi.json", c => {
  // @ts-expect-error - @fiberplane/hono is in beta and still not typed correctly
  return c.json(createOpenAPISpec(app, {
    openapi: "3.0.0",
    info: {
      title: "Honc D1 App",
      version: "1.0.0",
    },
  }))
});

/**
 * Mount the Fiberplane api explorer to be able to make requests against your API.
 * 
 * Visit the explorer at `/fp`
 */
app.use("/fp/*", createFiberplane({
  app,
  openapi: { url: "/openapi.json" }
}));

export default app;

// Export the instrumented app if you've wired up a Fiberplane-Hono-OpenTelemetry trace collector
//
// export default instrument(app);
