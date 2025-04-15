import { createFiberplane, createOpenAPISpec } from '@fiberplane/hono';
import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import * as schema from './db/schema';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>()
  .basePath('/api')
  .get('/', (c) => {
    return c.text('Honc from above! ☁️🪿');
  })
  .get('/users', async (c) => {
    const db = drizzle(c.env.DB);
    const users = await db.select().from(schema.users);
    return c.json({ users });
  })
  .post('/users', async (c) => {
    const db = drizzle(c.env.DB);
    const { name, email } = await c.req.json();

    const [newUser] = await db
      .insert(schema.users)
      .values({
        name: name,
        email: email,
      })
      .returning();

    return c.json(newUser);
  });

export type AppType = typeof app;

app
  .get('/openapi.json', (c) => {
    return c.json(
      createOpenAPISpec(app, {
        info: {
          title: 'Honc D1 App',
          version: '1.0.0',
        },
      }),
    );
  })
  .use(
    '/fp/*',
    createFiberplane({
      app,
      openapi: { url: '/openapi.json' },
    }),
  );

export default app;
