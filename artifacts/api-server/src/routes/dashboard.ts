import { Router } from "express";
import { db } from "@workspace/db";
import { casesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const { userId } = req as AuthRequest;
    const allCases = await db.select().from(casesTable).where(eq(casesTable.userId, userId)).orderBy(desc(casesTable.updatedAt));
    const totalCases = allCases.length;
    const completedIntakes = allCases.filter(c => c.intakeComplete).length;
    const pendingIntakes = totalCases - completedIntakes;
    const recentCases = allCases.slice(0, 5);
    res.json({ totalCases, completedIntakes, pendingIntakes, recentCases });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

export default router;
