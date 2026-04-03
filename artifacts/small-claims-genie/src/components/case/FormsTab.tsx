import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@clerk/react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ReadinessData {
  score: number;
  strengths: string[];
  weaknesses: string[];
  documentCount: number;
}

export function FormsTab({ caseData }: { caseData: any }) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [readiness, setReadiness] = useState<ReadinessData | null>(null);

  useEffect(() => {
    const fetchReadiness = async () => {
      try {
        const basePath = import.meta.env.BASE_URL || "/";
        const token = await getToken();
        const res = await fetch(`${basePath}api/cases/${caseData.id}/forms/readiness`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (res.ok) {
          setReadiness(await res.json());
        }
      } catch {}
    };
    fetchReadiness();
  }, [caseData.id, getToken]);

  const handleDownload = async (format: "pdf" | "docx") => {
    const setLoading = format === "pdf" ? setDownloadingPdf : setDownloadingDocx;
    setLoading(true);
    try {
      const basePath = import.meta.env.BASE_URL || "/";
      const token = await getToken();
      const ext = format === "pdf" ? "" : ".docx";
      const res = await fetch(`${basePath}api/cases/${caseData.id}/forms/sc100${ext}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to generate");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SC-100_${caseData.plaintiffName?.replace(/\s+/g, "_") || "Case"}.${format === "pdf" ? "pdf" : "docx"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: `SC-100 ${format.toUpperCase()} downloaded!` });
    } catch {
      toast({ title: `Failed to generate SC-100 ${format.toUpperCase()}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (readiness?.score || 0) >= 80 ? "text-green-600" : (readiness?.score || 0) >= 50 ? "text-yellow-600" : "text-red-500";
  const barColor = (readiness?.score || 0) >= 80 ? "bg-green-500" : (readiness?.score || 0) >= 50 ? "bg-yellow-500" : "bg-red-500";

  const incidentRange = caseData.incidentDateStart
    ? `${formatDate(caseData.incidentDateStart)}${caseData.incidentDateEnd ? " – " + formatDate(caseData.incidentDateEnd) : ""}`
    : "N/A";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">SC-100 Preview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This is the official Plaintiff's Claim form you will file with the court.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className="border rounded-xl p-6 bg-white">
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Plaintiff</div>
                <div className="font-semibold mt-1">{caseData.plaintiffName || "—"}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Defendant</div>
                <div className="font-semibold mt-1">{caseData.defendantName || "—"}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount Requested</div>
                <div className="font-semibold mt-1">${caseData.amountClaimed || "0"}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Incident Date</div>
                <div className="font-semibold mt-1">{incidentRange}</div>
              </div>
            </div>
            {caseData.claimDescription && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Why Does Defendant Owe You Money?</div>
                <div className="text-sm mt-1">{caseData.claimDescription}</div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="border rounded-xl p-6 bg-white text-center">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Readiness Score</div>
            {readiness ? (
              <>
                <div className={`text-6xl font-bold ${scoreColor}`}>{readiness.score}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3 mb-4">
                  <div
                    className={`h-2 rounded-full transition-all ${barColor}`}
                    style={{ width: `${readiness.score}%` }}
                  />
                </div>
                {readiness.strengths.length > 0 && (
                  <div className="text-left">
                    <div className="text-xs font-bold text-green-700 flex items-center gap-1 mb-2">
                      <CheckCircle className="h-3.5 w-3.5" /> Strengths
                    </div>
                    <ul className="space-y-1">
                      {readiness.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {readiness.score >= 70 && (
                  <p className="text-xs text-muted-foreground mt-4 border-t pt-3">
                    Your case appears ready to file. Download your SC-100 form, review it carefully, then bring it to your county courthouse.
                  </p>
                )}
              </>
            ) : (
              <div className="text-4xl font-bold text-muted-foreground">—</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          onClick={() => handleDownload("pdf")}
          disabled={downloadingPdf}
          className="bg-navy hover:bg-navy/90 text-white gap-2 py-6 text-base"
        >
          {downloadingPdf ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
          Download SC-100 PDF
        </Button>
        <Button
          onClick={() => handleDownload("docx")}
          disabled={downloadingDocx}
          variant="outline"
          className="gap-2 py-6 text-base border-2"
        >
          {downloadingDocx ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
          Download as Word (.docx)
        </Button>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  } catch {
    return dateStr;
  }
}
