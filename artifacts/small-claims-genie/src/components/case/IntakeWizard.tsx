import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSaveIntakeProgress } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { COUNTY_COURTHOUSES } from "@/data/courthouses";

const claimTypes = ["Money Owed", "Unpaid Debt", "Security Deposit", "Property Damage", "Contract Dispute", "Fraud", "Other"];
const counties = Object.keys(COUNTY_COURTHOUSES).sort();

const venueReasons = [
  "Where the defendant lives or does business",
  "Where the damage or injury happened",
  "Where the contract was made or broken",
  "Other reason",
];

export function IntakeWizard({ caseData }: { caseData: any }) {
  const { toast } = useToast();
  const [step, setStep] = useState(caseData.intakeStep || 1);
  const [formData, setFormData] = useState({
    plaintiffName: caseData.plaintiffName || "",
    plaintiffAddress: caseData.plaintiffAddress || "",
    plaintiffCity: caseData.plaintiffCity || "",
    plaintiffState: caseData.plaintiffState || "CA",
    plaintiffZip: caseData.plaintiffZip || "",
    plaintiffPhone: caseData.plaintiffPhone || "",
    plaintiffEmail: caseData.plaintiffEmail || "",
    defendantName: caseData.defendantName || "",
    defendantAddress: caseData.defendantAddress || "",
    defendantCity: caseData.defendantCity || "",
    defendantState: caseData.defendantState || "CA",
    defendantZip: caseData.defendantZip || "",
    defendantPhone: caseData.defendantPhone || "",
    claimType: caseData.claimType || "",
    claimDescription: caseData.claimDescription || "",
    amountClaimed: caseData.amountClaimed || "",
    howAmountCalculated: caseData.howAmountCalculated || "",
    incidentDateStart: caseData.incidentDateStart || "",
    incidentDateEnd: caseData.incidentDateEnd || "",
    demandMade: caseData.demandMade || false,
    demandDescription: caseData.demandDescription || "",
    venueBasis: caseData.venueBasis || "",
    county: caseData.county || "",
    courthouse: caseData.courthouse || "",
    suingPublicEntity: caseData.suingPublicEntity || false,
    disputeAttorneyFees: caseData.disputeAttorneyFees || false,
    filedOver12: caseData.filedOver12 || false,
    filedOver2500: caseData.filedOver2500 || false,
  });

  const updateMutation = useSaveIntakeProgress({
    mutation: {
      onSuccess: () => {
        toast({ title: "Progress saved" });
      },
      onError: () => {
        toast({ title: "Failed to save progress", variant: "destructive" });
      }
    }
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (nextStep?: number) => {
    const isComplete = nextStep === 5;
    updateMutation.mutate({
      caseId: caseData.id,
      data: {
        ...formData,
        intakeStep: nextStep && nextStep <= 4 ? nextStep : step,
        intakeComplete: isComplete,
      }
    });
    if (nextStep && nextStep <= 4) {
      setStep(nextStep);
    }
    if (isComplete) {
      setStep(4);
    }
  };

  const stepTitles = ["Parties", "Claim Details", "Prior Demand & Venue", "Eligibility & Review"];

  const selectedCourthouses = formData.county ? (COUNTY_COURTHOUSES[formData.county] || []) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy">{stepTitles[step - 1]}</h2>
        <span className="text-sm text-muted-foreground">Step {step} of 4</span>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-navy" : "bg-border"}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Plaintiff (You)</h3>
            <div className="space-y-3">
              <div>
                <Label>Full Name <span className="text-red-500">*</span></Label>
                <Input value={formData.plaintiffName} onChange={e => handleChange("plaintiffName", e.target.value)} placeholder="Your full legal name" className="bg-white" />
              </div>
              <div>
                <Label>Street Address</Label>
                <Input value={formData.plaintiffAddress} onChange={e => handleChange("plaintiffAddress", e.target.value)} placeholder="Street address" className="bg-white" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>City</Label>
                  <Input value={formData.plaintiffCity} onChange={e => handleChange("plaintiffCity", e.target.value)} className="bg-white" />
                </div>
                <div>
                  <Label>State</Label>
                  <Input value={formData.plaintiffState} onChange={e => handleChange("plaintiffState", e.target.value)} className="bg-white" />
                </div>
                <div>
                  <Label>Zip</Label>
                  <Input value={formData.plaintiffZip} onChange={e => handleChange("plaintiffZip", e.target.value)} className="bg-white" />
                </div>
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={formData.plaintiffPhone} onChange={e => handleChange("plaintiffPhone", e.target.value)} placeholder="(555) 555-5555" className="bg-white" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={formData.plaintiffEmail} onChange={e => handleChange("plaintiffEmail", e.target.value)} placeholder="your@email.com" className="bg-white" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Defendant</h3>
            <div className="space-y-3">
              <div>
                <Label>Full Name / Business Name <span className="text-red-500">*</span></Label>
                <Input value={formData.defendantName} onChange={e => handleChange("defendantName", e.target.value)} placeholder="Person or business you're suing" className="bg-white" />
              </div>
              <div>
                <Label>Street Address</Label>
                <Input value={formData.defendantAddress} onChange={e => handleChange("defendantAddress", e.target.value)} placeholder="Street address" className="bg-white" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>City</Label>
                  <Input value={formData.defendantCity} onChange={e => handleChange("defendantCity", e.target.value)} className="bg-white" />
                </div>
                <div>
                  <Label>State</Label>
                  <Input value={formData.defendantState} onChange={e => handleChange("defendantState", e.target.value)} className="bg-white" />
                </div>
                <div>
                  <Label>Zip</Label>
                  <Input value={formData.defendantZip} onChange={e => handleChange("defendantZip", e.target.value)} className="bg-white" />
                </div>
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={formData.defendantPhone} onChange={e => handleChange("defendantPhone", e.target.value)} placeholder="(555) 555-5555" className="bg-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Claim Type <span className="text-red-500">*</span></Label>
              <Select value={formData.claimType} onValueChange={v => handleChange("claimType", v)}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Select claim type" /></SelectTrigger>
                <SelectContent>
                  {claimTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount Requested ($) <span className="text-red-500">*</span></Label>
              <Input type="number" value={formData.amountClaimed} onChange={e => handleChange("amountClaimed", e.target.value)} placeholder="5000" className="bg-white" />
            </div>
          </div>
          <div>
            <Label>When did this happen? <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Input type="date" value={formData.incidentDateStart} onChange={e => handleChange("incidentDateStart", e.target.value)} className="bg-white" />
              <Input type="date" value={formData.incidentDateEnd} onChange={e => handleChange("incidentDateEnd", e.target.value)} className="bg-white" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Select a single date or a date range.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>What happened? <span className="text-red-500">*</span></Label>
              <Textarea value={formData.claimDescription} onChange={e => handleChange("claimDescription", e.target.value)} placeholder="Describe what happened..." className="bg-white min-h-[120px]" />
            </div>
            <div>
              <Label>How did you calculate this amount? <span className="text-red-500">*</span></Label>
              <Textarea value={formData.howAmountCalculated} onChange={e => handleChange("howAmountCalculated", e.target.value)} placeholder="Explain how you arrived at this amount..." className="bg-white min-h-[120px]" />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Prior Demand</h3>
            <div className="space-y-3">
              <p className="text-sm font-medium">Have you already asked the defendant to pay you?</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="demandMade" checked={formData.demandMade === true} onChange={() => handleChange("demandMade", true)} className="accent-navy" />
                  <span className="text-sm">Yes. I asked them.</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="demandMade" checked={formData.demandMade === false} onChange={() => handleChange("demandMade", false)} className="accent-navy" />
                  <span className="text-sm">No. I have not asked them yet.</span>
                </label>
              </div>
              {formData.demandMade && (
                <div>
                  <Label>How and when did you ask them?</Label>
                  <Textarea value={formData.demandDescription} onChange={e => handleChange("demandDescription", e.target.value)} placeholder="Describe how and when you made the demand..." className="bg-white min-h-[100px]" />
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Why This County?</h3>
            <p className="text-sm font-medium">Select the reason you're filing here <span className="text-red-500">*</span></p>
            <div className="space-y-2">
              {venueReasons.map(reason => (
                <label key={reason} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-white cursor-pointer hover:border-navy/30 transition-colors">
                  <input type="radio" name="venueBasis" checked={formData.venueBasis === reason} onChange={() => handleChange("venueBasis", reason)} className="accent-navy" />
                  <span className="text-sm">{reason}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Eligibility Questions</h3>
            <div className="space-y-3">
              {[
                { field: "suingPublicEntity", label: "Suing a public entity? (e.g. City, County, State)" },
                { field: "disputeAttorneyFees", label: "Is this a dispute with a lawyer about attorney fees?" },
                { field: "filedOver12", label: "Filed more than 12 small claims in California in the past 12 months?" },
                { field: "filedOver2500", label: "Claim over $2,500: Have you filed 2+ other small claims over $2,500 in CA this calendar year?" },
              ].map(q => (
                <label key={q.field} className="flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-white cursor-pointer hover:border-navy/30 transition-colors">
                  <input type="checkbox" checked={formData[q.field as keyof typeof formData] as boolean} onChange={e => handleChange(q.field, e.target.checked)} className="accent-navy mt-0.5" />
                  <span className="text-sm">{q.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Review Your Case</h3>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Plaintiff</p>
                  <p className="font-bold">{formData.plaintiffName || "—"}</p>
                  <p className="text-muted-foreground">{formData.plaintiffAddress}</p>
                  <p className="text-muted-foreground">{formData.plaintiffCity}{formData.plaintiffCity && ","} {formData.plaintiffState} {formData.plaintiffZip}</p>
                  <p className="text-muted-foreground">{formData.plaintiffPhone}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Defendant</p>
                  <p className="font-bold">{formData.defendantName || "—"}</p>
                  <p className="text-muted-foreground">{formData.defendantAddress}</p>
                  <p className="text-muted-foreground">{formData.defendantCity}{formData.defendantCity && ","} {formData.defendantState} {formData.defendantZip}</p>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Claim</p>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{formData.claimType || "—"}</p>
                    <p className="text-muted-foreground text-xs">Date: {formData.incidentDateStart || "—"}{formData.incidentDateEnd ? ` – ${formData.incidentDateEnd}` : ""}</p>
                    <p className="text-muted-foreground">{formData.claimDescription || "—"}</p>
                  </div>
                  <p className="font-bold text-lg">${formData.amountClaimed ? Number(formData.amountClaimed).toLocaleString() : "—"}</p>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Court</p>
                <p className="font-bold">{formData.courthouse || "—"}</p>
                {formData.courthouse && formData.county && (() => {
                  const ch = (COUNTY_COURTHOUSES[formData.county] || []).find(c => c.name === formData.courthouse);
                  return ch ? <p className="text-muted-foreground">{ch.address}, {ch.city} {ch.zip}</p> : null;
                })()}
              </div>
              <div className="border-t pt-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Venue Basis</p>
                <p>{formData.venueBasis || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t">
        <button
          type="button"
          onClick={() => { if (step > 1) { handleSave(step - 1); } }}
          disabled={step === 1}
          className="px-6 py-2.5 rounded-lg border border-border bg-white text-sm font-semibold text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-30"
        >
          Back
        </button>
        {step < 4 ? (
          <button
            type="button"
            onClick={() => handleSave(step + 1)}
            className="px-6 py-2.5 rounded-lg bg-navy text-white text-sm font-bold hover:bg-navy/90 transition-colors"
          >
            Save & Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleSave(5)}
            className="px-6 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Complete Intake ✓
          </button>
        )}
      </div>
    </div>
  );
}
