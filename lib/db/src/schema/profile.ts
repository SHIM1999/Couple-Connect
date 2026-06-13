import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const coupleProfileTable = pgTable("couple_profile", {
  id: serial("id").primaryKey(),
  partner1Name: text("partner1_name").notNull().default("Partner 1"),
  partner2Name: text("partner2_name").notNull().default("Partner 2"),
  partner1Status: text("partner1_status").notNull().default(""),
  partner2Status: text("partner2_status").notNull().default(""),
  partner1Emoji: text("partner1_emoji"),
  partner2Emoji: text("partner2_emoji"),
  anniversaryDate: text("anniversary_date"),
  coupleTitle: text("couple_title"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCoupleProfileSchema = createInsertSchema(coupleProfileTable).omit({ id: true, createdAt: true });
export type InsertCoupleProfile = z.infer<typeof insertCoupleProfileSchema>;
export type CoupleProfile = typeof coupleProfileTable.$inferSelect;
