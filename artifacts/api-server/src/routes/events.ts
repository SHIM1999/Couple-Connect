import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, eventsTable } from "@workspace/db";
import {
  ListEventsQueryParams,
  ListEventsResponse,
  CreateEventBody,
  UpdateEventParams,
  UpdateEventBody,
  UpdateEventResponse,
  DeleteEventParams,
} from "@workspace/api-zod";
import { serializeRow, serializeRows } from "../lib/serialize";

const router: IRouter = Router();

router.get("/events", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  ListEventsQueryParams.safeParse(req.query);
  const events = await db.select().from(eventsTable)
    .where(eq(eventsTable.coupleCode, coupleCode))
    .orderBy(eventsTable.date);
  res.json(ListEventsResponse.parse(serializeRows(events)));
});

router.post("/events", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [event] = await db.insert(eventsTable).values({ ...parsed.data, coupleCode }).returning();
  res.status(201).json(serializeRow(event));
});

router.patch("/events/:id", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const params = UpdateEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [event] = await db
    .update(eventsTable)
    .set(parsed.data)
    .where(and(eq(eventsTable.id, params.data.id), eq(eventsTable.coupleCode, coupleCode)))
    .returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(UpdateEventResponse.parse(serializeRow(event)));
});

router.delete("/events/:id", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const params = DeleteEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [event] = await db.delete(eventsTable)
    .where(and(eq(eventsTable.id, params.data.id), eq(eventsTable.coupleCode, coupleCode)))
    .returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
