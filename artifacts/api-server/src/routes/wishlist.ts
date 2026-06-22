import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
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
  const coupleCode = res.locals.coupleCode as string;
  const items = await db.select().from(wishlistTable)
    .where(eq(wishlistTable.coupleCode, coupleCode))
    .orderBy(wishlistTable.createdAt);
  res.json(ListWishlistResponse.parse(serializeRows(items)));
});

router.post("/wishlist", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const parsed = CreateWishItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(wishlistTable).values({ ...parsed.data, coupleCode }).returning();
  res.status(201).json(serializeRow(item));
});

router.patch("/wishlist/:id", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
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
    .where(and(eq(wishlistTable.id, params.data.id), eq(wishlistTable.coupleCode, coupleCode)))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Wish item not found" });
    return;
  }
  res.json(UpdateWishItemResponse.parse(serializeRow(item)));
});

router.delete("/wishlist/:id", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const params = DeleteWishItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db.delete(wishlistTable)
    .where(and(eq(wishlistTable.id, params.data.id), eq(wishlistTable.coupleCode, coupleCode)))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Wish item not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
