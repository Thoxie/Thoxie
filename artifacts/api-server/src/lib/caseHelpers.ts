import { db } from "@workspace/db";
import { casesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export async function getCaseForUser(caseId: number, userId: string) {
  const [caseRecord] = await db
    .select()
    .from(casesTable)
    .where(and(eq(casesTable.id, caseId), eq(casesTable.userId, userId)));
  return caseRecord || null;
}
