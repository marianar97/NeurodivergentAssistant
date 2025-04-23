import { pgTable, serial, text, varchar, timestamp } from 'drizzle-orm/pg-core';

export type NewUser = typeof users.$inferInsert;
export type NewMessage = typeof messages.$inferInsert;

export const users = pgTable('users', {
  id: serial('id').primaryKey(), // This ensures auto-incrementing IDs
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  thumbnail: text('thumbnail')
});

export const messages = pgTable('messages', {
  id: text('id').primaryKey(), // Using text-based ID instead of serial
  original_message: text('original_message').notNull(),
  transformed_message: text('transformed_message').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
});
