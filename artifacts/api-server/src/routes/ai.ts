import { Router } from "express";
import { getAuth } from "@clerk/express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { db } from "@workspace/db";
import { casesTable, documentsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

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

router.post("/ai/ask", requireAuth, async (req: any, res) => {
  try {
    const { question, caseId } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    let caseContext = "";
    let documentContext = "";

    if (caseId) {
      const [caseRecord] = await db.select().from(casesTable)
        .where(and(eq(casesTable.id, caseId), eq(casesTable.userId, req.userId)));

      if (caseRecord) {
        caseContext = `
CASE INFORMATION:
- Case Title: ${caseRecord.claimDescription || "N/A"}
- Plaintiff: ${caseRecord.plaintiffName || "N/A"}, ${caseRecord.plaintiffAddress || ""} ${caseRecord.plaintiffCity || ""}, ${caseRecord.plaintiffState || "CA"} ${caseRecord.plaintiffZip || ""}
- Plaintiff Phone: ${caseRecord.plaintiffPhone || "N/A"}
- Defendant: ${caseRecord.defendantName || "N/A"}, ${caseRecord.defendantAddress || ""} ${caseRecord.defendantCity || ""}, ${caseRecord.defendantState || "CA"} ${caseRecord.defendantZip || ""}
- Claim Type: ${caseRecord.claimType || "N/A"}
- Amount Claimed: $${caseRecord.amountClaimed || "N/A"}
- Incident Date: ${caseRecord.incidentDateStart || "N/A"}${caseRecord.incidentDateEnd ? ` to ${caseRecord.incidentDateEnd}` : ""}
- What Happened: ${caseRecord.claimDescription || "N/A"}
- How Amount Calculated: ${caseRecord.howAmountCalculated || "N/A"}
- Demand Made: ${caseRecord.demandMade ? "Yes" : "No"}
- Demand Description: ${caseRecord.demandDescription || "N/A"}
- County: ${caseRecord.county || "N/A"}
- Courthouse: ${caseRecord.courthouse || "N/A"}
- Venue Basis: ${caseRecord.venueBasis || "N/A"}
`;

        const docs = await db.select({
          fileName: documentsTable.fileName,
          textContent: documentsTable.textContent,
        }).from(documentsTable).where(eq(documentsTable.caseId, caseId));

        if (docs.length > 0) {
          const docTexts = docs
            .filter(d => d.textContent)
            .map(d => `--- Document: ${d.fileName} ---\n${d.textContent!.substring(0, 8000)}`)
            .join("\n\n");

          if (docTexts) {
            documentContext = `\nUPLOADED DOCUMENTS:\n${docTexts}\n`;
          }
        }
      }
    }

    const systemPrompt = `You are Small Claims Genie, an AI legal assistant specializing in California Small Claims Court. You help users understand court procedures, prepare their cases, analyze their documents, and provide guidance on small claims matters.

Important rules:
- You are NOT a lawyer and do not provide legal advice. You provide legal information and guidance.
- Always be helpful, clear, and specific to California small claims court (SC-100 process).
- When referencing case details or documents, cite specific information from the provided context.
- When analyzing documents, quote relevant passages and provide practical insights.
- Format responses clearly with bullet points and headers when helpful.
- Maximum small claims amount is $10,000 for individuals, $5,000 for businesses.
- Filing fees: $30 (claims ≤$1,500), $50 ($1,500.01-$5,000), $75 (>$5,000-$10,000).

${caseContext}${documentContext}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      max_completion_tokens: 8192,
    });

    const answer = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";
    res.json({ answer });
  } catch (err: any) {
    console.error("AI ask error:", err?.message || err);
    res.status(500).json({ error: "An unexpected error occurred. Please try again." });
  }
});

router.post("/ai/transcribe", requireAuth, async (req: any, res) => {
  try {
    const { audioData } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: "Audio data is required" });
    }

    const buffer = Buffer.from(audioData, "base64");
    const file = new File([buffer], "recording.webm", { type: "audio/webm" });

    const transcription = await openai.audio.transcriptions.create({
      model: "gpt-4o-mini-transcribe",
      file,
      response_format: "json",
    });

    res.json({ text: transcription.text || "" });
  } catch (err: any) {
    console.error("Transcription error:", err?.message || err);
    res.status(500).json({ error: "Failed to transcribe audio" });
  }
});

export default router;
