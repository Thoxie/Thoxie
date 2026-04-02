import { PublicLayout } from "@/components/layout/PublicLayout";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUser } from "@clerk/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FileText, Info, Building } from "lucide-react";

function Content() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">California Small Claims Court</h1>
        <p className="text-muted-foreground text-lg">Understanding the basics of the small claims process in California.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Building className="h-5 w-5 text-primary" />
              What is Small Claims Court?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Small claims court is a special court where disputes are resolved quickly and inexpensively. The rules are simple and informal. Lawyers are generally not allowed to represent parties in small claims court in California.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
              Limits & Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <strong>Individuals:</strong> Up to $12,500</li>
              <li>• <strong>Businesses:</strong> Up to $6,250</li>
              <li>• <strong>Filing Fee:</strong> $30 to $100 (depending on claim amount)</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">The Basic Steps</CardTitle>
          <CardDescription>The process to resolve a dispute in small claims court</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-6 relative border-l-2 border-muted ml-3">
            {[
              { title: "Ask for Payment (Demand)", desc: "Before you can sue, you must ask the other party to pay you. A written Demand Letter is the best way to prove you did this." },
              { title: "Identify the Defendant", desc: "You must know exactly who you are suing. If suing a business, you need their legal name and agent for service of process." },
              { title: "File Your Claim", desc: "Complete form SC-100 (Plaintiff's Claim) and file it with the court clerk in the correct county. Pay the filing fee." },
              { title: "Serve the Defendant", desc: "You must properly notify the defendant that they are being sued. You cannot do this yourself; it must be done by someone over 18 not involved in the case." },
              { title: "Go to Court", desc: "Present your case to the judge. Bring all your evidence, witnesses, and documents organized clearly." }
            ].map((step, i) => (
              <li key={i} className="pl-8 relative">
                <div className="absolute w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold -left-[13px] top-0 ring-4 ring-background">
                  {i + 1}
                </div>
                <h3 className="font-bold text-lg leading-none mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="bg-accent/10 border-accent/20">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-start">
            <Info className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-2">Need Official Resources?</h3>
              <p className="text-muted-foreground mb-4">
                Always check the official California Courts Self-Help website for the most up-to-date rules, forms, and procedures.
              </p>
              <a href="https://selfhelp.courts.ca.gov/small-claims" target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline inline-flex items-center">
                Visit CA Courts Self-Help <FileText className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CourtInfo() {
  const { isSignedIn } = useUser();
  
  if (isSignedIn) {
    return <AppLayout><Content /></AppLayout>;
  }
  
  return <PublicLayout><div className="container mx-auto py-12 px-4"><Content /></div></PublicLayout>;
}
