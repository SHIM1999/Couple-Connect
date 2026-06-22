import { Router, type IRouter } from "express";
import { db, todosTable, goalsTable, wishlistTable, bucketlistTable, eventsTable } from "@workspace/db";
import { GetSummaryResponse } from "@workspace/api-zod";
import { count, eq, gte, and } from "drizzle-orm";
import { serializeRows } from "../lib/serialize";

const router: IRouter = Router();

router.get("/summary", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const today = new Date().toISOString().split("T")[0];

  const [
    [{ todoCount }],
    [{ todoDoneCount }],
    [{ goalCount }],
    [{ goalDoneCount }],
    [{ wishlistCount }],
    [{ bucketCount }],
    [{ bucketDoneCount }],
    upcomingEvents,
  ] = await Promise.all([
    db.select({ todoCount: count() }).from(todosTable).where(eq(todosTable.coupleCode, coupleCode)),
    db.select({ todoDoneCount: count() }).from(todosTable).where(and(eq(todosTable.coupleCode, coupleCode), eq(todosTable.completed, true))),
    db.select({ goalCount: count() }).from(goalsTable).where(eq(goalsTable.coupleCode, coupleCode)),
    db.select({ goalDoneCount: count() }).from(goalsTable).where(and(eq(goalsTable.coupleCode, coupleCode), eq(goalsTable.completed, true))),
    db.select({ wishlistCount: count() }).from(wishlistTable).where(eq(wishlistTable.coupleCode, coupleCode)),
    db.select({ bucketCount: count() }).from(bucketlistTable).where(eq(bucketlistTable.coupleCode, coupleCode)),
    db.select({ bucketDoneCount: count() }).from(bucketlistTable).where(and(eq(bucketlistTable.coupleCode, coupleCode), eq(bucketlistTable.completed, true))),
    db.select().from(eventsTable).where(and(eq(eventsTable.coupleCode, coupleCode), gte(eventsTable.date, today!))).orderBy(eventsTable.date).limit(5),
  ]);

  res.json(
    GetSummaryResponse.parse({
      todoCount: Number(todoCount),
      todoDoneCount: Number(todoDoneCount),
      goalCount: Number(goalCount),
      goalDoneCount: Number(goalDoneCount),
      wishlistCount: Number(wishlistCount),
      bucketCount: Number(bucketCount),
      bucketDoneCount: Number(bucketDoneCount),
      upcomingEvents: serializeRows(upcomingEvents),
    })
  );
});

export default router;
