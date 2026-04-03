import { Router } from "express";
import { db } from "@workspace/db";
import { casesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";
import { getCaseForUser } from "../lib/caseHelpers";

const router = Router();

router.get("/cases", requireAuth, async (req, res) => {
  try {
    const { userId } = req as AuthRequest;
    const cases = await db.select().from(casesTable).where(eq(casesTable.userId, userId)).orderBy(desc(casesTable.updatedAt));
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cases" });
  }
});

router.post("/cases", requireAuth, async (req, res) => {
  try {
    const { userId } = req as AuthRequest;
    const [newCase] = await db.insert(casesTable).values({
      userId,
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

router.get("/cases/:caseId", requireAuth, async (req, res) => {
  try {
    const { userId } = req as AuthRequest;
    const caseRecord = await getCaseForUser(parseInt(req.params.caseId), userId);
    if (!caseRecord) return res.status(404).json({ error: "Case not found." });
    res.json(caseRecord);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch case" });
  }
});

router.put("/cases/:caseId", requireAuth, async (req, res) => {
  try {
    const { userId } = req as AuthRequest;
    const { userId: _, id, createdAt, ...safeBody } = req.body;
    const [updated] = await db.update(casesTable)
      .set({ ...safeBody, updatedAt: new Date() })
      .where(eq(casesTable.id, parseInt(req.params.caseId)))
      .returning();
    if (!updated) return res.status(404).json({ error: "Case not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update case" });
  }
});

router.delete("/cases/:caseId", requireAuth, async (req, res) => {
  try {
    const { userId } = req as AuthRequest;
    const caseId = parseInt(req.params.caseId);
    const caseRecord = await getCaseForUser(caseId, userId);
    if (!caseRecord) return res.status(404).json({ error: "Case not found." });
    await db.delete(casesTable).where(eq(casesTable.id, caseId));
    res.json({ message: "Case deleted" });
  } catch (err) {
    res.status(500).json({ error: "Could not delete the case. Please try again." });
  }
});

router.put("/cases/:caseId/intake", requireAuth, async (req, res) => {
  try {
    const { userId } = req as AuthRequest;
    const caseId = parseInt(req.params.caseId);
    const caseRecord = await getCaseForUser(caseId, userId);
    if (!caseRecord) return res.status(404).json({ error: "Case not found." });
    const { userId: _, id, createdAt, ...safeBody } = req.body;
    const [updated] = await db.update(casesTable)
      .set({ ...safeBody, updatedAt: new Date() })
      .where(eq(casesTable.id, caseId))
      .returning();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Could not save progress" });
  }
});

router.post("/cases/:caseId/demand-letter", requireAuth, async (req, res) => {
  try {
    const { userId } = req as AuthRequest;
    const caseId = parseInt(req.params.caseId);
    const tone = req.body?.tone || "formal";
    const c = await getCaseForUser(caseId, userId);
    if (!c) return res.status(404).json({ error: "Case not found." });

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
- Name: ${c.plaintiffName || "[Plaintiff Name]"}
- Address: ${c.plaintiffAddress || "[Address]"}
- City/State/Zip: ${c.plaintiffCity || "[City]"}, ${c.plaintiffState || "CA"} ${c.plaintiffZip || "[Zip]"}
- Phone: ${c.plaintiffPhone || "[Phone]"}

DEFENDANT:
- Name: ${c.defendantName || "[Defendant Name]"}
- Address: ${c.defendantAddress || "[Address]"}
- City/State/Zip: ${c.defendantCity || "[City]"}, ${c.defendantState || "CA"} ${c.defendantZip || "[Zip]"}

CLAIM DETAILS:
- Type: ${c.claimType || "General Claim"}
- Amount: $${c.amountClaimed || "0"}
- Description: ${c.claimDescription || "[No description provided]"}
- How Amount Calculated: ${c.howAmountCalculated || "[Not specified]"}
- Incident Date: ${c.incidentDateStart || "[Not specified]"}${c.incidentDateEnd ? ` to ${c.incidentDateEnd}` : ""}
- Prior Demand Made: ${c.demandMade ? "Yes" : "No"}
- Demand Details: ${c.demandDescription || "N/A"}

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
      .where(eq(casesTable.id, caseId));

    res.json({ demandLetter: letter });
  } catch (err: any) {
    console.error("Demand letter error:", err?.message || err);
    res.status(500).json({ error: "Failed to generate demand letter" });
  }
});

export default router;
