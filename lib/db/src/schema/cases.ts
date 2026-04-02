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
