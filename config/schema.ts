import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  subscription: varchar(),
  role: varchar({ length: 20 }).notNull().default("student"),
  status: varchar({ length: 20 }).notNull().default("active"),
  avatarUrl: varchar({ length: 500 }),
  bio: text(),
  notifyCourseUpdates: boolean().notNull().default(true),
  notifyCommunityReplies: boolean().notNull().default(true),
  notifyWeeklyDigest: boolean().notNull().default(false),
  notifyProductAnnouncements: boolean().notNull().default(false),
});

export const coursesTable = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar({ length: 255 }).notNull().unique(),
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  thumbnailUrl: varchar({ length: 500 }),
  price: numeric({ precision: 10, scale: 2 }),
  originalPrice: numeric({ precision: 10, scale: 2 }),
  category: varchar({ length: 100 }),
  level: varchar({ length: 50 }),
  instructorId: integer()
    .notNull()
    .references(() => usersTable.id),
  published: boolean().notNull().default(false),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const modulesTable = pgTable("modules", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  courseId: integer()
    .notNull()
    .references(() => coursesTable.id),
  title: varchar({ length: 255 }).notNull(),
  order: integer().notNull().default(0),
});

export const lessonsTable = pgTable("lessons", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  moduleId: integer()
    .notNull()
    .references(() => modulesTable.id),
  title: varchar({ length: 255 }).notNull(),
  videoAssetId: varchar({ length: 255 }),
  youtubeUrl: varchar({ length: 500 }),
  content: text(),
  duration: integer(),
  order: integer().notNull().default(0),
});

export const enrollmentsTable = pgTable("enrollments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id),
  courseId: integer()
    .notNull()
    .references(() => coursesTable.id),
  status: varchar({ length: 20 }).notNull().default("pending"),
  paymentRef: varchar({ length: 255 }),
  enrolledAt: timestamp().notNull().defaultNow(),
});

export const progressTable = pgTable("progress", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id),
  lessonId: integer()
    .notNull()
    .references(() => lessonsTable.id),
  completed: boolean().notNull().default(false),
  completedAt: timestamp(),
  lastPositionSeconds: integer(),
});

export const certificatesTable = pgTable("certificates", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id),
  courseId: integer()
    .notNull()
    .references(() => coursesTable.id),
  issuedAt: timestamp().notNull().defaultNow(),
  certificateUrl: varchar({ length: 500 }),
});

export const threadsTable = pgTable("threads", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  authorId: integer()
    .notNull()
    .references(() => usersTable.id),
  courseId: integer().references(() => coursesTable.id),
  tag: varchar({ length: 100 }),
  title: varchar({ length: 255 }).notNull(),
  body: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const repliesTable = pgTable("replies", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  threadId: integer()
    .notNull()
    .references(() => threadsTable.id),
  authorId: integer()
    .notNull()
    .references(() => usersTable.id),
  body: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const resourcesTable = pgTable("resources", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  courseId: integer().references(() => coursesTable.id),
  title: varchar({ length: 255 }).notNull(),
  fileUrl: varchar({ length: 500 }).notNull(),
  fileType: varchar({ length: 100 }),
  uploadedBy: integer()
    .notNull()
    .references(() => usersTable.id),
  createdAt: timestamp().notNull().defaultNow(),
});

export const notificationsTable = pgTable("notifications", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id),
  type: varchar({ length: 50 }).notNull(),
  title: varchar({ length: 255 }).notNull(),
  body: text(),
  read: boolean().notNull().default(false),
  createdAt: timestamp().notNull().defaultNow(),
});
