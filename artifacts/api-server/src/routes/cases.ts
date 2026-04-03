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
    const tone = req.body?.tone || "formal";
    const [caseRecord] = await db.select().from(casesTable).where(and(eq(casesTable.id, caseId), eq(casesTable.userId, req.userId)));
    if (!caseRecord) {
      return res.status(404).json({ error: "Case not found." });
    }

    const { openai } = await import("@workspace/integrations-openai-ai-server");

    const toneInstructions: Record<string, string> = {
      formal: "Write in a neutral, professional tone. State facts plainly without emotional language. Be businesslike and straightforward.",
      firm: "Write in an assertive, deadline-focused tone. Emphasize the legal basis for the claim and consequences of non-payment. Be direct and authoritative.",
      friendly: "Write in a cooperative tone that prefers settlement over court. Be polite but clear about expectations. Express hope for amicable resolution.",
    };

    const today = new Date();
    const deadlineDate = new Date(today);
    deadlineDate.setDate(deadlineDate.getDate() + 14);

    const systemPrompt = `You are a legal document writer specializing in California Small Claims Court demand letters. Generate a professional pre-litigation demand letter.

TONE INSTRUCTIONS: ${toneInstructions[tone] || toneInstructions.formal}

FORMATTING RULES:
- Start with the plaintiff's full name, address, city/state/zip, and phone on separate lines
- Then today's date on its own line
- Then the defendant's name and address block
- Use "RE:" line with claim type and amount
- Address the defendant formally (Mr./Ms. last name or full name)
- Include specific facts from the case
- State the exact amount demanded with supporting details
- Include a payment deadline (14 calendar days from today's date: ${deadlineDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })})
- Mention intent to file in Small Claims Court if not resolved
- Close with plaintiff's signature block
- Use plain text formatting only, no markdown, no bold, no headers
- The letter should read as a real, mail-ready document`;

    const userPrompt = `Generate a demand letter with the following case details:

PLAINTIFF:
- Name: ${caseRecord.plaintiffName || "[Plaintiff Name]"}
- Address: ${caseRecord.plaintiffAddress || "[Address]"}
- City/State/Zip: ${caseRecord.plaintiffCity || "[City]"}, ${caseRecord.plaintiffState || "CA"} ${caseRecord.plaintiffZip || "[Zip]"}
- Phone: ${caseRecord.plaintiffPhone || "[Phone]"}

DEFENDANT:
- Name: ${caseRecord.defendantName || "[Defendant Name]"}
- Address: ${caseRecord.defendantAddress || "[Address]"}
- City/State/Zip: ${caseRecord.defendantCity || "[City]"}, ${caseRecord.defendantState || "CA"} ${caseRecord.defendantZip || "[Zip]"}

CLAIM DETAILS:
- Type: ${caseRecord.claimType || "General Claim"}
- Amount: $${caseRecord.amountClaimed || "0"}
- Description: ${caseRecord.claimDescription || "[No description provided]"}
- How Amount Calculated: ${caseRecord.howAmountCalculated || "[Not specified]"}
- Incident Date: ${caseRecord.incidentDateStart || "[Not specified]"}${caseRecord.incidentDateEnd ? ` to ${caseRecord.incidentDateEnd}` : ""}
- Prior Demand Made: ${caseRecord.demandMade ? "Yes" : "No"}
- Demand Details: ${caseRecord.demandDescription || "N/A"}

Today's Date: ${today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: 4096,
    });

    const letter = response.choices[0]?.message?.content || "Failed to generate letter. Please try again.";

    await db.update(casesTable)
      .set({ demandLetter: letter, updatedAt: new Date() })
      .where(and(eq(casesTable.id, caseId), eq(casesTable.userId, req.userId)));

    res.json({ demandLetter: letter });
  } catch (err: any) {
    console.error("Demand letter error:", err?.message || err);
    res.status(500).json({ error: "Failed to generate demand letter" });
  }
});

export default router;
