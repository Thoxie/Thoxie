import { Router } from "express";
import { db } from "@workspace/db";
import { documentsTable, documentChunksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";
import { getCaseForUser } from "../lib/caseHelpers";

const router = Router();

const CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 200;

function chunkText(text: string): string[] {
  if (!text || text.trim().length === 0) return [];
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= CHUNK_SIZE) return [cleaned];

  const chunks: string[] = [];
  let start = 0;
  while (start < cleaned.length) {
    let end = Math.min(start + CHUNK_SIZE, cleaned.length);
    if (end < cleaned.length) {
      const lastPeriod = cleaned.lastIndexOf(". ", end);
      const lastNewline = cleaned.lastIndexOf("\n", end);
      const bestBreak = Math.max(lastPeriod, lastNewline);
      if (bestBreak > start + CHUNK_SIZE / 2) {
        end = bestBreak + 1;
      }
    }
    chunks.push(cleaned.slice(start, end).trim());
    start = end - CHUNK_OVERLAP;
    if (start >= cleaned.length) break;
  }
  return chunks;
}

async function ocrImage(base64Data: string, fileName: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract ALL text from this image. Include every word, number, date, and detail visible. If this is a receipt, contract, letter, or form, preserve the structure. Return only the extracted text, nothing else.",
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Data}`, detail: "high" },
            },
          ],
        },
      ],
      max_completion_tokens: 4096,
    });
    return response.choices[0]?.message?.content || "";
  } catch (err) {
    console.error("OCR error for", fileName, ":", err);
    return "";
  }
}

async function extractText(fileData: string, fileName: string, fileType: string): Promise<string> {
  try {
    const buffer = Buffer.from(fileData, "base64");

    if (fileType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
      const pdfParse = (await import("pdf-parse")).default;
      const result = await pdfParse(buffer);
      return result.text || "";
    }

    if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.toLowerCase().endsWith(".docx")
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    }

    if (fileType.startsWith("text/")) {
      return buffer.toString("utf-8");
    }

    if (fileType.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp|tiff?)$/i.test(fileName)) {
      return await ocrImage(fileData, fileName);
    }

    return "";
  } catch (err) {
    console.error("Text extraction error:", err);
    return "";
  }
}

router.get("/cases/:caseId/documents", requireAuth, async (req, res) => {
  try {
    const { userId } = req as AuthRequest;
    const caseId = parseInt(req.params.caseId);
    const caseRecord = await getCaseForUser(caseId, userId);
    if (!caseRecord) return res.status(404).json({ error: "Case not found." });

    const docs = await db.select({
      id: documentsTable.id,
      caseId: documentsTable.caseId,
      fileName: documentsTable.fileName,
      fileType: documentsTable.fileType,
      fileSize: documentsTable.fileSize,
      uploadedAt: documentsTable.uploadedAt,
      hasText: documentsTable.textContent,
    }).from(documentsTable).where(eq(documentsTable.caseId, caseId));

    res.json(docs.map(d => ({
      id: d.id,
      caseId: d.caseId,
      fileName: d.fileName,
      fileType: d.fileType,
      fileSize: d.fileSize,
      uploadedAt: d.uploadedAt,
      hasExtractedText: !!(d.hasText && d.hasText.length > 0),
    })));
  } catch (err) {
    console.error("List documents error:", err);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

router.post("/cases/:caseId/documents", requireAuth, async (req, res) => {
  try {
    const { userId } = req as AuthRequest;
    const caseId = parseInt(req.params.caseId);
    const caseRecord = await getCaseForUser(caseId, userId);
    if (!caseRecord) return res.status(404).json({ error: "Case not found." });

    const { fileName, fileType, fileSize, fileData } = req.body;
    if (!fileName || !fileType || !fileSize) {
      return res.status(400).json({ error: "fileName, fileType, and fileSize are required" });
    }

    let textContent = "";
    if (fileData) {
      textContent = await extractText(fileData, fileName, fileType);
    }

    const [doc] = await db.insert(documentsTable).values({
      caseId,
      fileName,
      fileType,
      fileSize,
      fileData: fileData || null,
      textContent: textContent || null,
    }).returning();

    if (textContent) {
      const chunks = chunkText(textContent);
      if (chunks.length > 0) {
        await db.insert(documentChunksTable).values(
          chunks.map((content, index) => ({ documentId: doc.id, caseId, chunkIndex: index, content }))
        );
      }
    }

    res.status(201).json({
      id: doc.id,
      caseId: doc.caseId,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      uploadedAt: doc.uploadedAt,
      hasExtractedText: !!(textContent && textContent.length > 0),
      chunkCount: textContent ? chunkText(textContent).length : 0,
    });
  } catch (err) {
    console.error("Upload document error:", err);
    res.status(500).json({ error: "Failed to upload document" });
  }
});

router.delete("/cases/:caseId/documents/:documentId", requireAuth, async (req, res) => {
  try {
    const { userId } = req as AuthRequest;
    const caseId = parseInt(req.params.caseId);
    const documentId = parseInt(req.params.documentId);
    const caseRecord = await getCaseForUser(caseId, userId);
    if (!caseRecord) return res.status(404).json({ error: "Case not found." });

    const [deleted] = await db.delete(documentsTable)
      .where(eq(documentsTable.id, documentId))
      .returning();
    if (!deleted) return res.status(404).json({ error: "Document not found." });
    res.json({ message: "Document deleted" });
  } catch (err) {
    console.error("Delete document error:", err);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

export default router;
