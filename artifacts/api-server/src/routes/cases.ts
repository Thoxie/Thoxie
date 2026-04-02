import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { casesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

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

router.get("/cases", requireAuth, async (req: any, res) => {
  try {
    const cases = await db.select().from(casesTable).where(eq(casesTable.userId, req.userId)).orderBy(desc(casesTable.updatedAt));
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cases" });
  }
});

router.post("/cases", requireAuth, async (req: any, res) => {
  try {
    const [newCase] = await db.insert(casesTable).values({
      userId: req.userId,
      plaintiffName: req.body.plaintiffName || "",
      claimDescription: req.body.claimDescription || "",
      claimType: req.body.claimType || "",
      county: req.body.county || "",
    }).returning();
    res.status(201).json(newCase);
  } catch (err) {
    res.status(500).json({ error: "Could not create your case" });
  }
});

router.get("/cases/:caseId", requireAuth, async (req: any, res) => {
  try {
    const caseId = parseInt(req.params.caseId);
    const [caseRecord] = await db.select().from(casesTable).where(and(eq(casesTable.id, caseId), eq(casesTable.userId, req.userId)));
    if (!caseRecord) {
      return res.status(404).json({ error: "Case not found." });
    }
    res.json(caseRecord);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch case" });
  }
});

router.put("/cases/:caseId", requireAuth, async (req: any, res) => {
  try {
    const caseId = parseInt(req.params.caseId);
    const { userId, id, createdAt, ...safeBody } = req.body;
    const [updated] = await db.update(casesTable)
      .set({ ...safeBody, updatedAt: new Date() })
      .where(and(eq(casesTable.id, caseId), eq(casesTable.userId, req.userId)))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: "Case not found." });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update case" });
  }
});

router.delete("/cases/:caseId", requireAuth, async (req: any, res) => {
  try {
    const caseId = parseInt(req.params.caseId);
    const [deleted] = await db.delete(casesTable)
      .where(and(eq(casesTable.id, caseId), eq(casesTable.userId, req.userId)))
      .returning();
    if (!deleted) {
      return res.status(404).json({ error: "Case not found." });
    }
    res.json({ message: "Case deleted" });
  } catch (err) {
    res.status(500).json({ error: "Could not delete the case. Please try again." });
  }
});

router.put("/cases/:caseId/intake", requireAuth, async (req: any, res) => {
  try {
    const caseId = parseInt(req.params.caseId);
    const { userId, id, createdAt, ...safeBody } = req.body;
    const [updated] = await db.update(casesTable)
      .set({ ...safeBody, updatedAt: new Date() })
      .where(and(eq(casesTable.id, caseId), eq(casesTable.userId, req.userId)))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: "Case not found." });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Could not save progress" });
  }
});

router.post("/cases/:caseId/demand-letter", requireAuth, async (req: any, res) => {
  try {
    const caseId = parseInt(req.params.caseId);
    const [caseRecord] = await db.select().from(casesTable).where(and(eq(casesTable.id, caseId), eq(casesTable.userId, req.userId)));
    if (!caseRecord) {
      return res.status(404).json({ error: "Case not found." });
    }

    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const letter = `${today}

${caseRecord.defendantName || "[Defendant Name]"}
${caseRecord.defendantAddress || "[Defendant Address]"}
${caseRecord.defendantCity || "[City]"}, ${caseRecord.defendantState || "CA"} ${caseRecord.defendantZip || "[Zip]"}

RE: Demand for Payment — ${caseRecord.claimType || "General Claim"}

Dear ${caseRecord.defendantName || "[Defendant Name]"},

I am writing to formally demand payment in the amount of $${caseRecord.amountClaimed || "[Amount]"} for the following matter:

${caseRecord.claimDescription || "[Description of claim]"}

This amount was calculated as follows:
${caseRecord.howAmountCalculated || "[Calculation details]"}

I have attempted to resolve this matter informally, but have been unable to reach a satisfactory resolution. If I do not receive payment within 30 days of the date of this letter, I intend to file a claim in California Small Claims Court.

Please make payment to:
${caseRecord.plaintiffName || "[Your Name]"}
${caseRecord.plaintiffAddress || "[Your Address]"}
${caseRecord.plaintiffCity || "[City]"}, ${caseRecord.plaintiffState || "CA"} ${caseRecord.plaintiffZip || "[Zip]"}

I hope we can resolve this matter without the need for court proceedings.

Sincerely,

${caseRecord.plaintiffName || "[Your Name]"}
${caseRecord.plaintiffPhone || "[Phone]"}
${caseRecord.plaintiffEmail || "[Email]"}`;

    const [updated] = await db.update(casesTable)
      .set({ demandLetter: letter, updatedAt: new Date() })
      .where(and(eq(casesTable.id, caseId), eq(casesTable.userId, req.userId)))
      .returning();

    res.json({ demandLetter: letter });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate demand letter" });
  }
});

export default router;
