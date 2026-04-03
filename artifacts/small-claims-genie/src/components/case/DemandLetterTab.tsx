import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/react";
import { useMutation } from "@tanstack/react-query";

const tones = [
  { id: "formal", label: "Formal", desc: "Neutral, professional tone — facts stated plainly" },
  { id: "firm", label: "Firm", desc: "Assertive & deadline-focused — legal basis emphasized" },
  { id: "friendly", label: "Friendly", desc: "Cooperative tone — prefers settlement over court" },
] as const;

export function DemandLetterTab({ caseData }: { caseData: any }) {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [selectedTone, setSelectedTone] = useState<string>("firm");
  const [letterContent, setLetterContent] = useState(caseData.demandLetter || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const generateMutation = useMutation({
    mutationFn: async (tone: string) => {
      const basePath = import.meta.env.BASE_URL || "/";
      const token = await getToken();
      const res = await fetch(`${basePath}api/cases/${caseData.id}/demand-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ tone }),
      });
      if (!res.ok) throw new Error("Failed to generate");
      return res.json();
    },
    onSuccess: (data) => {
      setLetterContent(data.demandLetter || "");
      toast({ title: "Demand letter generated!" });
    },
    onError: () => {
      toast({ title: "Failed to generate letter", variant: "destructive" });
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate(selectedTone);
  };

  const handleDownloadPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "in", format: "letter" });
      const margin = 1;
      const pageWidth = 8.5 - 2 * margin;
      const lineHeight = 0.2;
      const pageHeight = 11 - 2 * margin;
      let y = margin;

      doc.setFont("courier", "normal");
      doc.setFontSize(11);

      const lines = doc.splitTextToSize(letterContent, pageWidth);
      for (const line of lines) {
        if (y > margin + pageHeight) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      }

      const fileName = `Demand_Letter_${caseData.defendantName?.replace(/\s+/g, "_") || "Case"}_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
      toast({ title: "PDF downloaded!" });
    } catch {
      toast({ title: "Failed to create PDF", variant: "destructive" });
    }
  };

  const missingFields = !caseData.plaintiffName || !caseData.defendantName || !caseData.amountClaimed;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Demand Letter Generator
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate a professional pre-litigation demand letter using your case details.
          </p>
        </div>
        {letterContent && (
          <Button onClick={handleDownloadPDF} className="bg-orange hover:bg-orange/90 text-white gap-2 shrink-0">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        )}
      </div>

      {missingFields && (
        <div className="bg-gold/10 border-l-4 border-gold p-4 text-sm text-foreground">
          <strong>Tip:</strong> Complete the Intake wizard (Plaintiff, Defendant, and Amount) to generate a better letter.
        </div>
      )}

      <div>
        <h3 className="font-semibold text-sm mb-3">Select Tone</h3>
        <div className="grid grid-cols-3 gap-3">
          {tones.map((tone) => (
            <button
              key={tone.id}
              onClick={() => setSelectedTone(tone.id)}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                selectedTone === tone.id
                  ? "border-navy bg-white shadow-sm"
                  : "border-border bg-white hover:border-muted-foreground/30"
              }`}
            >
              <div className="font-semibold text-sm">{tone.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{tone.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={generateMutation.isPending || missingFields}
        className="w-full bg-navy hover:bg-navy/90 text-white gap-2 py-6 text-base"
      >
        {generateMutation.isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Mail className="h-5 w-5" />
        )}
        {generateMutation.isPending ? "Generating..." : letterContent ? "Regenerate Demand Letter" : "Generate Demand Letter"}
      </Button>

      {letterContent && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Letter Preview</h3>
            <span className="text-xs text-muted-foreground">You can edit the text below before downloading.</span>
          </div>
          <div className="border rounded-lg bg-white">
            <textarea
              ref={textareaRef}
              value={letterContent}
              onChange={(e) => setLetterContent(e.target.value)}
              className="w-full min-h-[500px] p-6 font-mono text-sm leading-relaxed resize-y focus:outline-none rounded-lg"
              style={{ whiteSpace: "pre-wrap" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
