import { mysqlTable, varchar, text, json, timestamp, mediumtext } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  resetToken: varchar('reset_token', { length: 255 }),
  resetTokenExpires: timestamp('reset_token_expires'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const biodatas = mysqlTable('biodatas', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  photo: mediumtext('photo'), // Store large base64 encoded photo
  titleObjective: varchar('title_objective', { length: 255 }).default('About the Groom'),
  objectiveContent: text('objective_content'),
  theme: varchar('theme', { length: 50 }).default('maroon'),
  sections: json('sections').$type<any[]>(), // Store section list (dynamic structure)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
