import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { casesTable, documentsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from "pdf-lib";

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
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  } catch {
    return date;
  }
}

const PW = 612;
const PH = 792;
const ML = 54;
const MR = 54;
const MT = 50;
const CW = PW - ML - MR;
const BLACK = rgb(0, 0, 0);
const GRAY = rgb(0.4, 0.4, 0.4);
const LIGHT_GRAY = rgb(0.85, 0.85, 0.85);

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const test = currentLine ? currentLine + " " + word : word;
    const width = font.widthOfTextAtSize(test, fontSize);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawBox(page: PDFPage, x: number, y: number, w: number, h: number) {
  page.drawRectangle({ x, y: y - h, width: w, height: h, borderColor: BLACK, borderWidth: 0.5, color: rgb(1, 1, 1) });
}

function drawCheckBox(page: PDFPage, x: number, y: number, checked: boolean, font: PDFFont, size: number = 8) {
  page.drawRectangle({ x, y: y - 1, width: 8, height: 8, borderColor: BLACK, borderWidth: 0.5, color: rgb(1, 1, 1) });
  if (checked) {
    page.drawText("X", { x: x + 1.5, y: y, size: 7, font, color: BLACK });
  }
}

const MAX_DESC_LINES = 5;
const MAX_CALC_LINES = 4;

