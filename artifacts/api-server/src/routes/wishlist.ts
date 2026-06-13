import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, wishlistTable } from "@workspace/db";
import {
  ListWishlistResponse,
  CreateWishItemBody,
  UpdateWishItemParams,
  UpdateWishItemBody,
  UpdateWishItemResponse,
  DeleteWishItemParams,
} from "@workspace/api-zod";
import { serializeRow, serializeRows } from "../lib/serialize";

const router: IRouter = Router();

router.get("/wishlist", async (req, res): Promise<void> => {
  const items = await db.select().from(wishlistTable).orderBy(wishlistTable.createdAt);
  res.json(ListWishlistResponse.parse(serializeRows(items)));
});

router.post("/wishlist", async (req, res): Promise<void> => {
  const parsed = CreateWishItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(wishlistTable).values(parsed.data).returning();
  res.status(201).json(serializeRow(item));
});

router.patch("/wishlist/:id", async (req, res): Promise<void> => {
  const params = UpdateWishItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateWishItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db
    .update(wishlistTable)
    .set(parsed.data)
    .where(eq(wishlistTable.id, params.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Wish item not found" });
    return;
  }
  res.json(UpdateWishItemResponse.parse(serializeRow(item)));
});

router.delete("/wishlist/:id", async (req, res): Promise<void> => {
  const params = DeleteWishItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db.delete(wishlistTable).where(eq(wishlistTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Wish item not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
