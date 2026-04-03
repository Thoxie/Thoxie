import { Router } from "express";
import { getAuth } from "@clerk/express";
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

    return "";
  } catch (err) {
    console.error("Text extraction error:", err);
    return "";
  }
}

router.get("/cases/:caseId/documents", requireAuth, async (req: any, res) => {
  try {
    const caseId = parseInt(req.params.caseId);
    const [caseRecord] = await db.select().from(casesTable).where(and(eq(casesTable.id, caseId), eq(casesTable.userId, req.userId)));
    if (!caseRecord) {
      return res.status(404).json({ error: "Case not found." });
    }
    const docs = await db.select({
      id: documentsTable.id,
      caseId: documentsTable.caseId,
      fileName: documentsTable.fileName,
      fileType: documentsTable.fileType,
      fileSize: documentsTable.fileSize,
      uploadedAt: documentsTable.uploadedAt,
    }).from(documentsTable).where(eq(documentsTable.caseId, caseId));
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

router.post("/cases/:caseId/documents", requireAuth, async (req: any, res) => {
  try {
    const caseId = parseInt(req.params.caseId);
    const [caseRecord] = await db.select().from(casesTable).where(and(eq(casesTable.id, caseId), eq(casesTable.userId, req.userId)));
    if (!caseRecord) {
      return res.status(404).json({ error: "Case not found." });
    }

    const { fileName, fileType, fileSize, fileData } = req.body;
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
    res.status(201).json({
      id: doc.id,
      caseId: doc.caseId,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      uploadedAt: doc.uploadedAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload document" });
  }
});

router.delete("/cases/:caseId/documents/:documentId", requireAuth, async (req: any, res) => {
  try {
    const caseId = parseInt(req.params.caseId);
    const documentId = parseInt(req.params.documentId);
    const [caseRecord] = await db.select().from(casesTable).where(and(eq(casesTable.id, caseId), eq(casesTable.userId, req.userId)));
    if (!caseRecord) {
      return res.status(404).json({ error: "Case not found." });
    }
    const [deleted] = await db.delete(documentsTable)
      .where(and(eq(documentsTable.id, documentId), eq(documentsTable.caseId, caseId)))
      .returning();
    if (!deleted) {
      return res.status(404).json({ error: "Document not found." });
    }
    res.json({ message: "Document deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete document" });
  }
});

export default router;
