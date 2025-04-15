import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export type NewUser = typeof users.$inferInsert;

export const users = pgTable('users', {
  id: serial('id').primaryKey(), // This ensures auto-incrementing IDs
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  thumbnail: text('thumbnail')
});
