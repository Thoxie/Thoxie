import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { casesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = userId;
  next();
};

router.get("/dashboard", requireAuth, async (req: any, res) => {
  try {
    const allCases = await db.select().from(casesTable).where(eq(casesTable.userId, req.userId)).orderBy(desc(casesTable.updatedAt));
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
