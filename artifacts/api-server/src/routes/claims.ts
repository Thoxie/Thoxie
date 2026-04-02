import { Router, type IRouter } from "express";
import { eq, desc, sql, count } from "drizzle-orm";
import { db, claimsTable, activitiesTable } from "@workspace/db";
import {
  CreateClaimBody,
  UpdateClaimBody,
  GetClaimParams,
  UpdateClaimParams,
  DeleteClaimParams,
  ListClaimsQueryParams,
  GetRecentActivityQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/claims", async (req, res): Promise<void> => {
  const params = ListClaimsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { status, limit = 50, offset = 0 } = params.data;

  let query = db.select().from(claimsTable).orderBy(desc(claimsTable.updatedAt)).limit(limit).offset(offset);

  if (status) {
    query = db.select().from(claimsTable).where(eq(claimsTable.status, status)).orderBy(desc(claimsTable.updatedAt)).limit(limit).offset(offset);
  }

  const claims = await query;

  let totalQuery;
  if (status) {
    totalQuery = await db.select({ count: count() }).from(claimsTable).where(eq(claimsTable.status, status));
  } else {
    totalQuery = await db.select({ count: count() }).from(claimsTable);
  }

  const total = totalQuery[0]?.count ?? 0;

  const formattedClaims = claims.map(c => ({
    ...c,
    claimAmount: Number(c.claimAmount),
  }));

  res.json({ claims: formattedClaims, total });
});

router.post("/claims", async (req, res): Promise<void> => {
  const parsed = CreateClaimBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = {
    ...parsed.data,
    claimAmount: String(parsed.data.claimAmount),
  };

  const [claim] = await db.insert(claimsTable).values(data).returning();

  await db.insert(activitiesTable).values({
    claimId: claim.id,
    action: "created",
    description: `Claim against ${claim.defendantName} created`,
  });

  res.status(201).json({ ...claim, claimAmount: Number(claim.claimAmount) });
});

router.get("/claims/:id", async (req, res): Promise<void> => {
  const params = GetClaimParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [claim] = await db.select().from(claimsTable).where(eq(claimsTable.id, params.data.id));

  if (!claim) {
    res.status(404).json({ error: "Claim not found" });
    return;
  }

  res.json({ ...claim, claimAmount: Number(claim.claimAmount) });
});

router.put("/claims/:id", async (req, res): Promise<void> => {
  const params = UpdateClaimParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateClaimBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.claimAmount != null) {
    updateData.claimAmount = String(parsed.data.claimAmount);
  }

  const [claim] = await db.update(claimsTable).set(updateData).where(eq(claimsTable.id, params.data.id)).returning();

  if (!claim) {
    res.status(404).json({ error: "Claim not found" });
    return;
  }

  const actionDescription = parsed.data.status
    ? `Claim status changed to ${parsed.data.status}`
    : `Claim against ${claim.defendantName} updated`;

  await db.insert(activitiesTable).values({
    claimId: claim.id,
    action: parsed.data.status ? "status_changed" : "updated",
    description: actionDescription,
  });

  res.json({ ...claim, claimAmount: Number(claim.claimAmount) });
});

router.delete("/claims/:id", async (req, res): Promise<void> => {
  const params = DeleteClaimParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [claim] = await db.delete(claimsTable).where(eq(claimsTable.id, params.data.id)).returning();

  if (!claim) {
    res.status(404).json({ error: "Claim not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const allClaims = await db.select().from(claimsTable);

  const totalClaims = allClaims.length;
  const draftClaims = allClaims.filter(c => c.status === "draft").length;
  const filedClaims = allClaims.filter(c => c.status === "filed" || c.status === "served" || c.status === "hearing_scheduled").length;
  const resolvedClaims = allClaims.filter(c => c.status === "resolved").length;
  const totalClaimValue = allClaims.reduce((sum, c) => sum + Number(c.claimAmount), 0);
  const upcomingHearings = allClaims.filter(c => c.status === "hearing_scheduled" && c.trialDate).length;

  res.json({
    totalClaims,
    draftClaims,
    filedClaims,
    resolvedClaims,
    totalClaimValue,
    upcomingHearings,
  });
});

router.get("/dashboard/recent-activity", async (req, res): Promise<void> => {
  const params = GetRecentActivityQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 10) : 10;

  const activities = await db
    .select()
    .from(activitiesTable)
    .orderBy(desc(activitiesTable.timestamp))
    .limit(limit);

  res.json({ activities });
});

export default router;
