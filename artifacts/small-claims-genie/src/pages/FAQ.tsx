import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { Sparkles } from "lucide-react";

const faqs = [
  {
    question: "How does Small Claims Genie help people file small claims cases?",
    answer:
      "Small Claims Genie turns the small-claims process into a guided workflow. You answer structured questions, and Small Claims Genie organizes the facts, calculates what's needed, and prepares court-ready documents so you're not hunting for the right forms, rules, and steps on your own.",
  },
  {
    question: "Do I need a lawyer to use Small Claims Genie?",
    answer:
      "No. Small claims court is designed so people can represent themselves. Small Claims Genie is built to guide you through the process without needing to hire an attorney, while helping you prepare a clean, organized presentation for court.",
  },
  {
    question: "Can Small Claims Genie help me understand whether I have a strong case?",
    answer:
      "Small Claims Genie can help analyze the facts you provide and highlight missing information or evidence that may strengthen your claim. While it cannot guarantee an outcome, it helps you organize the case so the key points are clear and supported.",
  },
  {
    question: "What evidence should I collect before filing?",
    answer:
      "Strong cases rely on clear documentation. Useful evidence may include receipts, contracts, text messages, emails, photos, repair estimates, invoices, and payment records. Small Claims Genie helps you organize these materials into a clear timeline so a judge can quickly understand what happened.",
  },
  {
    question: "How much does it cost to file a case?",
    answer:
      "Filing fees vary by court and by claim amount, and service costs vary depending on location and difficulty. Small Claims Genie's platform fee is separate from court fees and service costs, which are set by the local jurisdiction. In general: Small Claims Genie fee + court filing fee + service cost.",
  },
  {
    question: "Can I recover court fees if I win?",
    answer:
      "In many small claims courts, filing fees and certain service costs can be added to your claim and may be awarded if you win. Small Claims Genie helps you track these costs so they can be included properly when preparing your claim.",
  },
  {
    question: "What is the maximum amount I can sue for?",
    answer:
      "Small-claims limits are set by each state (and sometimes by court type). Small Claims Genie helps you stay within the limit for the court you're filing in, and if your damages exceed the limit, it can prompt you to choose a strategy — reduce the amount, or consider a different court option.",
  },
  {
    question: "What is the statute of limitations?",
    answer:
      "The statute of limitations is the deadline to file. Miss it, and the court may dismiss the case even if your facts are strong. The time limit depends on the claim type (contract, property damage, personal injury, etc.). Small Claims Genie helps you identify deadlines by asking what happened and when it happened.",
  },
  {
    question: "How do I know the correct court to file in?",
    answer:
      "Court selection depends on jurisdiction and venue — usually tied to where the defendant is located and where the dispute happened. Small Claims Genie helps you identify the correct court by collecting those key facts and using them to direct the filing to the proper place.",
  },
  {
    question: "Can I file a case against a business using Small Claims Genie?",
    answer:
      "Yes. Small claims courts commonly allow cases against businesses (contractors, landlords, retailers, and service providers). Small Claims Genie helps you capture the business details, what happened, and what you're asking for — then package it into a clean, court-ready presentation.",
  },
  {
    question: "What is a demand letter, and why does it matter?",
    answer:
      "A demand letter is a written request to resolve the issue before filing a lawsuit. It explains what happened, what you want, and gives a clear deadline to pay or fix the problem. Many disputes settle at this step. Small Claims Genie can help generate a professional demand letter that's structured, clear, and easy to support with receipts, messages, and timelines.",
  },
  {
    question: "Does Small Claims Genie handle service of process?",
    answer:
      "Every small-claims case requires formal notice to the defendant (service of process). Small Claims Genie guides you through service requirements and can support arranging professional service so the delivery is handled correctly and documented, which is often required before the court will proceed.",
  },
  {
    question: "Can I settle the case before the hearing?",
    answer:
      "Yes. Many disputes are resolved before the court date through negotiation or settlement. If both sides agree to a payment or resolution, the case can often be closed without appearing in court. Small Claims Genie helps you prepare your case so you're in a stronger position to negotiate.",
  },
  {
    question: "What should I expect during the court hearing?",
    answer:
      "Small claims hearings are usually brief and informal. Each side presents their explanation and evidence to the judge. The judge may ask questions and then decide either immediately or shortly after the hearing. Small Claims Genie helps you organize your presentation so the facts are clear and easy to follow.",
  },
  {
    question: "How long does a small claims case usually take?",
    answer:
      "The timeline depends on the court and how quickly the defendant is served. After filing, courts typically schedule hearings several weeks to a few months later. Small Claims Genie helps you prepare everything in advance so you're ready once the court sets the hearing date.",
  },
  {
    question: "What if the defendant files a counterclaim?",
    answer:
      "Sometimes the other party may file a claim against you related to the same dispute. If that happens, the court will usually hear both claims at the same hearing. Small Claims Genie helps you organize your response so you can address the counterclaim clearly.",
  },
  {
    question: "What happens after I win a case?",
    answer:
      "Winning a judgment means the court agrees the defendant owes you money. If the defendant pays voluntarily, the case is resolved. If they do not pay, additional steps may be required to collect the judgment. Small Claims Genie can help explain the common options available for enforcing a judgment.",
  },
  {
    question: "What if the defendant doesn't show up?",
    answer:
      "If properly served, the judge will likely rule in your favor by default.",
  },
  {
    question: "What happens if the defendant cannot be found?",
    answer:
      "Process servers typically attempt service multiple times. If they can't complete service, you may need a better address, a different service location, or additional steps to locate the defendant. Small Claims Genie helps you understand the next best option so the case doesn't stall.",
  },
  {
    question: "What if I lose the case?",
    answer:
      "If the court decides against your claim, the case usually ends at that point. In some situations there may be options to appeal or take other legal steps depending on local rules. Small Claims Genie helps you prepare a clear, well-supported case from the start to improve your chances.",
  },
  {
    question: "How do I collect my money after winning?",
    answer:
      "Winning a judgment doesn't automatically mean you'll be paid. You may need to garnish wages or levy a bank account.",
  },
  {
    question: "Is my information secure when using Small Claims Genie?",
    answer:
      "Small Claims Genie is designed to handle sensitive information responsibly. The platform stores case details securely and uses them only to help prepare your claim and related documents.",
  },
  {
    question: "Why use Small Claims Genie instead of filing on your own?",
    answer:
      "You can file on your own, but it often requires finding the correct forms, understanding court rules, organizing evidence, and completing service properly. Small Claims Genie streamlines this into a guided system so you can focus on what happened and what you can prove, while the platform structures it into court-ready outputs.",
  },
];

export default function FAQ() {
  return (
    <PublicLayout>
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy leading-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mb-12">
            Clear answers to common questions about how Small Claims Genie helps you prepare a small claims case. If you don't see your question here, describe what happened in plain English and Small Claims Genie will guide you.
          </p>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="bg-white rounded-xl p-6 md:p-8 border border-border/60"
              >
                <h3 className="text-base md:text-lg font-bold text-navy mb-3">
                  {faq.question}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white rounded-2xl p-10 md:p-14 text-center border border-border/60">
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy mb-3">
              Still have questions?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Start your case and ask the Genie directly — it knows your documents, your facts, and your county.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center justify-center rounded-full bg-gold px-8 text-base font-bold text-white shadow hover:bg-gold/90 transition-colors gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Ask the Genie
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
