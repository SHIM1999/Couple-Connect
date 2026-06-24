import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wishlistTable = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  coupleCode: text("couple_code").notNull().default("default"),
  title: text("title").notNull(),
  note: text("note"),
  link: text("link"),
  color: text("color"),
  addedBy: text("added_by"),
  purchased: boolean("purchased").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWishItemSchema = createInsertSchema(wishlistTable).omit({ id: true, createdAt: true });
export type InsertWishItem = z.infer<typeof insertWishItemSchema>;
export type WishItem = typeof wishlistTable.$inferSelect;
