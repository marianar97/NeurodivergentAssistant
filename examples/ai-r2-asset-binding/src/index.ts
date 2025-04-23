import { createFiberplane, createOpenAPISpec } from "@fiberplane/hono";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { users, messages } from "./db/schema";
import { eq } from "drizzle-orm";

// Helper function to generate a random unique ID
function generateUniqueId(length = 16) {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomStr}`.slice(0, length);
}

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
      You are a communications specialist. Your job is to take your boss mean and angry message and convert them into polite, professional corporate message. You must keep the original meaning of the message, but make it more positive and professional. 
      
      You MUST only respond with the transformed message, nothing else.

      <example>
      <original>
      "I don't like Mariana"
      </original>
      <transformed>
      "Mariana and I don't see eye to eye and I'm okay with that"
      </transformed>
      </example>

      <example2>
      <original>
      "I don't have the bandwidth to do this right now"
      </original>
      <transformed>
      "I don't have time for this"
      </transformed>
      </example2>
      `
    },
    {
      role: "user",
      content: message,
    },
  ];
  const aiResponse = await c.env.AI.run(
    "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    { messages: messages_for_ai }
  );
  
  // Extract the text from the AI response
  let transformedMessage = "";
  if (typeof aiResponse === 'object' && aiResponse !== null) {
    // If the response is in the expected format
    transformedMessage = aiResponse.response || "";
  } else {
    // Fallback handling for other response formats
    transformedMessage = String(aiResponse);
  }
  
  // Create a unique ID for this message
  const messageId = generateUniqueId();
  
  // Save both the original and transformed message to the database
  try {
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);
    
    // Use custom ID field instead of relying on auto-increment
    const [savedMessage] = await db
      .insert(messages)
      .values({
        id: messageId,
        original_message: message,
        transformed_message: transformedMessage,
      })
      .returning();
      
    return c.json({
      original: message,
      transformed: transformedMessage,
      id: savedMessage.id
    });
  } catch (error) {
    console.error("Database error:", error);
    // Still return the AI response even if database storage fails
    return c.json({
      original: message,
      transformed: transformedMessage,
      id: messageId,
      error: "Failed to save message to database"
    });
  }
});


app.post("/api/ai/inverse", async (c) => {
  const { message } = await c.req.json();
  const messages_for_ai = [
    { 
      role: "system", 
      content: `
      You are a neurodivergent-friendly translator. Your job is to take corporate jargon, unclear business speak, or complex professional language and translate it into clear, literal, and concise language.
      
      For people on the autism spectrum who may:
      - Struggle with metaphors, idioms, and implied meanings
      - Prefer direct, concrete communication
      - Need clear, specific instructions without ambiguity
      - Have difficulty with vague language or unstated expectations
      
      Your response should:
      - Use simple, direct language
      - Avoid metaphors and idioms
      - Clearly state any implied expectations or requests
      - Eliminate unnecessary corporate jargon
      - you MIST be concise and use normal slang
      
      You MUST only respond with the simplified message, nothing else.

      <example1>
      <original>
      "Mariana and I don't see eye to eye and I'm okay with that"
      </original>
      <simplified>
      "I don't like Mariana"
      </simplified>
      </example1>

      <example2>
      <original>
      "Let's circle back on this."
      </original>
      <simplified>
      "I don't want to talk about this right now. "
      </simplified>
      </example2>

      <example3>
      <original>
        "We'll table this for now."
      </original>
      <simplified>
        "We're not discussing this right now."
      </simplified>
      </example3>

      <example4>
      <original>
        "After careful consideration, we decided to pivot"
      </original>
      <simplified>
        "we made a mistake"
      </simplified>
      </example4>


      <example5>
      <original>
        "No offense, but…"
      </original>
      <simplified>
          "I'm about to insult you."
      </simplified>
      </example5>

      <example6>
        <original>
          "That's an…interesting take."
        </original>
        <simplified>
          "I think your opinion is wrong or strange."
        </simplified>
      </example>

      <example7>
        <original>
          "I'll take that under advisement."
        </original>
        <simplified>
          "I'll probably ignore it."
        </simplified>
      </example>

      <example8>
        <original>
          "Sounds good in theory."
        </original>
        <simplified>
          "It'll never work in practice."
        </simplified>
      </example>

      <example9>
        <original>
          "With all due respect…"
        </original>
        <simplified>
          "I'm about to strongly disagree or criticize you."
        </simplified>
      </example9>
      `
    },
    {
      role: "user",
      content: message,
    },
  ];
  const aiResponse = await c.env.AI.run(
    "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    { messages: messages_for_ai }
  );
  
  // Extract the text from the AI response
  let transformedMessage = "";
  if (typeof aiResponse === 'object' && aiResponse !== null) {
    // If the response is in the expected format
    transformedMessage = aiResponse.response || "";
  } else {
    // Fallback handling for other response formats
    transformedMessage = String(aiResponse);
  }
  
  // Create a unique ID for this message
  const messageId = generateUniqueId();
  
  // Save both the original and transformed message to the database
  try {
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);
    
    // Use custom ID field instead of relying on auto-increment
    const [savedMessage] = await db
      .insert(messages)
      .values({
        id: messageId,
        original_message: message,
        transformed_message: transformedMessage,
      })
      .returning();
      
    return c.json({
      original: message,
      transformed: transformedMessage,
      id: savedMessage.id
    });
  } catch (error) {
    console.error("Database error:", error);
    // Still return the AI response even if database storage fails
    return c.json({
      original: message,
      transformed: transformedMessage,
      id: messageId,
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

  const message = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
  
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
      title: "Message Transformer API",
      version: "1.0.0",
      description: "An API with two modes: 1) Converts rude messages into polite corporate responses, and 2) Converts corporate jargon into clear, literal language for neurodivergent users."
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
