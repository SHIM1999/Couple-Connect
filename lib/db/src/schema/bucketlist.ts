import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bucketlistTable = pgTable("bucketlist", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  note: text("note"),
  targetDate: text("target_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBucketItemSchema = createInsertSchema(bucketlistTable).omit({ id: true, createdAt: true });
export type InsertBucketItem = z.infer<typeof insertBucketItemSchema>;
export type BucketItem = typeof bucketlistTable.$inferSelect;
