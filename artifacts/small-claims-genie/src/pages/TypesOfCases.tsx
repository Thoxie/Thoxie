import { PublicLayout } from "@/components/layout/PublicLayout";

const caseTypes = [
  {
    title: "Personal Loans & IOUs",
    description:
      "Unpaid personal loans, shared expenses, or repayment promises that never happened. We help you organize texts, payment trails, and a timeline that shows the agreement, the amount, and the failure to repay.",
  },
  {
    title: "Online Purchases",
    description:
      "Non-delivery, counterfeit items, damaged goods, chargeback disputes, or refused refunds. We help you assemble order history, messages, tracking, photos, and the exact amount owed.",
  },
  {
    title: "Contractors / Home Services",
    description:
      "Incomplete work, poor workmanship, delays, or payment disputes with contractors. We help you document scope, change requests, milestones, invoices, and the cost to finish or fix the work.",
  },
  {
    title: "Landlord / Tenant Disputes",
    description:
      "Security deposit disputes, unlawful deductions, habitability issues, rent-related disputes, or repair reimbursement. We help you structure move-in/move-out evidence, repair quotes, written notices, and a damages breakdown that's easy for a judge to follow.",
  },
  {
    title: "Injury (Out-of-Pocket Costs)",
    description:
      "Recover medical bills, treatment costs, replacement costs, and other out-of-pocket expenses from minor incidents. We help you package receipts, medical documentation, and a simple causation narrative that stays focused and credible.",
  },
  {
    title: "Auto Repair",
    description:
      'Disputes over bad repairs, overcharging, unauthorized work, "fixed" problems that return, or vehicles returned worse than before. We help you collect invoices, estimates, photos, and any expert notes to support a refund or repair-cost claim.',
  },
  {
    title: "Airlines and Travel Problems",
    description:
      "Sue for lost baggage, delays, denied boarding, damaged items, or out-of-pocket expenses. We help you document what happened, what you spent, what you requested from the airline, and how to present it clearly in court.",
  },
  {
    title: "Airbnb / VRBO / Hotel Issues",
    description:
      "File temporary vacation rental related claims for cancellations, unsafe conditions, property damage, withheld deposits, or misrepresentation. We help you organize messages, photos, receipts, and a clean timeline so your damages are easy to prove.",
  },
];

export default function TypesOfCases() {
  return (
    <PublicLayout>
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy leading-tight mb-4">
            Types of Small Claims
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mb-8">
            Small Claims Genie helps you navigate small claims by identifying the right jurisdiction and venue, organizing your evidence, preparing court-ready documents, guiding service steps, and getting you ready for court.
          </p>
          <p className="text-base font-semibold text-navy mb-10">
            Here are some of the most common types of disputes we help you prepare:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {caseTypes.map((caseType) => (
              <div
                key={caseType.title}
                className="bg-white rounded-xl p-8 border border-border/60"
              >
                <h3 className="text-xl font-bold text-navy mb-3">
                  {caseType.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {caseType.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
