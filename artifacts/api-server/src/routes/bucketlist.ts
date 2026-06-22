import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, bucketlistTable } from "@workspace/db";
import {
  ListBucketListResponse,
  CreateBucketItemBody,
  UpdateBucketItemParams,
  UpdateBucketItemBody,
  UpdateBucketItemResponse,
  DeleteBucketItemParams,
} from "@workspace/api-zod";
import { serializeRow, serializeRows } from "../lib/serialize";

const router: IRouter = Router();

router.get("/bucketlist", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const items = await db.select().from(bucketlistTable)
    .where(eq(bucketlistTable.coupleCode, coupleCode))
    .orderBy(bucketlistTable.createdAt);
  res.json(ListBucketListResponse.parse(serializeRows(items)));
});

router.post("/bucketlist", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const parsed = CreateBucketItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(bucketlistTable).values({ ...parsed.data, coupleCode }).returning();
  res.status(201).json(serializeRow(item));
});

router.patch("/bucketlist/:id", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const params = UpdateBucketItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateBucketItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db
    .update(bucketlistTable)
    .set(parsed.data)
    .where(and(eq(bucketlistTable.id, params.data.id), eq(bucketlistTable.coupleCode, coupleCode)))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Bucket item not found" });
    return;
  }
  res.json(UpdateBucketItemResponse.parse(serializeRow(item)));
});

router.delete("/bucketlist/:id", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const params = DeleteBucketItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db.delete(bucketlistTable)
    .where(and(eq(bucketlistTable.id, params.data.id), eq(bucketlistTable.coupleCode, coupleCode)))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Bucket item not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
