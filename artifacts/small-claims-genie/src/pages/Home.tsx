import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { FileText, Upload, ClipboardCheck, Sparkles, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <PublicLayout>
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy leading-tight mb-6">
            Win in Small Claims Court.<br />
            Don't lose because you're unprepared.<br />
            Get your money back!
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mb-8">
            Small Claims Genie walks you through every step — intake, evidence, AI chat,
            demand letters and your court-ready forms, ready to file. No lawyer needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/sign-up" className="inline-flex h-12 items-center justify-center rounded-full bg-[#2ecc71] hover:bg-[#27ae60] px-8 text-base font-bold text-white shadow transition-colors gap-2">
              <Sparkles className="h-4 w-4" />
              Start Your Case Free
            </Link>
            <Link href="/dashboard" className="inline-flex h-12 items-center justify-center rounded-full border-2 border-foreground/20 bg-white px-8 text-base font-semibold text-foreground hover:bg-foreground/5 transition-colors">
              Resume Your Case
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-background border-t border-border/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-border/60">
              <div className="h-10 w-10 bg-mint-dark rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-5 w-5 text-navy" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Court-Ready Intake Forms</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Guided 7-step intake collects every field required for your SC-100 — legally complete, nothing missed.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-border/60">
              <div className="h-10 w-10 bg-mint-dark rounded-lg flex items-center justify-center mb-4">
                <Upload className="h-5 w-5 text-navy" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Evidence That Speaks for You</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload receipts, contracts, texts, and photos. Our AI reads every document and builds your case argument.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-border/60">
              <div className="h-10 w-10 bg-mint-dark rounded-lg flex items-center justify-center mb-4">
                <ClipboardCheck className="h-5 w-5 text-navy" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Filing Guidance & Checklists</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Step-by-step filing instructions, courthouse details, and a readiness checklist for your specific county.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-2">How It Works</h2>
            <p className="text-muted-foreground">Three steps from dispute to ready-to-file.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#dbeafe]/50 rounded-xl p-6 border border-blue-200/40">
              <div className="text-4xl font-extrabold text-gold mb-2">01</div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                <FileText className="h-3.5 w-3.5" />
                7-Step Intake Wizard
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Tell Us What Happened</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Answer plain English questions about your dispute. No legal jargon — just the facts.
              </p>
            </div>
            <div className="bg-[#dbeafe]/50 rounded-xl p-6 border border-blue-200/40">
              <div className="text-4xl font-extrabold text-gold mb-2">02</div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                <Upload className="h-3.5 w-3.5" />
                AI Evidence Reader
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Upload Your Evidence</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Securely upload receipts, contracts, texts, and photos. Our AI reads every document so it can help you argue your case.
              </p>
            </div>
            <div className="bg-[#dbeafe]/50 rounded-xl p-6 border border-blue-200/40">
              <div className="text-4xl font-extrabold text-gold mb-2">03</div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                <ClipboardCheck className="h-3.5 w-3.5" />
                SC-100 Download
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Get Your Forms & File</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Download your completed demand letter, court ready forms, ready to file. Step-by-step filing instructions included for your county courthouse.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="types-of-cases" className="py-16 bg-mint-dark/50 border-t border-border/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-2">Types of Cases We Handle</h2>
            <p className="text-muted-foreground">We help with disputes up to $12,500 in California Small Claims Court.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Contractors & Home Services",
              "Landlord & Tenant Disputes",
              "Security Deposit",
              "Auto Repair Issues",
              "Breach of Contract",
              "Unrefunded Payments & Chargebacks",
              "Airline & Travel Cancellations",
              "Airbnb / VRBO / Hotel Issues",
              "Property Damage",
              "Personal Injury (minor)",
              "Online Purchases",
              "Loan Repayment"
            ].map((type) => (
              <div key={type} className="bg-white rounded-lg px-5 py-4 border border-border/60 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-gold shrink-0" />
                <span className="font-semibold text-sm text-navy">{type}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8 max-w-xl mx-auto">
            Not sure which one you have? Describe what happened in plain English. Small Claims Genie will classify the dispute, flag missing proof, and tell you the next step.
          </p>
        </div>
      </section>

      <section className="py-20 bg-navy text-white">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to file your claim?</h2>
          <p className="text-lg text-white/70 mb-8">
            Don't pay a lawyer. Use Small Claims Genie. Organize your case, generate your forms, and get ready for court today.
          </p>
          <Link href="/sign-up" className="inline-flex h-14 items-center justify-center rounded-full bg-orange px-10 text-lg font-bold text-white shadow-lg hover:opacity-90 transition-opacity">
            Start Your Case Free
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
