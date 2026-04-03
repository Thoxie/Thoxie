import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { documentsTable } from "./documents";

export const documentChunksTable = pgTable("document_chunks", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documentsTable.id, { onDelete: "cascade" }).notNull(),
  caseId: integer("case_id").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DocumentChunk = typeof documentChunksTable.$inferSelect;