router.get("/cases/:caseId/forms/sc100", requireAuth, async (req: any, res) => {
  try {
    const caseId = parseInt(req.params.caseId);
    const [c] = await db.select().from(casesTable)
      .where(and(eq(casesTable.id, caseId), eq(casesTable.userId, req.userId)));
    if (!c) return res.status(404).json({ error: "Case not found." });

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const bold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const italic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    const fs = 10;
    const sfs = 8;
    const hfs = 12;

    const descLines = wrapText(c.claimDescription || "Not specified", font, fs, CW - 40);
    const needsMC031 = descLines.length > MAX_DESC_LINES;
    const calcLines = wrapText(c.howAmountCalculated || "Not specified", font, fs, CW - 40);

    buildPage1(pdfDoc, c, font, bold, italic, fs, sfs, hfs);
    buildPage2(pdfDoc, c, font, bold, italic, fs, sfs, hfs, descLines, needsMC031);
    buildPage3(pdfDoc, c, font, bold, italic, fs, sfs, hfs, calcLines, needsMC031);
    buildPage4(pdfDoc, c, font, bold, italic, fs, sfs, hfs);

    if (needsMC031) {
      buildMC031(pdfDoc, c, font, bold, italic, fs, sfs, descLines);
    }

    const pdfBytes = await pdfDoc.save();
    const fileName = `SC-100_${(c.plaintiffName || "Case").replace(/\s+/g, "_")}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    console.error("SC-100 PDF error:", err?.message || err);
    res.status(500).json({ error: "Failed to generate SC-100 PDF" });
  }
});

function pageHeader(page: PDFPage, font: PDFFont, bold: PDFFont, plaintiffName: string, caseNumber: string) {
  page.drawText("Plaintiff (list names):", { x: ML, y: PH - MT, size: 8, font, color: GRAY });
  page.drawText(plaintiffName || "", { x: ML + 100, y: PH - MT, size: 9, font: bold, color: BLACK });
  page.drawText("Case Number:", { x: PW - MR - 140, y: PH - MT, size: 8, font, color: GRAY });
  page.drawText(caseNumber || "", { x: PW - MR - 140, y: PH - MT - 12, size: 9, font: bold, color: BLACK });
  page.drawLine({ start: { x: ML, y: PH - MT - 20 }, end: { x: PW - MR, y: PH - MT - 20 }, thickness: 0.5, color: LIGHT_GRAY });
  return PH - MT - 35;
}

function pageFooter(page: PDFPage, font: PDFFont, bold: PDFFont, pageNum: number) {
  const y = 30;
  page.drawLine({ start: { x: ML, y: y + 10 }, end: { x: PW - MR, y: y + 10 }, thickness: 0.5, color: LIGHT_GRAY });
  page.drawText("Rev. January 1, 2026", { x: ML, y, size: 7, font, color: GRAY });
  page.drawText("Plaintiff's Claim and ORDER to Go to Small Claims Court", { x: 180, y, size: 7, font, color: GRAY });
  page.drawText(`SC-100, Page ${pageNum} of 6`, { x: PW - MR - 80, y, size: 7, font, color: GRAY });
}

function buildPage1(pdfDoc: PDFDocument, c: any, font: PDFFont, bold: PDFFont, italic: PDFFont, fs: number, sfs: number, hfs: number) {
  const page = pdfDoc.addPage([PW, PH]);
  let Y = PH - MT;

  page.drawText("SC-100", { x: ML, y: Y, size: 14, font: bold, color: BLACK });
  page.drawText("Plaintiff's Claim and ORDER", { x: ML + 80, y: Y, size: hfs, font: bold, color: BLACK });
  Y -= 14;
  page.drawText("to Go to Small Claims Court", { x: ML + 80, y: Y, size: hfs, font: bold, color: BLACK });
  Y -= 8;
  page.drawLine({ start: { x: ML, y: Y }, end: { x: PW - MR, y: Y }, thickness: 1, color: BLACK });
  Y -= 14;

  page.drawText("Clerk stamps date here when form is filed.", { x: PW - MR - 200, y: PH - MT, size: sfs, font: italic, color: GRAY });
  drawBox(page, PW - MR - 200, PH - MT - 5, 190, 80);

  page.drawText("Notice to the person being sued:", { x: ML, y: Y, size: fs, font: bold, color: BLACK });
  Y -= 14;

  const noticeLines = [
    "You are the defendant if your name is listed in 2 on page 2 of this form or",
    "on form SC-100A. The person suing you is the plaintiff, listed in 1 on page 2.",
    "",
    "You and the plaintiff must go to court on the trial date listed below. If you",
    "do not go to court, you may lose the case. If you lose, the court can order",
    "that your wages, money, or property be taken to pay this claim.",
    "",
    "Bring witnesses, receipts, and any evidence you need to prove your case.",
    "",
    "Read this form and all pages attached to understand the claim against you",
    "and to protect your rights.",
  ];
  for (const line of noticeLines) {
    if (line) {
      page.drawText(line, { x: ML + 10, y: Y, size: sfs, font, color: BLACK });
    }
    Y -= 11;
  }

  Y -= 4;
  page.drawText("Fill in court name and street address:", { x: PW / 2 + 20, y: Y + 70, size: sfs, font: italic, color: GRAY });
  page.drawText("Superior Court of California, County of", { x: PW / 2 + 20, y: Y + 58, size: sfs, font: bold, color: BLACK });
  page.drawText(c.county || "_______________", { x: PW / 2 + 20, y: Y + 46, size: fs, font, color: BLACK });
  page.drawText(c.courthouse || "", { x: PW / 2 + 20, y: Y + 34, size: sfs, font, color: BLACK });

  page.drawText("Court fills in case number when form is filed.", { x: PW / 2 + 20, y: Y + 15, size: sfs, font: italic, color: GRAY });
  page.drawText("Case Number:", { x: PW / 2 + 20, y: Y + 3, size: sfs, font: bold, color: BLACK });
  page.drawText("Case Name:", { x: PW / 2 + 20, y: Y - 12, size: sfs, font: bold, color: BLACK });

  page.drawText("Aviso al Demandado:", { x: ML, y: Y, size: fs, font: bold, color: BLACK });
  Y -= 14;
  const avisoLines = [
    "Usted es el Demandado si su nombre figura en 2 de la página 2 de este",
    "formulario, o en el formulario SC-100A. La persona que lo demanda es el",
    "Demandante, la que figura en 1 de la página 2.",
    "",
    "Usted y el Demandante tienen que presentarse en la corte en la fecha del",
    "juicio indicada a continuación. Si no se presenta, puede perder el caso.",
  ];
  for (const line of avisoLines) {
    if (line) {
      page.drawText(line, { x: ML + 10, y: Y, size: sfs, font: italic, color: GRAY });
    }
    Y -= 11;
  }

  Y -= 10;
  page.drawLine({ start: { x: ML, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: BLACK });
  Y -= 16;
  page.drawText("Order to Go to Court", { x: ML + 150, y: Y, size: 11, font: bold, color: BLACK });
  Y -= 14;
  page.drawText("The people in 1 and 2 must attend court: (Clerk fills out section below.)", { x: ML, y: Y, size: sfs, font, color: BLACK });
  Y -= 14;

  page.drawText("Trial", { x: ML + 10, y: Y + 4, size: sfs, font: bold, color: BLACK });
  page.drawText("Date", { x: ML + 10, y: Y - 6, size: sfs, font: bold, color: BLACK });
  page.drawText("Date", { x: ML + 60, y: Y, size: sfs, font, color: GRAY });
  page.drawText("Time", { x: ML + 200, y: Y, size: sfs, font, color: GRAY });
  page.drawText("Department", { x: ML + 280, y: Y, size: sfs, font, color: GRAY });
  page.drawText("Name and address of court, if different from above", { x: ML + 360, y: Y, size: 7, font, color: GRAY });
  Y -= 14;
  page.drawText("1.", { x: ML + 40, y: Y, size: sfs, font, color: BLACK });
  page.drawLine({ start: { x: ML + 50, y: Y - 2 }, end: { x: PW - MR, y: Y - 2 }, thickness: 0.5, color: LIGHT_GRAY });
  Y -= 12;
  page.drawText("2.", { x: ML + 40, y: Y, size: sfs, font, color: BLACK });
  page.drawLine({ start: { x: ML + 50, y: Y - 2 }, end: { x: PW - MR, y: Y - 2 }, thickness: 0.5, color: LIGHT_GRAY });
  Y -= 12;
  page.drawText("3.", { x: ML + 40, y: Y, size: sfs, font, color: BLACK });
  page.drawLine({ start: { x: ML + 50, y: Y - 2 }, end: { x: PW - MR, y: Y - 2 }, thickness: 0.5, color: LIGHT_GRAY });
  Y -= 16;
  page.drawText("Date:", { x: ML + 40, y: Y, size: sfs, font, color: BLACK });
  page.drawText("Clerk, by", { x: ML + 250, y: Y, size: sfs, font, color: GRAY });
  page.drawText(", Deputy", { x: ML + 420, y: Y, size: sfs, font, color: GRAY });

  Y -= 20;
  page.drawLine({ start: { x: ML, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: BLACK });
  Y -= 14;
  page.drawText("Instructions for the person suing:", { x: ML, y: Y, size: fs, font: bold, color: BLACK });
  Y -= 12;

  const instrLines = [
    "You are the plaintiff. The person you are suing is the defendant.",
    "Before you fill out this form, read form SC-100-INFO, Information for the Plaintiff, to know your rights. You can get",
    "form SC-100-INFO at any courthouse or county law library, or go to courts.ca.gov/rules-forms/find-your-court-forms.",
    "Fill out pages 2, 3, and 4 of this form. Make copies of all the pages of this form and any attachments—one for each",
    "party named in this case and an extra copy for yourself. Take or mail the original and the copies to the court clerk's",
    "office and pay the filing fee. The clerk will write the date of your trial in the box above.",
    "You must have someone at least 18—not you or anyone else listed in this case—give each defendant a court-stamped",
    "copy of all pages of this form and any pages this form tells you to attach.",
    "Go to court on your trial date listed above. Bring witnesses, receipts, and any evidence you need to prove your case.",
  ];
  for (const line of instrLines) {
    page.drawText(line, { x: ML + 10, y: Y, size: 7.5, font, color: BLACK });
    Y -= 10;
  }

  pageFooter(page, font, bold, 1);
}

function buildPage2(pdfDoc: PDFDocument, c: any, font: PDFFont, bold: PDFFont, italic: PDFFont, fs: number, sfs: number, hfs: number, descLines: string[], needsMC031: boolean) {
  const page = pdfDoc.addPage([PW, PH]);
  let Y = pageHeader(page, font, bold, c.plaintiffName || "", "");

  const numCircle = (n: string, x: number, y: number) => {
    page.drawCircle({ x: x + 5, y: y + 3, size: 8, borderColor: BLACK, borderWidth: 0.7, color: rgb(1, 1, 1) });
    page.drawText(n, { x: x + 2, y: y, size: 9, font: bold, color: BLACK });
  };

  numCircle("1", ML, Y);
  page.drawText("The plaintiff (the person, business, or public entity that is suing) is:", { x: ML + 20, y: Y, size: fs, font: bold, color: BLACK });
  Y -= 16;
  page.drawText("Name:", { x: ML + 20, y: Y, size: sfs, font, color: GRAY });
  page.drawText(c.plaintiffName || "", { x: ML + 55, y: Y, size: fs, font, color: BLACK });
  page.drawText("Phone:", { x: PW / 2 + 50, y: Y, size: sfs, font, color: GRAY });
  page.drawText(c.plaintiffPhone || "", { x: PW / 2 + 85, y: Y, size: fs, font, color: BLACK });
  Y -= 14;
  page.drawText("Street address:", { x: ML + 20, y: Y, size: sfs, font, color: GRAY });
  Y -= 14;
  page.drawText(c.plaintiffAddress || "", { x: ML + 40, y: Y, size: fs, font, color: BLACK });
  page.drawText(c.plaintiffCity || "", { x: ML + 250, y: Y, size: fs, font, color: BLACK });
  page.drawText(c.plaintiffState || "CA", { x: PW / 2 + 110, y: Y, size: fs, font, color: BLACK });
  page.drawText(c.plaintiffZip || "", { x: PW / 2 + 160, y: Y, size: fs, font, color: BLACK });
  Y -= 10;
  page.drawLine({ start: { x: ML + 40, y: Y }, end: { x: ML + 240, y: Y }, thickness: 0.5, color: LIGHT_GRAY });
  page.drawLine({ start: { x: ML + 250, y: Y }, end: { x: PW / 2 + 100, y: Y }, thickness: 0.5, color: LIGHT_GRAY });
  page.drawLine({ start: { x: PW / 2 + 110, y: Y }, end: { x: PW / 2 + 150, y: Y }, thickness: 0.5, color: LIGHT_GRAY });
  page.drawLine({ start: { x: PW / 2 + 160, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: LIGHT_GRAY });
  Y -= 8;
  page.drawText("Street", { x: ML + 120, y: Y, size: 7, font: italic, color: GRAY });
  page.drawText("City", { x: ML + 330, y: Y, size: 7, font: italic, color: GRAY });
  page.drawText("State", { x: PW / 2 + 115, y: Y, size: 7, font: italic, color: GRAY });
  page.drawText("Zip", { x: PW / 2 + 170, y: Y, size: 7, font: italic, color: GRAY });
  Y -= 14;
  page.drawText("Mailing address (if different):", { x: ML + 20, y: Y, size: sfs, font, color: GRAY });
  Y -= 12;
  page.drawLine({ start: { x: ML + 40, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: LIGHT_GRAY });
  Y -= 14;
  page.drawText("Email address (if available):", { x: ML + 20, y: Y, size: sfs, font, color: GRAY });
  page.drawText(c.plaintiffEmail || "", { x: ML + 140, y: Y, size: fs, font, color: BLACK });
  Y -= 14;

  page.drawText("If more than one plaintiff, list next plaintiff here:", { x: ML + 20, y: Y, size: sfs, font, color: GRAY });
  Y -= 14;
  page.drawText("Name:", { x: ML + 20, y: Y, size: sfs, font, color: GRAY });
  page.drawText("Phone:", { x: PW / 2 + 50, y: Y, size: sfs, font, color: GRAY });
  Y -= 14;
  page.drawText("Street address:", { x: ML + 20, y: Y, size: sfs, font, color: GRAY });
  Y -= 12;
  page.drawLine({ start: { x: ML + 40, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: LIGHT_GRAY });
  Y -= 14;
  page.drawText("Mailing address (if different):", { x: ML + 20, y: Y, size: sfs, font, color: GRAY });
  Y -= 12;
  page.drawLine({ start: { x: ML + 40, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: LIGHT_GRAY });
  Y -= 14;
  page.drawText("Email address (if available):", { x: ML + 20, y: Y, size: sfs, font, color: GRAY });
  Y -= 16;

  drawCheckBox(page, ML + 30, Y, false, font);
  page.drawText("Check here if more than two plaintiffs and attach form SC-100A.", { x: ML + 44, y: Y, size: sfs, font, color: BLACK });
  Y -= 12;
  drawCheckBox(page, ML + 30, Y, false, font);
  page.drawText("Check here if either plaintiff listed above is doing business under a fictitious name and attach form SC-103.", { x: ML + 44, y: Y, size: sfs, font, color: BLACK });
  Y -= 12;
  drawCheckBox(page, ML + 30, Y, false, font);
  page.drawText("Check here if any plaintiff is a \"licensee\" or \"deferred deposit originator\" (payday lender) under Financial", { x: ML + 44, y: Y, size: sfs, font, color: BLACK });
  Y -= 10;
  page.drawText("Code sections 23000 et seq.", { x: ML + 44, y: Y, size: sfs, font, color: BLACK });
  Y -= 18;

  page.drawLine({ start: { x: ML, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: BLACK });
  Y -= 16;

  numCircle("2", ML, Y);
  page.drawText("The defendant (the person, business, or public entity being sued) is:", { x: ML + 20, y: Y, size: fs, font: bold, color: BLACK });
  Y -= 16;
  page.drawText("Name:", { x: ML + 20, y: Y, size: sfs, font, color: GRAY });
  page.drawText(c.defendantName || "", { x: ML + 55, y: Y, size: fs, font, color: BLACK });
  page.drawText("Phone:", { x: PW / 2 + 50, y: Y, size: sfs, font, color: GRAY });
  page.drawText(c.defendantPhone || "", { x: PW / 2 + 85, y: Y, size: fs, font, color: BLACK });
  Y -= 14;
  page.drawText("Street address:", { x: ML + 20, y: Y, size: sfs, font, color: GRAY });
  Y -= 14;
  page.drawText(c.defendantAddress || "", { x: ML + 40, y: Y, size: fs, font, color: BLACK });
  page.drawText(c.defendantCity || "", { x: ML + 250, y: Y, size: fs, font, color: BLACK });
  page.drawText(c.defendantState || "CA", { x: PW / 2 + 110, y: Y, size: fs, font, color: BLACK });
  page.drawText(c.defendantZip || "", { x: PW / 2 + 160, y: Y, size: fs, font, color: BLACK });
  Y -= 10;
  page.drawLine({ start: { x: ML + 40, y: Y }, end: { x: ML + 240, y: Y }, thickness: 0.5, color: LIGHT_GRAY });
  page.drawLine({ start: { x: ML + 250, y: Y }, end: { x: PW / 2 + 100, y: Y }, thickness: 0.5, color: LIGHT_GRAY });
  page.drawLine({ start: { x: PW / 2 + 110, y: Y }, end: { x: PW / 2 + 150, y: Y }, thickness: 0.5, color: LIGHT_GRAY });
  page.drawLine({ start: { x: PW / 2 + 160, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: LIGHT_GRAY });
  Y -= 8;
  page.drawText("Street", { x: ML + 120, y: Y, size: 7, font: italic, color: GRAY });
  page.drawText("City", { x: ML + 330, y: Y, size: 7, font: italic, color: GRAY });
  page.drawText("State", { x: PW / 2 + 115, y: Y, size: 7, font: italic, color: GRAY });
  page.drawText("Zip", { x: PW / 2 + 170, y: Y, size: 7, font: italic, color: GRAY });
  Y -= 14;
  page.drawText("Mailing address (if different):", { x: ML + 20, y: Y, size: sfs, font, color: GRAY });
  Y -= 12;
  page.drawLine({ start: { x: ML + 40, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: LIGHT_GRAY });
  Y -= 18;

  page.drawText("If the defendant is a corporation, limited liability company, or public entity, list the person", { x: ML + 20, y: Y, size: sfs, font, color: BLACK });
  Y -= 10;
  page.drawText("or agent authorized for service of process here:", { x: ML + 20, y: Y, size: sfs, font, color: BLACK });
  Y -= 14;
  page.drawText("Name:", { x: ML + 20, y: Y, size: sfs, font, color: GRAY });
  page.drawText("Job title, if known:", { x: ML + 280, y: Y, size: sfs, font, color: GRAY });
  Y -= 12;
  page.drawText("Address:", { x: ML + 20, y: Y, size: sfs, font, color: GRAY });
  Y -= 12;
  page.drawLine({ start: { x: ML + 40, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: LIGHT_GRAY });
  Y -= 16;

  drawCheckBox(page, ML + 30, Y, false, font);
  page.drawText("Check here if your case is against more than one defendant and attach form SC-100A.", { x: ML + 44, y: Y, size: sfs, font, color: BLACK });
  Y -= 12;
  drawCheckBox(page, ML + 30, Y, false, font);
  page.drawText("Check here if any defendant is on active military duty and write defendant's name here:", { x: ML + 44, y: Y, size: sfs, font, color: BLACK });
  Y -= 18;

  page.drawLine({ start: { x: ML, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: BLACK });
  Y -= 16;

  numCircle("3", ML, Y);
  page.drawText("The plaintiff claims the defendant owes $", { x: ML + 20, y: Y, size: fs, font: bold, color: BLACK });
  page.drawText(c.amountClaimed || "0.00", { x: ML + 230, y: Y, size: fs, font: bold, color: BLACK });
  page.drawText(". (Explain below and on next page.)", { x: ML + 300, y: Y, size: fs, font, color: BLACK });
  Y -= 16;
  page.drawText("a. Why does the defendant owe the plaintiff money?", { x: ML + 20, y: Y, size: sfs, font: bold, color: BLACK });
  Y -= 14;

  const linesToShow = needsMC031 ? ["See attached form MC-031"] : descLines.slice(0, MAX_DESC_LINES);
  for (const line of linesToShow) {
    page.drawText(line, { x: ML + 30, y: Y, size: fs, font, color: BLACK });
    Y -= 13;
  }

  pageFooter(page, font, bold, 2);
}

function buildPage3(pdfDoc: PDFDocument, c: any, font: PDFFont, bold: PDFFont, italic: PDFFont, fs: number, sfs: number, hfs: number, calcLines: string[], needsMC031: boolean) {
  const page = pdfDoc.addPage([PW, PH]);
  let Y = pageHeader(page, font, bold, c.plaintiffName || "", "");

  const numCircle = (n: string, x: number, y: number) => {
    page.drawCircle({ x: x + 5, y: y + 3, size: 8, borderColor: BLACK, borderWidth: 0.7, color: rgb(1, 1, 1) });
    page.drawText(n, { x: x + 2, y: y, size: 9, font: bold, color: BLACK });
  };

  numCircle("3", ML, Y);
  page.drawText("b. When did this happen? (Date):", { x: ML + 20, y: Y, size: sfs, font: bold, color: BLACK });
  page.drawText(fmt(c.incidentDateStart), { x: ML + 175, y: Y, size: fs, font, color: BLACK });
  Y -= 14;
  page.drawText("If no specific date, give the time period:  Date started:", { x: ML + 30, y: Y, size: sfs, font, color: BLACK });
  page.drawText(fmt(c.incidentDateStart), { x: ML + 275, y: Y, size: fs, font, color: BLACK });
  page.drawText("Through:", { x: PW / 2 + 60, y: Y, size: sfs, font, color: BLACK });
  page.drawText(fmt(c.incidentDateEnd), { x: PW / 2 + 105, y: Y, size: fs, font, color: BLACK });
  Y -= 16;

  page.drawText("c. How did you calculate the money owed to you? (Do not include court costs or fees for service.)", { x: ML + 20, y: Y, size: sfs, font: bold, color: BLACK });
  Y -= 14;
  const calcToShow = calcLines.slice(0, MAX_CALC_LINES);
  for (const line of calcToShow) {
    page.drawText(line, { x: ML + 30, y: Y, size: fs, font, color: BLACK });
    Y -= 13;
  }
  Y -= 4;

  drawCheckBox(page, ML + 30, Y, needsMC031, font);
  page.drawText("Check here if you need more space. Attach one sheet of paper or form MC-031 and write \"SC-100, Item 3\" at", { x: ML + 44, y: Y, size: sfs, font, color: BLACK });
  Y -= 10;
  page.drawText("the top.", { x: ML + 44, y: Y, size: sfs, font, color: BLACK });
  Y -= 20;

  page.drawLine({ start: { x: ML, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: BLACK });
  Y -= 16;

  numCircle("4", ML, Y);
  page.drawText("You must ask the defendant (in person, in writing, or by phone) to pay you before you", { x: ML + 20, y: Y, size: sfs, font: bold, color: BLACK });
  Y -= 11;
  page.drawText("sue. If your claim is for possession of property, you must ask the defendant to give you", { x: ML + 20, y: Y, size: sfs, font: bold, color: BLACK });
  Y -= 11;
  page.drawText("the property. Have you done this?", { x: ML + 20, y: Y, size: sfs, font: bold, color: BLACK });
  Y -= 14;
  drawCheckBox(page, ML + 30, Y, c.demandMade === true, font);
  page.drawText("Yes", { x: ML + 44, y: Y, size: sfs, font, color: BLACK });
  drawCheckBox(page, ML + 80, Y, c.demandMade === false, font);
  page.drawText("No", { x: ML + 94, y: Y, size: sfs, font, color: BLACK });
  page.drawText("If no, explain why not:", { x: ML + 120, y: Y, size: sfs, font, color: GRAY });
  Y -= 14;
  if (c.demandDescription) {
    const demLines = wrapText(c.demandDescription, font, sfs, CW - 60);
    for (let i = 0; i < Math.min(demLines.length, 3); i++) {
      page.drawText(demLines[i], { x: ML + 30, y: Y, size: sfs, font, color: BLACK });
      Y -= 11;
    }
  }
  Y -= 10;

  page.drawLine({ start: { x: ML, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: BLACK });
  Y -= 16;

  numCircle("5", ML, Y);
  page.drawText("Why are you filing your claim at this courthouse?", { x: ML + 20, y: Y, size: fs, font: bold, color: BLACK });
  Y -= 14;
  page.drawText("This courthouse covers the area (check the one that applies):", { x: ML + 20, y: Y, size: sfs, font, color: BLACK });
  Y -= 14;

  const venueOptions = [
    { label: "(1) Where the defendant lives or does business.", value: "defendant_location" },
    { label: "(2) Where the plaintiff's property was damaged.", value: "property_damaged" },
    { label: "(3) Where the plaintiff was injured.", value: "plaintiff_injured" },
    { label: "(4) Where a contract was made, signed, performed, or broken.", value: "contract_location" },
  ];
  page.drawText("a.", { x: ML + 30, y: Y + 2, size: sfs, font: bold, color: BLACK });
  for (let i = 0; i < venueOptions.length; i++) {
    const opt = venueOptions[i];
    const col = i < 2 ? 0 : 1;
    const row = i % 2;
    const x = ML + 45 + col * 240;
    const y = Y - row * 12;
    const isChecked = (c.venueBasis || "").toLowerCase().includes(opt.value) ||
      (i === 0 && (c.venueBasis || "").toLowerCase().includes("defendant"));
    drawCheckBox(page, x, y, isChecked, font);
    page.drawText(opt.label, { x: x + 14, y: y, size: 7.5, font, color: BLACK });
  }
  Y -= 30;

  page.drawText("b.", { x: ML + 30, y: Y, size: sfs, font: bold, color: BLACK });
  drawCheckBox(page, ML + 45, Y, false, font);
  page.drawText("Where the buyer or lessee signed the contract, lives now, or lived when the contract was made...", { x: ML + 59, y: Y, size: 7.5, font, color: BLACK });
  Y -= 14;
  page.drawText("c.", { x: ML + 30, y: Y, size: sfs, font: bold, color: BLACK });
  drawCheckBox(page, ML + 45, Y, false, font);
  page.drawText("Where the buyer signed the contract (retail installment contract, like a credit card).", { x: ML + 59, y: Y, size: 7.5, font, color: BLACK });
  Y -= 14;
  page.drawText("d.", { x: ML + 30, y: Y, size: sfs, font: bold, color: BLACK });
  drawCheckBox(page, ML + 45, Y, false, font);
  page.drawText("Where the buyer signed the contract or vehicle is permanently garaged (vehicle finance sale).", { x: ML + 59, y: Y, size: 7.5, font, color: BLACK });
  Y -= 14;
  page.drawText("e.", { x: ML + 30, y: Y, size: sfs, font: bold, color: BLACK });
  drawCheckBox(page, ML + 45, Y, false, font);
  page.drawText("Other (specify):", { x: ML + 59, y: Y, size: 7.5, font, color: BLACK });
  Y -= 18;

  page.drawLine({ start: { x: ML, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: BLACK });
  Y -= 16;

  numCircle("6", ML, Y);
  page.drawText("List the zip code of the place checked in 5 above (if you know):", { x: ML + 20, y: Y, size: sfs, font, color: BLACK });
  page.drawText(c.plaintiffZip || "", { x: ML + 310, y: Y, size: fs, font, color: BLACK });
  Y -= 18;

  page.drawLine({ start: { x: ML, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: BLACK });
  Y -= 16;

  numCircle("7", ML, Y);
  page.drawText("Is your claim about an attorney-client fee dispute?", { x: ML + 20, y: Y, size: sfs, font: bold, color: BLACK });
  drawCheckBox(page, ML + 270, Y, c.disputeAttorneyFees === true, font);
  page.drawText("Yes", { x: ML + 284, y: Y, size: sfs, font, color: BLACK });
  drawCheckBox(page, ML + 310, Y, c.disputeAttorneyFees !== true, font);
  page.drawText("No", { x: ML + 324, y: Y, size: sfs, font, color: BLACK });
  Y -= 12;
  page.drawText("If yes, and if you have had arbitration, fill out form SC-101, attach it to this form, and check here:", { x: ML + 20, y: Y, size: 7.5, font, color: BLACK });
  drawCheckBox(page, PW - MR - 20, Y, false, font);
  Y -= 16;

  page.drawLine({ start: { x: ML, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: BLACK });
  Y -= 16;

  numCircle("8", ML, Y);
  page.drawText("Are you suing a public entity?", { x: ML + 20, y: Y, size: sfs, font: bold, color: BLACK });
  drawCheckBox(page, ML + 170, Y, c.suingPublicEntity === true, font);
  page.drawText("Yes", { x: ML + 184, y: Y, size: sfs, font, color: BLACK });
  drawCheckBox(page, ML + 210, Y, c.suingPublicEntity !== true, font);
  page.drawText("No", { x: ML + 224, y: Y, size: sfs, font, color: BLACK });
  Y -= 12;
  page.drawText("If yes, you must file a written claim with the entity first.    A claim was filed on (date):", { x: ML + 20, y: Y, size: 7.5, font, color: BLACK });
  Y -= 10;
  page.drawText("If the public entity denies your claim or does not answer within the time allowed by law, you can file this form.", { x: ML + 20, y: Y, size: 7.5, font, color: BLACK });

  pageFooter(page, font, bold, 3);
}

function buildPage4(pdfDoc: PDFDocument, c: any, font: PDFFont, bold: PDFFont, italic: PDFFont, fs: number, sfs: number, hfs: number) {
  const page = pdfDoc.addPage([PW, PH]);
  let Y = pageHeader(page, font, bold, c.plaintiffName || "", "");

  const numCircle = (n: string, x: number, y: number) => {
    page.drawCircle({ x: x + 5, y: y + 3, size: 8, borderColor: BLACK, borderWidth: 0.7, color: rgb(1, 1, 1) });
    page.drawText(n, { x: x + 1, y: y, size: 9, font: bold, color: BLACK });
  };

  numCircle("9", ML, Y);
  page.drawText("Have you filed more than 12 other small claims within the last 12 months in California?", { x: ML + 20, y: Y, size: sfs, font: bold, color: BLACK });
  Y -= 14;
  drawCheckBox(page, ML + 30, Y, c.filedOver12 === true, font);
  page.drawText("Yes", { x: ML + 44, y: Y, size: sfs, font, color: BLACK });
  drawCheckBox(page, ML + 80, Y, c.filedOver12 !== true, font);
  page.drawText("No", { x: ML + 94, y: Y, size: sfs, font, color: BLACK });
  page.drawText("If yes, the filing fee for this case will be higher.", { x: ML + 120, y: Y, size: sfs, font, color: BLACK });
  Y -= 20;

  page.drawLine({ start: { x: ML, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: BLACK });
  Y -= 16;

  numCircle("10", ML, Y);
  page.drawText("Is your claim for more than $2,500?", { x: ML + 20, y: Y, size: sfs, font: bold, color: BLACK });
  const over2500 = parseFloat(c.amountClaimed || "0") > 2500;
  drawCheckBox(page, ML + 200, Y, over2500, font);
  page.drawText("Yes", { x: ML + 214, y: Y, size: sfs, font, color: BLACK });
  drawCheckBox(page, ML + 245, Y, !over2500, font);
  page.drawText("No", { x: ML + 259, y: Y, size: sfs, font, color: BLACK });
  Y -= 12;
  page.drawText("If you answer yes, you also confirm that you have not filed, and you understand that you may not file, more than two", { x: ML + 20, y: Y, size: 7.5, font, color: BLACK });
  Y -= 10;
  page.drawText("small claims cases for more than $2,500 in California during this calendar year.", { x: ML + 20, y: Y, size: 7.5, font, color: BLACK });
  Y -= 20;

  page.drawLine({ start: { x: ML, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: BLACK });
  Y -= 16;

  numCircle("11", ML, Y);
  page.drawText("I understand that by filing a claim in small claims court, I have no right to appeal this", { x: ML + 20, y: Y, size: sfs, font: bold, color: BLACK });
  Y -= 11;
  page.drawText("claim.", { x: ML + 20, y: Y, size: sfs, font: bold, color: BLACK });
  Y -= 30;

  page.drawLine({ start: { x: ML, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: BLACK });
  Y -= 14;
  page.drawText("I declare under penalty of perjury under the laws of the State of California that the information above and on any", { x: ML, y: Y, size: sfs, font, color: BLACK });
  Y -= 10;
  page.drawText("attachments to this form is true and correct.", { x: ML, y: Y, size: sfs, font, color: BLACK });
  Y -= 20;

  page.drawText("Date:", { x: ML, y: Y, size: sfs, font, color: BLACK });
  page.drawLine({ start: { x: ML + 30, y: Y - 2 }, end: { x: ML + 150, y: Y - 2 }, thickness: 0.5, color: LIGHT_GRAY });
  Y -= 20;

  page.drawLine({ start: { x: ML, y: Y - 2 }, end: { x: ML + 220, y: Y - 2 }, thickness: 0.5, color: LIGHT_GRAY });
  page.drawLine({ start: { x: PW / 2 + 30, y: Y - 2 }, end: { x: PW - MR, y: Y - 2 }, thickness: 0.5, color: LIGHT_GRAY });
  Y -= 10;
  page.drawText("Plaintiff types or prints name here", { x: ML + 30, y: Y, size: 7, font: italic, color: GRAY });
  page.drawText("Plaintiff signs here", { x: PW / 2 + 100, y: Y, size: 7, font: italic, color: GRAY });
  Y -= 20;

  page.drawText("Date:", { x: ML, y: Y, size: sfs, font, color: BLACK });
  page.drawLine({ start: { x: ML + 30, y: Y - 2 }, end: { x: ML + 150, y: Y - 2 }, thickness: 0.5, color: LIGHT_GRAY });
  Y -= 20;
  page.drawLine({ start: { x: ML, y: Y - 2 }, end: { x: ML + 220, y: Y - 2 }, thickness: 0.5, color: LIGHT_GRAY });
  page.drawLine({ start: { x: PW / 2 + 30, y: Y - 2 }, end: { x: PW - MR, y: Y - 2 }, thickness: 0.5, color: LIGHT_GRAY });
  Y -= 10;
  page.drawText("Second plaintiff types or prints name here", { x: ML + 15, y: Y, size: 7, font: italic, color: GRAY });
  page.drawText("Second plaintiff signs here", { x: PW / 2 + 80, y: Y, size: 7, font: italic, color: GRAY });
  Y -= 40;

  page.drawRectangle({ x: ML, y: Y - 50, width: CW, height: 50, borderColor: BLACK, borderWidth: 0.5, color: rgb(0.97, 0.97, 0.97) });
  page.drawText("Requests for Accommodations", { x: ML + 20, y: Y - 15, size: sfs, font: bold, color: BLACK });
  page.drawText("Assistive listening systems, computer-assisted real-time captioning, or sign language interpreter", { x: ML + 20, y: Y - 27, size: 7, font, color: BLACK });
  page.drawText("services are available if you ask at least five days before the trial. For these and other accommodations,", { x: ML + 20, y: Y - 37, size: 7, font, color: BLACK });
  page.drawText("contact the clerk's office for form MC-410, Disability Accommodation Request. (Civ. Code, § 54.8.)", { x: ML + 20, y: Y - 47, size: 7, font, color: BLACK });

  pageFooter(page, font, bold, 4);
}

function buildMC031(pdfDoc: PDFDocument, c: any, font: PDFFont, bold: PDFFont, italic: PDFFont, fs: number, sfs: number, descLines: string[]) {
  const page = pdfDoc.addPage([PW, PH]);
  let Y = PH - MT;

  page.drawText("ATTACHMENT TO", { x: ML, y: Y, size: 12, font: bold, color: BLACK });
  page.drawText("Judicial Council Form", { x: PW - MR - 130, y: Y, size: sfs, font: italic, color: GRAY });
  Y -= 14;
  page.drawText("(Use a separate page for each attachment.)", { x: ML, y: Y, size: sfs, font: italic, color: GRAY });
  Y -= 20;

  page.drawLine({ start: { x: ML, y: Y }, end: { x: PW - MR, y: Y }, thickness: 1, color: BLACK });
  Y -= 16;

  page.drawText("SC-100, Item 3", { x: ML, y: Y, size: fs, font: bold, color: BLACK });
  Y -= 20;

  page.drawText("Case Name:", { x: ML, y: Y, size: sfs, font, color: GRAY });
  page.drawText(`${c.plaintiffName || ""} vs. ${c.defendantName || ""}`, { x: ML + 65, y: Y, size: fs, font, color: BLACK });
  Y -= 14;
  page.drawText("Case Number:", { x: PW - MR - 150, y: Y + 14, size: sfs, font, color: GRAY });
  Y -= 10;

  page.drawLine({ start: { x: ML, y: Y }, end: { x: PW - MR, y: Y }, thickness: 0.5, color: BLACK });
  Y -= 20;

  page.drawText("3a. Why does the defendant owe the plaintiff money? (continued)", { x: ML, y: Y, size: fs, font: bold, color: BLACK });
  Y -= 18;

  for (const line of descLines) {
    if (Y < 60) {
      const newPage = pdfDoc.addPage([PW, PH]);
      Y = PH - MT;
      newPage.drawText("SC-100, Item 3 (continued)", { x: ML, y: Y, size: fs, font: bold, color: BLACK });
      Y -= 18;
      newPage.drawText(line, { x: ML, y: Y, size: fs, font, color: BLACK });
      Y -= 14;
    } else {
      page.drawText(line, { x: ML, y: Y, size: fs, font, color: BLACK });
      Y -= 14;
    }
  }

  Y -= 20;
  page.drawLine({ start: { x: ML, y: 50 }, end: { x: PW - MR, y: 50 }, thickness: 0.5, color: LIGHT_GRAY });
  page.drawText("MC-031 — Attachment to SC-100, Item 3", { x: ML, y: 38, size: 7, font, color: GRAY });
}

router.get("/cases/:caseId/forms/sc100.docx", requireAuth, async (req: any, res) => {
  try {
    const caseId = parseInt(req.params.caseId);
    const [c] = await db.select().from(casesTable)
      .where(and(eq(casesTable.id, caseId), eq(casesTable.userId, req.userId)));
    if (!c) return res.status(404).json({ error: "Case not found." });

    const {
      Document, Packer, Paragraph, TextRun, HeadingLevel,
      AlignmentType, BorderStyle, Table, TableRow, TableCell,
      WidthType, ShadingType, PageBreak,
    } = await import("docx");

    const hrBorder = {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    };

    const b = (t: string) => new TextRun({ text: t, bold: true, font: "Times New Roman", size: 22 });
    const n = (t: string) => new TextRun({ text: t, font: "Times New Roman", size: 22 });
    const sm = (t: string) => new TextRun({ text: t, font: "Times New Roman", size: 18, color: "666666" });
    const it = (t: string) => new TextRun({ text: t, font: "Times New Roman", size: 18, italics: true, color: "888888" });

    const hr = () => new Paragraph({ border: hrBorder, spacing: { after: 100 }, children: [] });
    const space = (before = 100, after = 50) => new Paragraph({ spacing: { before, after }, children: [] });

    const labelValue = (label: string, value: string) =>
      new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [sm(label + "  "), n(value)] });

    const needsMC031 = (c.claimDescription || "").length > 400;

    const children: any[] = [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 40 },
        children: [sm("Clerk stamps date here when form is filed.")],
      }),
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({ text: "SC-100", bold: true, font: "Times New Roman", size: 28 }),
          new TextRun({ text: "    Plaintiff's Claim and ORDER to Go to Small Claims Court", bold: true, font: "Times New Roman", size: 24 }),
        ],
      }),
      hr(),

      new Paragraph({ spacing: { before: 100 }, children: [b("Notice to the person being sued:")] }),
      new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [
        n("You are the defendant if your name is listed in (2) on page 2. The person suing you is the plaintiff, listed in (1) on page 2."),
      ] }),
      new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [
        n("You and the plaintiff must go to court on the trial date listed below. If you do not go to court, you may lose the case."),
      ] }),
      new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [
        n("Bring witnesses, receipts, and any evidence you need to prove your case."),
      ] }),
      hr(),

      new Paragraph({ spacing: { before: 100 }, children: [b("Fill in court name and street address:")] }),
      labelValue("Superior Court of California, County of", c.county || "_______________"),
      labelValue("Courthouse:", c.courthouse || ""),
      hr(),

      new Paragraph({ spacing: { before: 100 }, children: [b("Order to Go to Court")] }),
      new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [
        n("The people in (1) and (2) must attend court. (Clerk fills out trial date.)"),
      ] }),
      hr(),

      new Paragraph({ spacing: { before: 200 }, children: [b("1. The Plaintiff (the person, business, or public entity that is suing) is:")] }),
      labelValue("Name:", c.plaintiffName || ""),
      labelValue("Street Address:", c.plaintiffAddress || ""),
      new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [
        sm("City: "), n(c.plaintiffCity || ""), sm("    State: "), n(c.plaintiffState || "CA"), sm("    Zip: "), n(c.plaintiffZip || ""),
      ] }),
      labelValue("Phone:", c.plaintiffPhone || ""),
      labelValue("Email:", c.plaintiffEmail || ""),
      hr(),

      new Paragraph({ spacing: { before: 200 }, children: [b("2. The Defendant (the person, business, or public entity being sued) is:")] }),
      labelValue("Name:", c.defendantName || ""),
      labelValue("Street Address:", c.defendantAddress || ""),
      new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [
        sm("City: "), n(c.defendantCity || ""), sm("    State: "), n(c.defendantState || "CA"), sm("    Zip: "), n(c.defendantZip || ""),
      ] }),
      labelValue("Phone:", c.defendantPhone || ""),
      hr(),

      new Paragraph({ spacing: { before: 200 }, children: [
        b(`3. The plaintiff claims the defendant owes $${c.amountClaimed || "0.00"}`),
        n(". (Explain below and on next page.)"),
      ] }),
      new Paragraph({ spacing: { before: 100 }, indent: { left: 360 }, children: [b("a. Why does the defendant owe the plaintiff money?")] }),
    ];

    if (needsMC031) {
      children.push(new Paragraph({ spacing: { after: 40 }, indent: { left: 720 }, children: [n("See attached form MC-031")] }));
    } else {
      children.push(new Paragraph({ spacing: { after: 40 }, indent: { left: 720 }, children: [n(c.claimDescription || "Not specified")] }));
    }

    children.push(
      new Paragraph({ spacing: { before: 100 }, indent: { left: 360 }, children: [b("b. When did this happen?")] }),
      new Paragraph({ spacing: { after: 40 }, indent: { left: 720 }, children: [
        sm("Date started: "), n(fmt(c.incidentDateStart)),
        sm("    Through: "), n(fmt(c.incidentDateEnd)),
      ] }),

      new Paragraph({ spacing: { before: 100 }, indent: { left: 360 }, children: [b("c. How did you calculate the money owed to you?")] }),
      new Paragraph({ spacing: { after: 40 }, indent: { left: 720 }, children: [n(c.howAmountCalculated || "Not specified")] }),
      hr(),

      new Paragraph({ spacing: { before: 200 }, children: [b("4. Have you asked the defendant to pay?")] }),
      new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [
        n(c.demandMade ? "☑ Yes" : "☐ Yes"), n("    "),
        n(!c.demandMade ? "☑ No" : "☐ No"),
      ] }),
    );
    if (c.demandDescription) {
      children.push(new Paragraph({ spacing: { after: 40 }, indent: { left: 720 }, children: [n(c.demandDescription)] }));
    }

    children.push(
      hr(),
      new Paragraph({ spacing: { before: 200 }, children: [b("5. Why are you filing at this courthouse?")] }),
      new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [n(c.venueBasis || "Not specified")] }),
      hr(),

      new Paragraph({ spacing: { before: 200 }, children: [b("6. Zip code of the place checked in 5:")] }),
      new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [n(c.plaintiffZip || "")] }),
      hr(),

      new Paragraph({ spacing: { before: 200 }, children: [b("7. Is your claim about an attorney-client fee dispute?")] }),
      new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [
        n(c.disputeAttorneyFees ? "☑ Yes" : "☐ Yes"), n("    "),
        n(!c.disputeAttorneyFees ? "☑ No" : "☐ No"),
      ] }),
      hr(),

      new Paragraph({ spacing: { before: 200 }, children: [b("8. Are you suing a public entity?")] }),
      new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [
        n(c.suingPublicEntity ? "☑ Yes" : "☐ Yes"), n("    "),
        n(!c.suingPublicEntity ? "☑ No" : "☐ No"),
      ] }),
      hr(),

      new Paragraph({ spacing: { before: 200 }, children: [b("9. Have you filed more than 12 other small claims in the last 12 months?")] }),
      new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [
        n(c.filedOver12 ? "☑ Yes" : "☐ Yes"), n("    "),
        n(!c.filedOver12 ? "☑ No" : "☐ No"),
      ] }),
      hr(),

      new Paragraph({ spacing: { before: 200 }, children: [b("10. Is your claim for more than $2,500?")] }),
      new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: (() => {
        const over = parseFloat(c.amountClaimed || "0") > 2500;
        return [
          n(over ? "☑ Yes" : "☐ Yes"), n("    "),
          n(!over ? "☑ No" : "☐ No"),
        ];
      })() }),
      hr(),

      new Paragraph({ spacing: { before: 200 }, children: [b("11. I understand that by filing a claim in small claims court, I have no right to appeal this claim.")] }),
      hr(),

      new Paragraph({ spacing: { before: 100 }, children: [
        n("I declare under penalty of perjury under the laws of the State of California that the information above and on any attachments to this form is true and correct."),
      ] }),
      space(200, 50),
      new Paragraph({ children: [
        sm("Date: _______________"),
        n("                                                    "),
        sm("_______________________________"),
      ] }),
      new Paragraph({ children: [
        it("Plaintiff types or prints name here"),
        n("                                              "),
        it("Plaintiff signs here"),
      ] }),
      space(200, 50),
      new Paragraph({ children: [
        sm("Date: _______________"),
        n("                                                    "),
        sm("_______________________________"),
      ] }),
      new Paragraph({ children: [
        it("Second plaintiff types or prints name here"),
        n("                                    "),
        it("Second plaintiff signs here"),
      ] }),
    );

    if (needsMC031) {
      children.push(
        new Paragraph({ children: [new TextRun({ break: 1, text: "" }), new TextRun({ text: "", break: 1 })], pageBreakBefore: true }),
        new Paragraph({ spacing: { after: 80 }, children: [
          new TextRun({ text: "ATTACHMENT TO JUDICIAL COUNCIL FORM", bold: true, font: "Times New Roman", size: 24 }),
        ] }),
        new Paragraph({ spacing: { after: 40 }, children: [it("(Use a separate page for each attachment.)")] }),
        hr(),
        new Paragraph({ spacing: { before: 100 }, children: [b("SC-100, Item 3")] }),
        labelValue("Case Name:", `${c.plaintiffName || ""} vs. ${c.defendantName || ""}`),
        hr(),
        new Paragraph({ spacing: { before: 100 }, children: [b("3a. Why does the defendant owe the plaintiff money? (continued)")] }),
        new Paragraph({ spacing: { before: 80, after: 80 }, indent: { left: 360 }, children: [n(c.claimDescription || "Not specified")] }),
        hr(),
        new Paragraph({ spacing: { before: 200 }, shading: { type: ShadingType.SOLID, color: "F5F5F5" }, children: [
          sm("MC-031 — Attachment to SC-100, Item 3"),
        ] }),
      );
    }

    children.push(
      space(300, 50),
      new Paragraph({
        shading: { type: ShadingType.SOLID, color: "F5F5F5" },
        children: [sm("Generated by Small Claims Genie — for reference only. Use official SC-100 for filing.")],
      }),
    );

    const doc = new Document({
      sections: [{
        properties: {
          page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } },
        },
        children,
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    const fileName = `SC-100_${(c.plaintiffName || "Case").replace(/\s+/g, "_")}.docx`;
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

export default router;
