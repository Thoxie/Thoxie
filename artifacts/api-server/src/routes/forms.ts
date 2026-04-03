import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { casesTable, documentsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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

function fmt(date: string | null | undefined): string {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  } catch {
    return date;
  }
}

router.get("/cases/:caseId/forms/sc100", requireAuth, async (req: any, res) => {
  try {
    const caseId = parseInt(req.params.caseId);
    const [c] = await db.select().from(casesTable)
      .where(and(eq(casesTable.id, caseId), eq(casesTable.userId, req.userId)));
    if (!c) return res.status(404).json({ error: "Case not found." });

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const fs = 11;
    const sfs = 9;
    const navy = rgb(0.12, 0.22, 0.38);
    const black = rgb(0, 0, 0);
    const gray = rgb(0.4, 0.4, 0.4);

    const page = pdfDoc.addPage([612, 792]);
    const W = 612;
    const M = 54;
    let Y = 740;
    const lineH = 16;

    const text = (t: string, x: number, y: number, size = fs, f = font, color = black) => {
      page.drawText(t || "", { x, y, size, font: f, color });
    };

    const hLine = (y: number) => {
      page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.5, color: gray });
    };

    text("SC-100", W - M - 40, Y, 12, boldFont, navy);
    text("PLAINTIFF'S CLAIM AND ORDER TO GO TO SMALL CLAIMS COURT", M, Y, 12, boldFont, navy);
    Y -= 20;
    text("(Pequeñas Demandas)", M, Y, sfs, font, gray);
    Y -= 6;
    hLine(Y);
    Y -= 20;

    text("1. The Plaintiff (the person, business, or public entity that is suing) is:", M, Y, fs, boldFont);
    Y -= lineH;
    text(`Name: ${c.plaintiffName || ""}`, M + 20, Y);
    Y -= lineH;
    text(`Street Address: ${c.plaintiffAddress || ""}`, M + 20, Y);
    Y -= lineH;
    text(`City: ${c.plaintiffCity || ""}    State: ${c.plaintiffState || "CA"}    Zip Code: ${c.plaintiffZip || ""}`, M + 20, Y);
    Y -= lineH;
    text(`Telephone No.: ${c.plaintiffPhone || ""}`, M + 20, Y);
    Y -= 8;
    hLine(Y);
    Y -= 18;

    text("2. The Defendant (the person, business, or public entity being sued) is:", M, Y, fs, boldFont);
    Y -= lineH;
    text(`Name: ${c.defendantName || ""}`, M + 20, Y);
    Y -= lineH;
    text(`Street Address: ${c.defendantAddress || ""}`, M + 20, Y);
    Y -= lineH;
    text(`City: ${c.defendantCity || ""}    State: ${c.defendantState || "CA"}    Zip Code: ${c.defendantZip || ""}`, M + 20, Y);
    Y -= 8;
    hLine(Y);
    Y -= 18;

    text("3. The plaintiff claims the defendant owes $" + (c.amountClaimed || "0"), M, Y, fs, boldFont);
    Y -= lineH;
    text("Not including court costs — for the following reasons:", M + 20, Y, sfs, font, gray);
    Y -= lineH + 2;
    const descLines = wrapText(c.claimDescription || "Not specified", 85);
    for (let i = 0; i < Math.min(descLines.length, 5); i++) {
      text(descLines[i], M + 20, Y);
      Y -= lineH;
    }
    Y -= 4;
    hLine(Y);
    Y -= 18;

    text("4. This happened on (date): " + fmt(c.incidentDateStart) +
      (c.incidentDateEnd ? " – " + fmt(c.incidentDateEnd) : ""), M, Y, fs, boldFont);
    Y -= 8;
    hLine(Y);
    Y -= 18;

    text("5. The plaintiff has asked the defendant to pay this money, but the", M, Y);
    Y -= lineH;
    text("defendant has not paid. Demand was made: " + (c.demandMade ? "Yes" : "No"), M + 20, Y);
    if (c.demandDescription) {
      Y -= lineH;
      const demLines = wrapText(c.demandDescription, 85);
      for (let i = 0; i < Math.min(demLines.length, 2); i++) {
        text(demLines[i], M + 20, Y);
        Y -= lineH;
      }
    }
    Y -= 4;
    hLine(Y);
    Y -= 18;

    text("6. This court is the proper court for this claim because:", M, Y, fs, boldFont);
    Y -= lineH;
    text(c.venueBasis || "Not specified", M + 20, Y);
    Y -= 8;
    hLine(Y);
    Y -= 18;

    text("7. How the amount was calculated:", M, Y, fs, boldFont);
    Y -= lineH;
    const calcLines = wrapText(c.howAmountCalculated || "Not specified", 85);
    for (let i = 0; i < Math.min(calcLines.length, 3); i++) {
      text(calcLines[i], M + 20, Y);
      Y -= lineH;
    }
    Y -= 4;
    hLine(Y);
    Y -= 18;

    text("8. Filing information:", M, Y, fs, boldFont);
    Y -= lineH;
    text(`County: ${c.county || "N/A"}`, M + 20, Y);
    Y -= lineH;
    text(`Courthouse: ${c.courthouse || "N/A"}`, M + 20, Y);
    Y -= lineH;
    text(`Claim Type: ${c.claimType || "N/A"}`, M + 20, Y);
    Y -= lineH;
    text(`Suing public entity: ${c.suingPublicEntity ? "Yes" : "No"}`, M + 20, Y);
    Y -= lineH;
    text(`Attorney fee dispute: ${c.disputeAttorneyFees ? "Yes" : "No"}`, M + 20, Y);

    Y -= 30;
    text("Date: " + new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }), M, Y);
    text("_______________________________", 350, Y);
    Y -= lineH;
    text("Signature of Plaintiff", 380, Y, sfs, font, gray);

    Y -= 30;
    page.drawRectangle({ x: M, y: Y - 30, width: W - 2 * M, height: 30, color: rgb(0.95, 0.95, 0.95) });
    text("Generated by Small Claims Genie — for reference only. Use official SC-100 for filing.", M + 10, Y - 20, sfs, font, gray);

    const pdfBytes = await pdfDoc.save();
    const fileName = `SC-100_${c.plaintiffName?.replace(/\s+/g, "_") || "Case"}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    console.error("SC-100 PDF error:", err?.message || err);
    res.status(500).json({ error: "Failed to generate SC-100 PDF" });
  }
});

router.get("/cases/:caseId/forms/sc100.docx", requireAuth, async (req: any, res) => {
  try {
    const caseId = parseInt(req.params.caseId);
    const [c] = await db.select().from(casesTable)
      .where(and(eq(casesTable.id, caseId), eq(casesTable.userId, req.userId)));
    if (!c) return res.status(404).json({ error: "Case not found." });

    const {
      Document, Packer, Paragraph, TextRun, HeadingLevel,
      AlignmentType, BorderStyle, Table, TableRow, TableCell,
      WidthType, ShadingType,
    } = await import("docx");

    const hrBorder = {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    };

    const bold = (t: string) => new TextRun({ text: t, bold: true, font: "Times New Roman", size: 22 });
    const normal = (t: string) => new TextRun({ text: t, font: "Times New Roman", size: 22 });
    const small = (t: string) => new TextRun({ text: t, font: "Times New Roman", size: 18, color: "666666" });

    const section = (num: string, title: string, ...content: string[]) => {
      const paras: Paragraph[] = [
        new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [bold(`${num}. ${title}`)],
        }),
      ];
      for (const line of content) {
        paras.push(new Paragraph({
          spacing: { after: 40 },
          indent: { left: 360 },
          children: [normal(line)],
        }));
      }
      paras.push(new Paragraph({ border: hrBorder, spacing: { after: 100 }, children: [] }));
      return paras;
    };

    const doc = new Document({
      sections: [{
        properties: {
          page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [
              new TextRun({ text: "SC-100", bold: true, font: "Times New Roman", size: 28, color: "1E3A5F" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [
              new TextRun({ text: "PLAINTIFF'S CLAIM AND ORDER TO GO TO SMALL CLAIMS COURT", bold: true, font: "Times New Roman", size: 24, color: "1E3A5F" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [small("(Pequeñas Demandas)")],
          }),
          new Paragraph({ border: hrBorder, spacing: { after: 100 }, children: [] }),

          ...section("1", "The Plaintiff (the person suing) is:",
            `Name: ${c.plaintiffName || ""}`,
            `Street Address: ${c.plaintiffAddress || ""}`,
            `City: ${c.plaintiffCity || ""}  State: ${c.plaintiffState || "CA"}  Zip: ${c.plaintiffZip || ""}`,
            `Telephone: ${c.plaintiffPhone || ""}`,
          ),

          ...section("2", "The Defendant (the person being sued) is:",
            `Name: ${c.defendantName || ""}`,
            `Street Address: ${c.defendantAddress || ""}`,
            `City: ${c.defendantCity || ""}  State: ${c.defendantState || "CA"}  Zip: ${c.defendantZip || ""}`,
          ),

          ...section("3", `The plaintiff claims the defendant owes $${c.amountClaimed || "0"}`,
            `Reason: ${c.claimDescription || "Not specified"}`,
          ),

          ...section("4", `This happened on (date): ${fmt(c.incidentDateStart)}${c.incidentDateEnd ? " – " + fmt(c.incidentDateEnd) : ""}`),

          ...section("5", "Prior demand for payment:",
            `Demand was made: ${c.demandMade ? "Yes" : "No"}`,
            c.demandDescription ? `Details: ${c.demandDescription}` : "",
          ).filter(p => {
            const children = (p as any).root?.[1]?.["w:r"];
            if (!children) return true;
            return true;
          }),

          ...section("6", "This court is the proper court because:",
            c.venueBasis || "Not specified",
          ),

          ...section("7", "How the amount was calculated:",
            c.howAmountCalculated || "Not specified",
          ),

          ...section("8", "Filing information:",
            `County: ${c.county || "N/A"}`,
            `Courthouse: ${c.courthouse || "N/A"}`,
            `Claim Type: ${c.claimType || "N/A"}`,
            `Suing public entity: ${c.suingPublicEntity ? "Yes" : "No"}`,
            `Attorney fee dispute: ${c.disputeAttorneyFees ? "Yes" : "No"}`,
          ),

          new Paragraph({ spacing: { before: 400 }, children: [] }),
          new Paragraph({
            children: [
              normal(`Date: ${new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}                                          _______________________________`),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            children: [small("Signature of Plaintiff")],
          }),

          new Paragraph({
            spacing: { before: 300 },
            shading: { type: ShadingType.SOLID, color: "F5F5F5" },
            children: [
              small("Generated by Small Claims Genie — for reference only. Use official SC-100 for filing."),
            ],
          }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    const fileName = `SC-100_${c.plaintiffName?.replace(/\s+/g, "_") || "Case"}.docx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (err: any) {
    console.error("SC-100 DOCX error:", err?.message || err);
    res.status(500).json({ error: "Failed to generate SC-100 Word document" });
  }
});

