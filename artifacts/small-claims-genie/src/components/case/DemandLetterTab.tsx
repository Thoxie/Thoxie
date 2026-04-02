import { useState } from "react";
import { useGenerateDemandLetter } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Copy, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DemandLetterTab({ caseData }: { caseData: any }) {
  const { toast } = useToast();
  const [letterContent, setLetterContent] = useState(caseData.demandLetter || "");
  
  const generateMutation = useGenerateDemandLetter({
    mutation: {
      onSuccess: (data) => {
        setLetterContent(data.demandLetter || "Demand letter generated successfully. Review below.");
        toast({ title: "Letter generated!" });
      },
      onError: () => {
        toast({ title: "Failed to generate letter", variant: "destructive" });
      }
    }
  });

  const handleGenerate = () => {
    generateMutation.mutate({ caseId: caseData.id });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letterContent);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Demand Letter</h2>
          <p className="text-muted-foreground">California requires you to demand payment before filing suit.</p>
        </div>
        <Button onClick={handleGenerate} disabled={generateMutation.isPending || !caseData.plaintiffName || !caseData.defendantName} className="gap-2 shrink-0">
          {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-accent" />}
          {letterContent ? "Regenerate with AI" : "Generate with AI"}
        </Button>
      </div>

      {(!caseData.plaintiffName || !caseData.defendantName || !caseData.amountClaimed) && (
        <div className="bg-accent/10 border-l-4 border-accent p-4 text-sm text-foreground">
          <strong>Tip:</strong> Fill out the Plaintiff, Defendant, and Amount sections in the Intake wizard for a better generated letter.
        </div>
      )}

      {letterContent ? (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Text
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Email via System (Coming Soon)
            </Button>
          </div>
          <Textarea 
            value={letterContent} 
            onChange={(e) => setLetterContent(e.target.value)}
            className="min-h-[500px] font-serif text-base leading-relaxed p-6"
          />
          <p className="text-xs text-muted-foreground text-center">
            You can edit the generated letter above before sending it. Make sure to send it via Certified Mail with Return Receipt Requested.
          </p>
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/10">
          <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium mb-2">No letter generated yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            Click the generate button above to let our AI write a professional demand letter based on your case details.
          </p>
        </div>
      )}
    </div>
  );
}

function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}