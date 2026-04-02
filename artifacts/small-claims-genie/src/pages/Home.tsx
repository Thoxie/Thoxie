import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2, FileText, Scale, ArrowRight, FileCheck, HelpCircle } from "lucide-react";

export default function Home() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2400&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-medium text-accent mb-6">
            <Scale className="mr-2 h-4 w-4" />
            California Small Claims Assistance
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mb-6">
            Small Claims Court, <span className="text-accent">Simplified.</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mb-10">
            Professional guided preparation for non-lawyers. Court-ready forms, AI-powered intake, and demand letter generation for California small claims.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/sign-up" className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-8 text-base font-semibold text-primary shadow hover:bg-accent/90 transition-colors">
              Start Your Case
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/court" className="inline-flex h-12 items-center justify-center rounded-md border border-primary-foreground/20 bg-primary/50 backdrop-blur-sm px-8 text-base font-medium text-primary-foreground hover:bg-primary-foreground/10 transition-colors">
              Learn About The Process
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2">Why Choose Us</h2>
            <h3 className="text-3xl font-bold text-foreground">Everything you need to file</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">Guided Intake</h4>
              <p className="text-muted-foreground">Our 7-step wizard translates your story into the structured format required by California courts.</p>
            </div>
            
            <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-accent/20 text-accent rounded-lg flex items-center justify-center mb-4">
                <FileCheck className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">Demand Letters</h4>
              <p className="text-muted-foreground">Instantly generate professional demand letters, a strict requirement before filing a small claims case.</p>
            </div>
            
            <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">AI Assistant</h4>
              <p className="text-muted-foreground">Have a question? The Small Claims Genie is available 24/7 to guide you through terminology and procedures.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Types Section */}
      <section className="py-20 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Common Case Types</h2>
              <p className="text-lg text-muted-foreground">We help everyday people navigate a wide variety of civil disputes up to $12,500.</p>
              
              <ul className="space-y-3">
                {[
                  "Contractors & Home Services",
                  "Landlord & Tenant Disputes",
                  "Auto Repair Issues",
                  "Breach of Contract",
                  "Unrefunded Payments & Chargebacks",
                  "Airline & Travel Cancellations"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/sign-up" className="inline-flex mt-4 items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                Get Started
              </Link>
            </div>
            
            <div className="flex-1">
              <div className="rounded-xl overflow-hidden shadow-2xl border border-border/50">
                <img 
                  src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200&auto=format&fit=crop" 
                  alt="Legal documents on a desk" 
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to file your claim?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Don't let the legal process intimidate you. Organize your case, generate your forms, and get ready for court today.
          </p>
          <Link href="/sign-up" className="inline-flex h-14 items-center justify-center rounded-md bg-primary px-8 text-lg font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
            Create Free Account
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
