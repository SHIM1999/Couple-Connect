import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
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

async function ensureProfile() {
  const [existing] = await db.select().from(coupleProfileTable).limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(coupleProfileTable)
    .values({ partner1Name: "Partner 1", partner2Name: "Partner 2", partner1Status: "", partner2Status: "" })
    .returning();
  return created;
}

router.get("/profile", async (req, res): Promise<void> => {
  const profile = await ensureProfile();
  res.json(GetProfileResponse.parse(serializeRow(profile)));
});

router.patch("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const profile = await ensureProfile();
  const [updated] = await db
    .update(coupleProfileTable)
    .set(parsed.data)
    .where(eq(coupleProfileTable.id, profile.id))
    .returning();
  res.json(UpdateProfileResponse.parse(serializeRow(updated)));
});

router.patch("/profile/status/:person", async (req, res): Promise<void> => {
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
  const profile = await ensureProfile();
  const { person } = params.data;
  const { status, emoji } = body.data;
  const updateData: Record<string, string | undefined> =
    person === "partner1"
      ? { partner1Status: status, ...(emoji != null ? { partner1Emoji: emoji } : {}) }
      : { partner2Status: status, ...(emoji != null ? { partner2Emoji: emoji } : {}) };

  const [updated] = await db
    .update(coupleProfileTable)
    .set(updateData)
    .where(eq(coupleProfileTable.id, profile.id))
    .returning();
  res.json(UpdateStatusResponse.parse(serializeRow(updated)));
});

export default router;
