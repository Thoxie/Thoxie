import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const casesTable = pgTable("cases", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  plaintiffName: text("plaintiff_name").default(""),
  plaintiffAddress: text("plaintiff_address").default(""),
  plaintiffCity: text("plaintiff_city").default(""),
  plaintiffState: text("plaintiff_state").default("CA"),
  plaintiffZip: text("plaintiff_zip").default(""),
  plaintiffPhone: text("plaintiff_phone").default(""),
  plaintiffEmail: text("plaintiff_email").default(""),
  defendantName: text("defendant_name").default(""),
  defendantAddress: text("defendant_address").default(""),
  defendantCity: text("defendant_city").default(""),
  defendantState: text("defendant_state").default("CA"),
  defendantZip: text("defendant_zip").default(""),
  defendantPhone: text("defendant_phone").default(""),
  claimType: text("claim_type").default(""),
  claimDescription: text("claim_description").default(""),
  amountClaimed: text("amount_claimed").default(""),
  howAmountCalculated: text("how_amount_calculated").default(""),
  isAttyFeeDispute: boolean("is_atty_fee_dispute").default(false),
  demandMade: boolean("demand_made").default(false),
  demandDescription: text("demand_description").default(""),
  incidentDateStart: text("incident_date_start").default(""),
  incidentDateEnd: text("incident_date_end").default(""),
  venueBasis: text("venue_basis").default(""),
  suingPublicEntity: boolean("suing_public_entity").default(false),
  disputeAttorneyFees: boolean("dispute_attorney_fees").default(false),
  filedOver12: boolean("filed_over_12").default(false),
  filedOver2500: boolean("filed_over_2500").default(false),
  county: text("county").default(""),
  courthouse: text("courthouse").default(""),
  intakeStep: integer("intake_step").default(1),
  intakeComplete: boolean("intake_complete").default(false),
  demandLetter: text("demand_letter"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCaseSchema = createInsertSchema(casesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof casesTable.$inferSelect;