router.get("/cases/:caseId/forms/readiness", requireAuth, async (req: any, res) => {
  try {
    const caseId = parseInt(req.params.caseId);
    const [c] = await db.select().from(casesTable)
      .where(and(eq(casesTable.id, caseId), eq(casesTable.userId, req.userId)));
    if (!c) return res.status(404).json({ error: "Case not found." });

    const docs = await db.select().from(documentsTable).where(eq(documentsTable.caseId, caseId));
    const docCount = docs.length;

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    let score = 0;

    if (c.plaintiffName && c.plaintiffAddress && c.plaintiffCity && c.plaintiffZip) {
      strengths.push("Your contact information is complete");
      score += 20;
    } else {
      weaknesses.push("Complete your contact information (name, address, city, zip)");
    }

    if (c.defendantName && c.defendantAddress) {
      strengths.push("Defendant information is on file");
      score += 20;
    } else {
      weaknesses.push("Add defendant name and address");
    }

    if (c.amountClaimed && c.claimDescription) {
      strengths.push("Claim details and amount are specified");
      score += 15;
    } else {
      weaknesses.push("Specify your claim amount and description");
    }

    if (docCount > 0) {
      strengths.push(`${docCount} supporting document${docCount > 1 ? "s" : ""} uploaded`);
      score += 15;
    } else {
      weaknesses.push("Upload supporting documents (invoices, receipts, photos)");
    }

    if (c.demandMade) {
      strengths.push("Prior demand to defendant was made");
      score += 15;
    } else {
      weaknesses.push("Make a demand for payment before filing");
    }

    if (c.county && c.courthouse) {
      strengths.push("Filing courthouse selected");
      score += 10;
    } else {
      weaknesses.push("Select your filing county and courthouse");
    }

    if (c.intakeComplete) {
      score += 5;
    }

    score = Math.min(score, 100);

    res.json({ score, strengths, weaknesses, documentCount: docCount });
  } catch (err: any) {
    console.error("Readiness check error:", err?.message || err);
    res.status(500).json({ error: "Failed to check readiness" });
  }
});

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    if ((currentLine + " " + word).trim().length > maxChars) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + " " + word : word;
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());
  return lines;
}

export default router;
