import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";

const cards = [
  {
    title: "Why Small Claims Genie Exists",
    items: [
      "Lawyers are not allowed in Small Claims Court",
      "AI-powered full-service legal guidance",
      "No need to retain a lawyer for advice",
    ],
  },
  {
    title: "AI-Guided Case Preparation",
    items: [
      "Instantly identifies what matters",
      "Know what to do next",
      "No legal jargon or guessing",
    ],
  },
  {
    title: "Avoid Costly Mistakes",
    items: [
      "Court-specific document builder",
      "Organized, credible paperwork",
      "Avoid rejections and delays",
    ],
  },
  {
    title: "Evidence Organization",
    items: [
      "Turns emails, texts, and receipts into a timeline",
      "Builds a clear narrative",
      "Presents a clean case judges can follow",
    ],
  },
  {
    title: "Step-by-Step Roadmap",
    items: [
      "Know what to do and when",
      "Prevent missed deadlines",
      "Stay organized from start to hearing",
    ],
  },
  {
    title: "Fast, Clear Answers",
    items: [
      "Understand options and risks",
      "No hourly legal fees",
      "Make confident decisions quickly",
    ],
  },
];

export default function HowItWorks() {
  return (
    <PublicLayout>
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy leading-tight mb-3">
            Lawyers aren't allowed in Small Claims Court.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6">
            Win with the power of AI.
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8">
            Don't retain a lawyer for advice when you can use Small Claims Genie — an AI-powered system built to guide your case from start to hearing.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex h-12 items-center justify-center rounded-full border-2 border-foreground/20 bg-white px-8 text-base font-semibold text-foreground hover:bg-foreground/5 transition-colors"
          >
            Start Preparing Your Case
          </Link>
        </div>
      </section>

      <section className="pb-16 md:pb-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            {cards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-xl p-8 border border-border/60"
              >
                <h3 className="text-xl font-bold text-navy mb-4">
                  {card.title}
                </h3>
                <ul className="space-y-2.5">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-navy shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl p-12 md:p-16 text-center border border-border/60">
            <h2 className="text-2xl md:text-4xl font-extrabold text-navy mb-4">
              Don't pay a lawyer. Use Small Claims Genie.
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Prepare smarter. File correctly. Present confidently.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
