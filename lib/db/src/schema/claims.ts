import { pgTable, text, serial, timestamp, numeric, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const claimsTable = pgTable("claims", {
  id: serial("id").primaryKey(),
  status: text("status").notNull().default("draft"),
  courtName: text("court_name"),
  courtAddress: text("court_address"),
  caseNumber: text("case_number"),
  plaintiffName: text("plaintiff_name").notNull(),
  plaintiffAddress: text("plaintiff_address"),
  plaintiffCity: text("plaintiff_city"),
  plaintiffState: text("plaintiff_state"),
  plaintiffZip: text("plaintiff_zip"),
  plaintiffPhone: text("plaintiff_phone"),
  plaintiffEmail: text("plaintiff_email"),
  defendantName: text("defendant_name").notNull(),
  defendantAddress: text("defendant_address"),
  defendantCity: text("defendant_city"),
  defendantState: text("defendant_state"),
  defendantZip: text("defendant_zip"),
  defendantPhone: text("defendant_phone"),
  claimAmount: numeric("claim_amount", { precision: 10, scale: 2 }).notNull(),
  claimDescription: text("claim_description").notNull(),
  claimDate: text("claim_date"),
  filingReasonLocation: text("filing_reason_location"),
  filingReasonZip: text("filing_reason_zip"),
  isAttorneyClientDispute: boolean("is_attorney_client_dispute").default(false),
  isSuingPublicEntity: boolean("is_suing_public_entity").default(false),
  publicEntityClaimDate: text("public_entity_claim_date"),
  hasFiledMoreThan12: boolean("has_filed_more_than_12").default(false),
  isClaimMoreThan2500: boolean("is_claim_more_than_2500").default(false),
  trialDate: text("trial_date"),
  trialTime: text("trial_time"),
  trialDepartment: text("trial_department"),
  numberOfDefendants: integer("number_of_defendants").default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertClaimSchema = createInsertSchema(claimsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claimsTable.$inferSelect;
