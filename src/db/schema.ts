import { mysqlTable, varchar, text, json, timestamp } from 'drizzle-orm/mysql-core';

export const biodatas = mysqlTable('biodatas', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  photo: text('photo'), // Store base64 encoded photo
  titleObjective: varchar('title_objective', { length: 255 }).default('About the Groom'),
  objectiveContent: text('objective_content'),
  theme: varchar('theme', { length: 50 }).default('maroon'),
  sections: json('sections').$type<any[]>(), // Store section list (dynamic structure)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
