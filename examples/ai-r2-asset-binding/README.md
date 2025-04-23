## 🤬➡️😇 Jerk to Nice API

This is a project that converts rude, mean, or angry messages into polite, professional corporate responses.

It uses Neon as a database, Cloudflare's AI for message conversion, R2 for asset storage, and Asset binding.

### AI Binding

The AI binding is defined in the `wrangler.toml` file. In the application, the `/api/ai` endpoint uses a text-to-text LLM (Large Language Model) to convert mean messages into polite corporate responses.

The endpoint receives a message and uses it as a prompt for the LLM with specific instructions to reformulate the message in a professional corporate tone:

```typescript
app.post("/api/ai", async (c) => {
  const { message } = await c.req.json();
  const messages = [
    { 
      role: "system", 
      content: "You are a corporate communications specialist. Your job is to take rude, mean, or angry messages and convert them into polite, professional corporate responses. Maintain a formal, positive tone while addressing the core concern from the original message. Keep responses concise and professional." 
    },
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
```
Cloudflare provides a [variety of models](https://developers.cloudflare.com/workers-ai/models/) that you can use with the AI binding.

### Asset Binding

The asset binding and entry point are defined in the `wrangler.toml`:

```
[assets]
directory = "public"
```
An `index.html` file in the `public` folder is served when the application starts.


### R2 Bucket
The R2 bucket provides object storage. When running Cloudflare locally, the bucket is simulated on your machine.

To deploy the project, you'll need to enable billing in your Cloudflare account and ensure the bucket exists on the Cloudflare network. You can create a bucket by running:

```
npx wrangler r2 bucket create <YOUR_BUCKET_NAME>
```

### Getting started

Make sure you have Neon set up and configured with your database. Create a .dev.vars file with the `DATABASE_URL` key and value (see: `.dev.vars.example`).

### Project structure

```#
├── src
│   ├── index.ts # Hono app entry point
│   └── db
│       └── schema.ts # Database schema
├── seed.ts # Optional seeding script
├── .dev.vars.example # Example .dev.vars file
├── wrangler.toml # Cloudflare Workers configuration
├── drizzle.config.ts # Drizzle configuration
├── tsconfig.json # TypeScript configuration
└── package.json
```

### Commands

Run the migrations and (optionally) seed the database:

```sh
# this is a convenience script that runs db:generate, db:migrate, and db:seed
npm run db:setup
```

Run the development server:

```sh
npm run dev
```

### Developing

When you iterate on the database schema, you'll need to generate a new migration and apply it:

```sh
npm run db:generate
npm run db:migrate
```

### Deploying

Set your `DATABASE_URL` secret (and any other secrets you need) with wrangler:

```sh
npx wrangler secret put DATABASE_URL
```

Finally, change the name of the project in `wrangler.toml` to something appropriate for your project

```toml
name = "my-neon-project"
```

Deploy with wrangler:

```sh
npm run deploy
```