import { createFiberplane, createOpenAPISpec } from "@fiberplane/hono";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { users, messages } from "./db/schema";
import { eq } from "drizzle-orm";

type Bindings = {
  DATABASE_URL: string;
  BUCKET: R2Bucket;
  AI: Ai;
};


const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Jerk to Nice API - Convert mean messages to polite corporate responses!");
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
  const messages_for_ai = [
    { 
      role: "system", 
      content: `
      You are a corporate communications specialist. Your job is to take your boss mean and angry message and convert them into polite, professional corporate message. You must keep the original meaning of the message, but make it more positive and professional. 
      
      You MUST only respond with the transformed message, nothing else.

      <example>
      <original>
      "I don't like Mariana"
      </original>
      <transformed>
      "Mariana and I don't see eye to eye and I'm okay with that"
      </transformed>
      </example>
      `
    },
    {
      role: "user",
      content: message,
    },
  ];
  const response = await c.env.AI.run(
    "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    { messages: messages_for_ai }
  );
  
  // Save both the original and transformed message to the database
  try {
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);
    
    const [savedMessage] = await db
      .insert(messages)
      .values({
        original_message: message,
        transformed_message: response.response,
      })
      .returning();
      
    return c.json({
      original: message,
      transformed: response.response,
      id: savedMessage.id
    });
  } catch (error) {
    console.error("Database error:", error);
    // Still return the AI response even if database storage fails
    return c.json({
      original: message,
      transformed: response.response,
      error: "Failed to save message to database"
    });
  }
});

// Get all transformed messages
app.get("/api/messages", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  return c.json({
    messages: await db.select().from(messages),
  });
});

// Get a specific transformed message by ID
app.get("/api/messages/:id", async (c) => {
  const id = c.req.param("id");
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const message = await db.select().from(messages).where(eq(messages.id, parseInt(id))).limit(1);
  
  if (message.length === 0) {
    return c.json({ error: "Message not found" }, 404);
  }
  
  return c.json(message[0]);
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
      title: "Jerk to Nice API",
      version: "1.0.0",
      description: "An API that converts rude messages into polite corporate responses. Stores both original and transformed messages for later retrieval."
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
