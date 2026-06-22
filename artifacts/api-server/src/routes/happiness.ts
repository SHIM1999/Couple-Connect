import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, coupleProfileTable } from "@workspace/db";
import { serializeRow } from "../lib/serialize";

const router: IRouter = Router();

function computeCurrentValue(storedValue: number, pressedAt: Date | null): number {
  if (!pressedAt) return 0;
  const now = new Date();
  const pressDate = new Date(pressedAt);

  const todayMidnight = new Date(now);
  todayMidnight.setHours(23, 59, 59, 999);

  const pressMidnight = new Date(pressDate);
  pressMidnight.setHours(23, 59, 59, 999);

  if (pressMidnight.toDateString() !== todayMidnight.toDateString()) return 0;

  const secsFromPressToMidnight = (todayMidnight.getTime() - pressDate.getTime()) / 1000;
  const secsFromNowToMidnight = (todayMidnight.getTime() - now.getTime()) / 1000;

  if (secsFromPressToMidnight <= 0) return 0;
  return Math.round(storedValue * (secsFromNowToMidnight / secsFromPressToMidnight));
}

router.post("/happiness/press/:person", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const { person } = req.params;
  if (person !== "partner1" && person !== "partner2") {
    res.status(400).json({ error: "person must be partner1 or partner2" });
    return;
  }

  const [profile] = await db.select().from(coupleProfileTable)
    .where(eq(coupleProfileTable.coupleCode, coupleCode)).limit(1);
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  const storedValue = person === "partner1" ? profile.partner1HappinessValue : profile.partner2HappinessValue;
  const pressedAt = person === "partner1" ? profile.partner1HappinessPressedAt : profile.partner2HappinessPressedAt;

  const current = computeCurrentValue(storedValue, pressedAt);
  const newValue = Math.min(100, current + 34);
  const now = new Date();

  const updateData =
    person === "partner1"
      ? { partner1HappinessValue: newValue, partner1HappinessPressedAt: now }
      : { partner2HappinessValue: newValue, partner2HappinessPressedAt: now };

  const [updated] = await db
    .update(coupleProfileTable)
    .set(updateData)
    .where(eq(coupleProfileTable.id, profile.id))
    .returning();

  res.json(serializeRow(updated));
});

router.get("/happiness", async (req, res): Promise<void> => {
  const coupleCode = res.locals.coupleCode as string;
  const [profile] = await db.select().from(coupleProfileTable)
    .where(eq(coupleProfileTable.coupleCode, coupleCode)).limit(1);
  if (!profile) {
    res.json({ partner1: 0, partner2: 0 });
    return;
  }
  res.json({
    partner1: computeCurrentValue(profile.partner1HappinessValue, profile.partner1HappinessPressedAt),
    partner2: computeCurrentValue(profile.partner2HappinessValue, profile.partner2HappinessPressedAt),
  });
});

export default router;
