import { Button } from "@/components/ui/button";
import { FileDown, ExternalLink } from "lucide-react";

export function FormsTab({ caseData }: { caseData: any }) {
  const forms = [
    {
      id: "SC-100",
      title: "Plaintiff's Claim and ORDER to Go to Small Claims Court",
      description: "The primary form to start your lawsuit.",
      required: true,
      url: "https://www.courts.ca.gov/documents/sc100.pdf"
    },
    {
      id: "SC-104",
      title: "Proof of Service",
      description: "Tells the court that you correctly notified the defendant.",
      required: true,
      url: "https://www.courts.ca.gov/documents/sc104.pdf"
    },
    {
      id: "SC-101",
      title: "Other Plaintiffs or Defendants",
      description: "Attachment to SC-100 if there are more than 2 plaintiffs or defendants.",
      required: false,
      url: "https://www.courts.ca.gov/documents/sc101.pdf"
    },
    {
      id: "SC-120",
      title: "Defendant's Claim and ORDER to Go to Small Claims Court",
      description: "If the defendant counter-sues you.",
      required: false,
      url: "https://www.courts.ca.gov/documents/sc120.pdf"
    },
    {
      id: "FW-001",
      title: "Request to Waive Court Fees",
      description: "If you cannot afford the filing fee.",
      required: false,
      url: "https://www.courts.ca.gov/documents/fw001.pdf"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Court Forms</h2>
        <p className="text-muted-foreground">Official fillable PDFs from the California Courts system.</p>
      </div>

      {caseData.intakeComplete ? (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 text-primary flex items-start gap-3">
          <div className="mt-1"><SparklesIcon /></div>
          <div>
            <h4 className="font-semibold">Auto-Fill Ready</h4>
            <p className="text-sm mt-1">Since you completed the intake wizard, our system can auto-fill SC-100 for you. Download the pre-filled version below.</p>
            <Button size="sm" className="mt-3">
              <FileDown className="h-4 w-4 mr-2" />
              Download Auto-Filled SC-100
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-muted p-4 rounded-lg text-sm mb-6">
          <strong>Tip:</strong> Complete the Intake Wizard to enable auto-filling of your court forms.
        </div>
      )}

      <div className="grid gap-4">
        {forms.map((form) => (
          <div key={form.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-card">
            <div className="mb-4 sm:mb-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{form.id}</h3>
                {form.required && (
                  <span className="bg-accent/20 text-accent-foreground text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">Required</span>
                )}
              </div>
              <p className="font-medium text-sm mt-1">{form.title}</p>
              <p className="text-sm text-muted-foreground">{form.description}</p>
            </div>
            
            <Button variant="outline" asChild>
              <a href={form.url} target="_blank" rel="noreferrer" className="flex items-center">
                Blank PDF <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}