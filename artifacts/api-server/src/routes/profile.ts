import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, coupleProfileTable } from "@workspace/db";
import {
  GetProfileResponse,
  UpdateProfileBody,
  UpdateProfileResponse,
  UpdateStatusParams,
  UpdateStatusBody,
  UpdateStatusResponse,
} from "@workspace/api-zod";
import { serializeRow } from "../lib/serialize";

const router: IRouter = Router();

async function ensureProfile(coupleCode: string) {
  const [existing] = await db
    .select()
    .from(coupleProfileTable)
    .where(eq(coupleProfileTable.coupleCode, coupleCode))
    .limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(coupleProfileTable)
    .values({ coupleCode, partner1Name: "Partner 1", partner2Name: "Partner 2", partner1Status: "", partner2Status: "" })
    .returning();
  return created;
}

router.get("/profile", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const profile = await ensureProfile(coupleCode);
  res.json(GetProfileResponse.parse(serializeRow(profile)));
});

router.patch("/profile", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const profile = await ensureProfile(coupleCode);
  const [updated] = await db
    .update(coupleProfileTable)
    .set(parsed.data)
    .where(and(eq(coupleProfileTable.id, profile.id), eq(coupleProfileTable.coupleCode, coupleCode)))
    .returning();
  res.json(UpdateProfileResponse.parse(serializeRow(updated)));
});

router.patch("/profile/status/:person", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const params = UpdateStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateStatusBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const profile = await ensureProfile(coupleCode);
  const { person } = params.data;
  const { status, emoji } = body.data;
  const updateData: Record<string, string | undefined> =
    person === "partner1"
      ? { partner1Status: status, ...(emoji != null ? { partner1Emoji: emoji } : {}) }
      : { partner2Status: status, ...(emoji != null ? { partner2Emoji: emoji } : {}) };

  const [updated] = await db
    .update(coupleProfileTable)
    .set(updateData)
    .where(and(eq(coupleProfileTable.id, profile.id), eq(coupleProfileTable.coupleCode, coupleCode)))
    .returning();
  res.json(UpdateStatusResponse.parse(serializeRow(updated)));
});

export default router;
