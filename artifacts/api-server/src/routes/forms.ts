import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { casesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { PDFDocument, StandardFonts } from "pdf-lib";

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

router.get("/cases/:caseId/forms/sc100", requireAuth, async (req: any, res) => {
  try {
    const caseId = parseInt(req.params.caseId);
    const [caseRecord] = await db.select().from(casesTable)
      .where(and(eq(casesTable.id, caseId), eq(casesTable.userId, req.userId)));

    if (!caseRecord) {
      return res.status(404).json({ error: "Case not found." });
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Courier);
    const boldFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
    const fontSize = 10;
    const smallFont = 8;

    const page = pdfDoc.addPage([612, 792]);
    const { height } = page.getSize();

    const drawText = (text: string, x: number, y: number, size = fontSize, f = font) => {
      page.drawText(text || "", { x, y: height - y, size, font: f });
    };

    const drawLine = (x1: number, y1: number, x2: number) => {
      page.drawLine({
        start: { x: x1, y: height - y1 },
        end: { x: x2, y: height - y1 },
        thickness: 0.5,
      });
    };

    drawText("SC-100", 540, 30, 12, boldFont);
    drawText("PLAINTIFF'S CLAIM AND ORDER", 180, 50, 14, boldFont);
    drawText("TO GO TO SMALL CLAIMS COURT", 190, 67, 14, boldFont);
    drawText("(Small Claims)", 250, 84, 10, font);

    drawLine(40, 100, 572);

    drawText("1. The Plaintiff (the person, business, or public entity that is suing) is:", 40, 115, fontSize, boldFont);
    drawText(`Name: ${caseRecord.plaintiffName || ""}`, 60, 135);
    drawText(`Street Address: ${caseRecord.plaintiffAddress || ""}`, 60, 150);
    drawText(`City: ${caseRecord.plaintiffCity || ""}   State: ${caseRecord.plaintiffState || "CA"}   Zip: ${caseRecord.plaintiffZip || ""}`, 60, 165);
    drawText(`Phone: ${caseRecord.plaintiffPhone || ""}`, 60, 180);

    drawLine(40, 200, 572);

    drawText("2. The Defendant (the person, business, or public entity being sued) is:", 40, 215, fontSize, boldFont);
    drawText(`Name: ${caseRecord.defendantName || ""}`, 60, 235);
    drawText(`Street Address: ${caseRecord.defendantAddress || ""}`, 60, 250);
    drawText(`City: ${caseRecord.defendantCity || ""}   State: ${caseRecord.defendantState || "CA"}   Zip: ${caseRecord.defendantZip || ""}`, 60, 265);

    drawLine(40, 285, 572);

    drawText("3. The plaintiff claims the defendant owes:", 40, 300, fontSize, boldFont);
    drawText(`   $${caseRecord.amountClaimed || "0.00"}`, 60, 320);
    const claimDesc = caseRecord.claimDescription || "";
    drawText("   Reason:", 60, 340);
    const descLines = wrapText(claimDesc, 75);
    descLines.forEach((line, i) => {
      if (i < 4) drawText(`   ${line}`, 60, 355 + i * 15);
    });

    drawLine(40, 420, 572);

    drawText("4. This claim is filed in the right court because (venue basis):", 40, 435, fontSize, boldFont);
    drawText(`   ${caseRecord.venueBasis || "Not specified"}`, 60, 455);

    drawLine(40, 475, 572);

    drawText("5. Incident/Dispute dates:", 40, 490, fontSize, boldFont);
    drawText(`   From: ${caseRecord.incidentDateStart || "N/A"}   To: ${caseRecord.incidentDateEnd || "N/A"}`, 60, 510);

    drawLine(40, 530, 572);

    drawText("6. How the amount claimed was calculated:", 40, 545, fontSize, boldFont);
    const calcLines = wrapText(caseRecord.howAmountCalculated || "Not specified", 75);
    calcLines.forEach((line, i) => {
      if (i < 3) drawText(`   ${line}`, 60, 565 + i * 15);
    });

    drawLine(40, 615, 572);

    drawText("7. Has the plaintiff asked the defendant to pay this amount?", 40, 630, fontSize, boldFont);
    drawText(`   ${caseRecord.demandMade ? "Yes" : "No"}`, 60, 650);
    if (caseRecord.demandDescription) {
      drawText(`   Details: ${caseRecord.demandDescription.substring(0, 80)}`, 60, 665);
    }

    drawLine(40, 685, 572);

    drawText("County: " + (caseRecord.county || ""), 40, 700);
    drawText("Courthouse: " + (caseRecord.courthouse || ""), 40, 715);

    drawText("Date: " + new Date().toLocaleDateString("en-US"), 40, 745);
    drawLine(300, 750, 550);
    drawText("Signature of Plaintiff", 370, 760, smallFont);

    const page2 = pdfDoc.addPage([612, 792]);
    const drawText2 = (text: string, x: number, y: number, size = fontSize, f = font) => {
      page2.drawText(text || "", { x, y: 792 - y, size, font: f });
    };

    drawText2("SC-100 — Page 2", 480, 30, smallFont);
    drawText2("CLAIM TYPE:", 40, 50, fontSize, boldFont);
    drawText2(`${caseRecord.claimType || "Not specified"}`, 60, 70);

    drawText2("ADDITIONAL INFORMATION:", 40, 100, fontSize, boldFont);
    drawText2(`Suing a public entity: ${caseRecord.suingPublicEntity ? "Yes" : "No"}`, 60, 120);
    drawText2(`Attorney fee dispute: ${caseRecord.disputeAttorneyFees ? "Yes" : "No"}`, 60, 135);
    drawText2(`Filed more than 12 claims in past 12 months: ${caseRecord.filedOver12 ? "Yes" : "No"}`, 60, 150);
    drawText2(`Claim exceeds $2,500: ${caseRecord.filedOver2500 ? "Yes" : "No"}`, 60, 165);

    drawText2("DISCLAIMER:", 40, 210, fontSize, boldFont);
    drawText2("This document was generated by Small Claims Genie for informational", 60, 230);
    drawText2("purposes. Review all information carefully before filing with the court.", 60, 245);
    drawText2("This is NOT an official court document — use official SC-100 forms", 60, 260);
    drawText2("from courts.ca.gov for actual filing.", 60, 275);

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="SC-100_${caseRecord.plaintiffName?.replace(/\s+/g, "_") || "Case"}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    console.error("SC-100 generation error:", err?.message || err);
    res.status(500).json({ error: "Failed to generate SC-100 form" });
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
