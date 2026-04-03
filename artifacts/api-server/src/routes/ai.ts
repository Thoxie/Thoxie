import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { db } from "@workspace/db";
import { documentsTable, documentChunksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";
import { getCaseForUser } from "../lib/caseHelpers";

const router = Router();

const MAX_DOC_CONTEXT = 30000;

function buildCaseContext(c: any): string {
  return `
CASE INFORMATION:
- Plaintiff: ${c.plaintiffName || "N/A"}, ${c.plaintiffAddress || ""} ${c.plaintiffCity || ""}, ${c.plaintiffState || "CA"} ${c.plaintiffZip || ""}
- Plaintiff Phone: ${c.plaintiffPhone || "N/A"}
- Defendant: ${c.defendantName || "N/A"}, ${c.defendantAddress || ""} ${c.defendantCity || ""}, ${c.defendantState || "CA"} ${c.defendantZip || ""}
- Claim Type: ${c.claimType || "N/A"}
- Amount Claimed: $${c.amountClaimed || "N/A"}
- Incident Date: ${c.incidentDateStart || "N/A"}${c.incidentDateEnd ? ` to ${c.incidentDateEnd}` : ""}
- What Happened: ${c.claimDescription || "N/A"}
- How Amount Calculated: ${c.howAmountCalculated || "N/A"}
- Demand Made: ${c.demandMade ? "Yes" : "No"}
- Demand Description: ${c.demandDescription || "N/A"}
- County: ${c.county || "N/A"}
- Courthouse: ${c.courthouse || "N/A"}
- Venue Basis: ${c.venueBasis || "N/A"}
`;
}

async function buildDocumentContext(caseId: number): Promise<string> {
  const chunks = await db.select({
    content: documentChunksTable.content,
    chunkIndex: documentChunksTable.chunkIndex,
    documentId: documentChunksTable.documentId,
  }).from(documentChunksTable).where(eq(documentChunksTable.caseId, caseId));

  const docs = await db.select({
    id: documentsTable.id,
    fileName: documentsTable.fileName,
    textContent: documentsTable.textContent,
  }).from(documentsTable).where(eq(documentsTable.caseId, caseId));

  if (docs.length === 0) return "";

  if (chunks.length > 0) {
    const docNameMap = new Map(docs.map(d => [d.id, d.fileName]));
    const grouped = new Map<number, { fileName: string; chunks: { index: number; content: string }[] }>();

    for (const chunk of chunks) {
      if (!grouped.has(chunk.documentId)) {
        grouped.set(chunk.documentId, { fileName: docNameMap.get(chunk.documentId) || "Unknown", chunks: [] });
      }
      grouped.get(chunk.documentId)!.chunks.push({ index: chunk.chunkIndex, content: chunk.content });
    }

    const docTexts: string[] = [];
    let totalLength = 0;

    for (const [, docGroup] of grouped) {
      docGroup.chunks.sort((a, b) => a.index - b.index);
      const fullText = docGroup.chunks.map(c => c.content).join(" ");
      const entry = `--- Document: ${docGroup.fileName} ---\n${fullText}`;

      if (totalLength + entry.length > MAX_DOC_CONTEXT) {
        const remaining = MAX_DOC_CONTEXT - totalLength;
        if (remaining > 500) {
          docTexts.push(`--- Document: ${docGroup.fileName} ---\n${fullText.substring(0, remaining)}... [truncated]`);
        }
        break;
      }
      docTexts.push(entry);
      totalLength += entry.length;
    }

    if (docTexts.length > 0) {
      return `\nUPLOADED DOCUMENTS (${docs.length} documents, ${chunks.length} text chunks):\n${docTexts.join("\n\n")}\n`;
    }
  }

  const docTexts = docs
    .filter(d => d.textContent)
    .map(d => `--- Document: ${d.fileName} ---\n${d.textContent!.substring(0, 10000)}`)
    .join("\n\n");

  return docTexts ? `\nUPLOADED DOCUMENTS:\n${docTexts}\n` : "";
}

const SYSTEM_PROMPT_BASE = `You are Small Claims Genie, an AI legal assistant specializing in California Small Claims Court. You help users understand court procedures, prepare their cases, analyze their documents, and provide guidance on small claims matters.

Important rules:
- You are NOT a lawyer and do not provide legal advice. You provide legal information and guidance.
- Always be helpful, clear, and specific to California small claims court (SC-100 process).
- When referencing case details or documents, cite specific information from the provided context.
- When analyzing documents, quote relevant passages and provide practical insights.
- Format responses clearly with bullet points and headers when helpful.
- Maximum small claims amount is $10,000 for individuals, $5,000 for businesses.
- Filing fees: $30 (claims ≤$1,500), $50 ($1,500.01-$5,000), $75 (>$5,000-$10,000).`;

router.post("/ai/ask", requireAuth, async (req, res) => {
  try {
    const { userId } = req as AuthRequest;
    const { question, caseId } = req.body;
    if (!question) return res.status(400).json({ error: "Question is required" });

    let caseContext = "";
    let documentContext = "";

    if (caseId) {
      const caseRecord = await getCaseForUser(caseId, userId);
      if (caseRecord) {
        caseContext = buildCaseContext(caseRecord);
        documentContext = await buildDocumentContext(caseId);
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `${SYSTEM_PROMPT_BASE}\n${caseContext}${documentContext}` },
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

router.post("/ai/transcribe", requireAuth, async (req, res) => {
  try {
    const { audioData } = req.body;
    if (!audioData) return res.status(400).json({ error: "Audio data is required" });

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
