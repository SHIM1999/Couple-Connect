import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, goalsTable } from "@workspace/db";
import {
  ListGoalsResponse,
  CreateGoalBody,
  UpdateGoalParams,
  UpdateGoalBody,
  UpdateGoalResponse,
  DeleteGoalParams,
} from "@workspace/api-zod";
import { serializeRow, serializeRows } from "../lib/serialize";

const router: IRouter = Router();

router.get("/goals", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const goals = await db.select().from(goalsTable)
    .where(eq(goalsTable.coupleCode, coupleCode))
    .orderBy(goalsTable.createdAt);
  res.json(ListGoalsResponse.parse(serializeRows(goals)));
});

router.post("/goals", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const parsed = CreateGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [goal] = await db.insert(goalsTable).values({ ...parsed.data, coupleCode }).returning();
  res.status(201).json(serializeRow(goal));
});

router.patch("/goals/:id", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const params = UpdateGoalParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [goal] = await db
    .update(goalsTable)
    .set(parsed.data)
    .where(and(eq(goalsTable.id, params.data.id), eq(goalsTable.coupleCode, coupleCode)))
    .returning();
  if (!goal) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }
  res.json(UpdateGoalResponse.parse(serializeRow(goal)));
});

router.delete("/goals/:id", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const params = DeleteGoalParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [goal] = await db.delete(goalsTable)
    .where(and(eq(goalsTable.id, params.data.id), eq(goalsTable.coupleCode, coupleCode)))
    .returning();
  if (!goal) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
