import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { FileText, Scale, BookOpen, HelpCircle, ExternalLink, Sparkles } from "lucide-react";

const officialForms = [
  {
    title: "SC-100 — Plaintiff's Claim and Order",
    description: "The main form you file to start your small claims case.",
    url: "https://www.courts.ca.gov/documents/sc100.pdf",
  },
  {
    title: "SC-101 — Additional Defendants",
    description: "Use this if you are suing more than two defendants.",
    url: "https://www.courts.ca.gov/documents/sc101.pdf",
  },
  {
    title: "SC-104 — Proof of Service",
    description: "Required after serving the defendant with court papers.",
    url: "https://www.courts.ca.gov/documents/sc104.pdf",
  },
  {
    title: "SC-120 — Defendant's Claim and Order",
    description: "If the defendant wants to counter-sue you (filed by defendant).",
    url: "https://www.courts.ca.gov/documents/sc120.pdf",
  },
];

const selfHelp = [
  {
    title: "Small Claims Overview — California Courts",
    description: "Official California Judicial Branch guide to small claims court.",
    url: "https://www.courts.ca.gov/selfhelp-smallclaims.htm",
  },
  {
    title: "Small Claims Advisor Program",
    description: "Free legal advice from certified advisors before you file.",
    url: "https://www.courts.ca.gov/1196.htm",
  },
  {
    title: "Find Your Local Courthouse",
    description: "Search for your county courthouse by zip code.",
    url: "https://www.courts.ca.gov/find-my-court.htm",
  },
  {
    title: "Filing Fees Waiver (Fee Waiver)",
    description: "Apply to waive filing fees if you cannot afford them.",
    url: "https://www.courts.ca.gov/documents/fw001.pdf",
  },
];

const rules = [
  {
    title: "Small Claims Limits (2026)",
    description: "Individuals may claim up to $12,500. Businesses limited to $6,250.",
    url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=116.220.&lawCode=CCP",
  },
  {
    title: "Statute of Limitations",
    description: "How long you have to file — varies by claim type. Act fast.",
    url: "https://www.courts.ca.gov/1201.htm",
  },
  {
    title: "Service of Process Rules",
    description: "How you are required to legally notify the defendant.",
    url: "https://www.courts.ca.gov/1202.htm",
  },
  {
    title: "What Happens at the Hearing",
    description: "What to expect on your court date and how to prepare.",
    url: "https://www.courts.ca.gov/1207.htm",
  },
];

const commonFaqs = [
  {
    question: "Can I bring a lawyer to small claims court?",
    answer: "No. Lawyers are NOT allowed to represent clients in California small claims hearings.",
  },
  {
    question: "What if the defendant doesn't show up?",
    answer: "If properly served, the judge will likely rule in your favor by default.",
  },
  {
    question: "What if I lose?",
    answer: "You can appeal within 30 days. The defendant can also appeal.",
  },
  {
    question: "How do I collect my money after winning?",
    answer: "Winning a judgment doesn't automatically mean you'll be paid. You may need to garnish wages or levy a bank account.",
  },
];

function ResourceCard({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-xl p-6 border border-border/60 flex flex-col justify-between hover:shadow-md transition-shadow group"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-bold text-navy">{title}</h3>
          <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{description}</p>
      </div>
      <span className="text-sm font-medium text-navy group-hover:underline flex items-center gap-1">
        Open official resource
        <ExternalLink className="h-3.5 w-3.5" />
      </span>
    </a>
  );
}

export default function CourtInfo() {
  return (
    <PublicLayout>
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy leading-tight mb-4">
            Resources
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mb-14">
            Official court forms, California Judicial Branch guides, and answers to the most common small claims questions — all in one place.
          </p>

          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-navy" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-navy">Official Court Forms</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {officialForms.map((form) => (
                <ResourceCard key={form.title} {...form} />
              ))}
            </div>
          </div>

          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Scale className="h-4 w-4 text-navy" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-navy">California Courts Self-Help</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {selfHelp.map((item) => (
                <ResourceCard key={item.title} {...item} />
              ))}
            </div>
          </div>

          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-navy" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-navy">Know the Rules</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {rules.map((item) => (
                <ResourceCard key={item.title} {...item} />
              ))}
            </div>
          </div>

          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-navy" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-navy">Common FAQs</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {commonFaqs.map((faq) => (
                <div key={faq.question} className="bg-white rounded-xl p-6 border border-border/60">
                  <h3 className="text-base font-bold text-navy mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-navy rounded-2xl p-10 md:p-14 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              Ready to Start Your Case?
            </h2>
            <p className="text-white/70 mb-6 max-w-xl mx-auto">
              Stop reading and start preparing. Small Claims Genie walks you through every step.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center justify-center rounded-full bg-gold px-8 text-base font-bold text-white shadow hover:bg-gold/90 transition-colors gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Start Your Case Free
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
