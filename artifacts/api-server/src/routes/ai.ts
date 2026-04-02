import { Router } from "express";
import { getAuth } from "@clerk/express";

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

const FAQ_ANSWERS: Record<string, string> = {
  "lawyer": "Lawyers are not allowed in California Small Claims Court. You represent yourself. However, you can consult with a lawyer before your hearing to prepare your case.",
  "cost": "Filing fees in California Small Claims Court range from $30 to $75 depending on the amount you're claiming. If you're claiming $1,500 or less, the fee is $30. For claims between $1,500.01 and $5,000, the fee is $50. For claims over $5,000 up to $10,000, the fee is $75.",
  "how long": "A small claims case typically takes 30 to 70 days from filing to hearing. After the hearing, the judge usually makes a decision immediately or within a few days.",
  "file": "To file a small claims case in California, you need to: 1) Fill out the SC-100 Plaintiff's Claim form, 2) File it with the clerk of the court in the correct county, 3) Pay the filing fee, 4) Have the defendant served with a copy of your claim.",
  "serve": "You must serve the defendant at least 15 days before the hearing (or 20 days if outside the county). You CANNOT serve the papers yourself. Use a friend over 18, a process server, or the sheriff's office.",
  "win": "If you win, the judge will issue a judgment in your favor. The defendant has 30 days to appeal. If they don't appeal, you can begin collecting the judgment. Methods include wage garnishment, bank levy, or property lien.",
  "appeal": "In California Small Claims Court, the defendant can appeal within 30 days of the judgment. The plaintiff CANNOT appeal — they chose this court. An appeal results in a new trial in Superior Court.",
  "limit": "The maximum amount you can sue for in California Small Claims Court is $10,000 for individuals and $5,000 for businesses or other entities.",
  "strong case": "A strong small claims case typically has: 1) Clear documentation (contracts, receipts, photos, messages), 2) A specific dollar amount you can justify, 3) Evidence that you tried to resolve the matter before filing, 4) A claim within the statute of limitations.",
  "settle": "Yes, you can settle at any time before or even during the hearing. Many cases settle once the defendant receives the claim. If you settle, put the agreement in writing and file a dismissal with the court.",
};

router.post("/ai/ask", requireAuth, async (req: any, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const lowerQ = question.toLowerCase();
    let answer = "I appreciate your question! While I can provide general information about California Small Claims Court procedures, I recommend consulting the California Courts Self-Help website (courts.ca.gov/selfhelp-smallclaims.htm) for the most current information. You can also visit your local Small Claims Advisor for free guidance before filing.\n\nFor specific legal advice about your situation, consider consulting with a licensed attorney.";

    for (const [key, value] of Object.entries(FAQ_ANSWERS)) {
      if (lowerQ.includes(key)) {
        answer = value;
        break;
      }
    }

    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: "An unexpected error occurred. Please try again." });
  }
});

export default router;
