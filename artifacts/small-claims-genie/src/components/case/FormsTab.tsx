import { Button } from "@/components/ui/button";
import { FileDown, ExternalLink, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function FormsTab({ caseData }: { caseData: any }) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

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

  const handleDownloadSC100 = async () => {
    setDownloading(true);
    try {
      const basePath = import.meta.env.BASE_URL || "/";
      const token = await getToken();
      const res = await fetch(`${basePath}api/cases/${caseData.id}/forms/sc100`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to generate");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SC-100_${caseData.plaintiffName?.replace(/\s+/g, "_") || "Case"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "SC-100 downloaded!" });
    } catch {
      toast({ title: "Failed to generate SC-100", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Court Forms</h2>
        <p className="text-sm text-muted-foreground mt-1">Official fillable PDFs from the California Courts system.</p>
      </div>

      {caseData.intakeComplete ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <div className="mt-1 text-green-700"><SparklesIcon /></div>
          <div>
            <h4 className="font-semibold text-green-800">Auto-Fill Ready</h4>
            <p className="text-sm text-green-700 mt-1">
              Since you completed the intake wizard, our system can auto-fill SC-100 for you. Download the pre-filled version below.
            </p>
            <Button size="sm" className="mt-3 bg-navy hover:bg-navy/90 gap-2" onClick={handleDownloadSC100} disabled={downloading}>
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              {downloading ? "Generating..." : "Download Auto-Filled SC-100"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-gold/10 border-l-4 border-gold p-4 text-sm">
          <strong>Tip:</strong> Complete the Intake Wizard to enable auto-filling of your court forms.
        </div>
      )}

      <div className="grid gap-4">
        {forms.map((form) => (
          <div key={form.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl bg-white">
            <div className="mb-4 sm:mb-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-navy">{form.id}</h3>
                {form.required && (
                  <span className="bg-orange/10 text-orange text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">Required</span>
                )}
              </div>
              <p className="font-medium text-sm mt-1">{form.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{form.description}</p>
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <a href={form.url} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                Blank PDF <ExternalLink className="h-3.5 w-3.5" />
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
