import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useSaveIntakeProgress } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ChevronRight, ChevronLeft, Save, Loader2 } from "lucide-react";

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
    isAttyFeeDispute: caseData.isAttyFeeDispute || false,
    
    demandMade: caseData.demandMade || false,
    
    county: caseData.county || "",
    courthouse: caseData.courthouse || "",
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
    const isComplete = nextStep === 8 || step === 7;
    updateMutation.mutate({
      caseId: caseData.id,
      data: {
        ...formData,
        amountClaimed: formData.amountClaimed ? String(formData.amountClaimed) : undefined,
        intakeStep: nextStep && nextStep <= 7 ? nextStep : step,
        intakeComplete: isComplete
      }
    });
    
    if (nextStep && nextStep <= 7) {
      setStep(nextStep);
    }
  };

  const nextStep = () => handleSave(step + 1);
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      // auto save on prev too, but keeping them on the prev step
      handleSave(step - 1);
    }
  };

  const steps = [
    { num: 1, title: "Plaintiff" },
    { num: 2, title: "Defendant" },
    { num: 3, title: "Claim Type" },
    { num: 4, title: "Amount" },
    { num: 5, title: "Demand" },
    { num: 6, title: "Court" },
    { num: 7, title: "Review" },
  ];

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      {/* Progress Bar */}
      <div className="mb-8 hidden sm:block">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-muted -z-10 transform -translate-y-1/2"></div>
          {steps.map(s => (
            <div key={s.num} className="flex flex-col items-center gap-2 bg-card px-2 cursor-pointer" onClick={() => {
              if (s.num < step) setStep(s.num);
            }}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step === s.num ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                step > s.num ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
              </div>
              <span className={`text-xs font-medium ${step === s.num ? "text-primary" : "text-muted-foreground"}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Mobile progress */}
      <div className="mb-6 sm:hidden text-center">
        <span className="text-sm font-bold text-primary uppercase tracking-wider">Step {step} of 7: {steps[step-1].title}</span>
      </div>

      <div className="flex-1">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold">Plaintiff Information</h2>
              <p className="text-muted-foreground">This is your information. You are the person filing the claim.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="p_name">Full Legal Name</Label>
                <Input id="p_name" value={formData.plaintiffName} onChange={e => handleChange("plaintiffName", e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="p_addr">Street Address</Label>
                <Input id="p_addr" value={formData.plaintiffAddress} onChange={e => handleChange("plaintiffAddress", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p_city">City</Label>
                <Input id="p_city" value={formData.plaintiffCity} onChange={e => handleChange("plaintiffCity", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="p_state">State</Label>
                  <Input id="p_state" value={formData.plaintiffState} onChange={e => handleChange("plaintiffState", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p_zip">Zip Code</Label>
                  <Input id="p_zip" value={formData.plaintiffZip} onChange={e => handleChange("plaintiffZip", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="p_phone">Phone Number</Label>
                <Input id="p_phone" value={formData.plaintiffPhone} onChange={e => handleChange("plaintiffPhone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p_email">Email Address</Label>
                <Input id="p_email" type="email" value={formData.plaintiffEmail} onChange={e => handleChange("plaintiffEmail", e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold">Defendant Information</h2>
              <p className="text-muted-foreground">Who are you suing? You must use their exact legal name.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="d_name">Defendant Legal Name</Label>
                <Input id="d_name" value={formData.defendantName} onChange={e => handleChange("defendantName", e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="d_addr">Street Address</Label>
                <Input id="d_addr" value={formData.defendantAddress} onChange={e => handleChange("defendantAddress", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="d_city">City</Label>
                <Input id="d_city" value={formData.defendantCity} onChange={e => handleChange("defendantCity", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="d_state">State</Label>
                  <Input id="d_state" value={formData.defendantState} onChange={e => handleChange("defendantState", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d_zip">Zip Code</Label>
                  <Input id="d_zip" value={formData.defendantZip} onChange={e => handleChange("defendantZip", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="d_phone">Phone Number (Optional)</Label>
                <Input id="d_phone" value={formData.defendantPhone} onChange={e => handleChange("defendantPhone", e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold">Claim Type & Details</h2>
              <p className="text-muted-foreground">What is this dispute about?</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type of Claim</Label>
                <Select value={formData.claimType} onValueChange={v => handleChange("claimType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select claim type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contract Dispute">Contract Dispute</SelectItem>
                    <SelectItem value="Landlord/Tenant">Landlord/Tenant</SelectItem>
                    <SelectItem value="Contractors/Home Services">Contractors/Home Services</SelectItem>
                    <SelectItem value="Auto Repair">Auto Repair</SelectItem>
                    <SelectItem value="Charges/Payment/No Refunds/Chargebacks">Charges/Payment/No Refunds/Chargebacks</SelectItem>
                    <SelectItem value="Airlines and Travel">Airlines and Travel</SelectItem>
                    <SelectItem value="Airbnb/VRBO/Hotel">Airbnb/VRBO/Hotel</SelectItem>
                    <SelectItem value="Attorney Fee Dispute">Attorney Fee Dispute</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Describe what happened</Label>
                <p className="text-xs text-muted-foreground">Keep it factual, brief, and to the point.</p>
                <Textarea 
                  id="desc" 
                  rows={6} 
                  value={formData.claimDescription} 
                  onChange={e => handleChange("claimDescription", e.target.value)} 
                  placeholder="On [date], the defendant agreed to..."
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold">Claim Amount</h2>
              <p className="text-muted-foreground">How much are you asking for?</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amt">Amount Claimed ($)</Label>
                <Input 
                  id="amt" 
                  type="number" 
                  min="0" 
                  max="12500" 
                  value={formData.amountClaimed} 
                  onChange={e => handleChange("amountClaimed", e.target.value)} 
                  placeholder="e.g. 1500"
                />
                <p className="text-xs text-muted-foreground">Maximum for individuals is $12,500.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="calc">How did you calculate this amount?</Label>
                <Textarea 
                  id="calc" 
                  rows={4} 
                  value={formData.howAmountCalculated} 
                  onChange={e => handleChange("howAmountCalculated", e.target.value)} 
                  placeholder="e.g. $1,000 for the uncompleted work, plus $500 for materials I had to purchase."
                />
              </div>
              <div className="flex items-center space-x-2 bg-muted/50 p-4 rounded-lg border">
                <Checkbox 
                  id="atty_fee" 
                  checked={formData.isAttyFeeDispute} 
                  onCheckedChange={c => handleChange("isAttyFeeDispute", !!c)} 
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="atty_fee"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    This is an attorney fee dispute
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Check this only if you are suing a lawyer over fees.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold">Demand for Payment</h2>
              <p className="text-muted-foreground">Have you asked the defendant to pay you?</p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center space-x-2 bg-primary/5 p-4 rounded-lg border border-primary/20">
                <Checkbox 
                  id="demand" 
                  checked={formData.demandMade} 
                  onCheckedChange={c => handleChange("demandMade", !!c)} 
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="demand"
                    className="text-sm font-bold leading-none"
                  >
                    I have asked the defendant to pay me
                  </label>
                  <p className="text-sm text-muted-foreground">
                    You MUST ask the defendant to pay before you can sue in small claims.
                  </p>
                </div>
              </div>
              {!formData.demandMade && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm font-medium border border-destructive/20">
                  Warning: The court requires you to demand payment before filing. You can use our Demand Letter tool to generate and send a formal request.
                </div>
              )}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold">Filing Location</h2>
              <p className="text-muted-foreground">Where will you file this claim?</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>California County</Label>
                <Select value={formData.county} onValueChange={v => handleChange("county", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Los Angeles">Los Angeles</SelectItem>
                    <SelectItem value="San Francisco">San Francisco</SelectItem>
                    <SelectItem value="San Diego">San Diego</SelectItem>
                    <SelectItem value="Orange">Orange</SelectItem>
                    <SelectItem value="Santa Clara">Santa Clara</SelectItem>
                    <SelectItem value="Alameda">Alameda</SelectItem>
                    <SelectItem value="Sacramento">Alameda</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="courthouse">Courthouse Name/Branch</Label>
                <Input id="courthouse" value={formData.courthouse} onChange={e => handleChange("courthouse", e.target.value)} placeholder="e.g. Stanley Mosk Courthouse" />
              </div>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold">Review & Complete</h2>
              <p className="text-muted-foreground">Please review your information before finalizing.</p>
            </div>
            
            <div className="bg-muted/30 border rounded-lg p-4 space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <div className="font-semibold text-muted-foreground">Plaintiff</div>
                <div className="col-span-2">{formData.plaintiffName}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <div className="font-semibold text-muted-foreground">Defendant</div>
                <div className="col-span-2">{formData.defendantName}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <div className="font-semibold text-muted-foreground">Claim Type</div>
                <div className="col-span-2">{formData.claimType}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <div className="font-semibold text-muted-foreground">Amount</div>
                <div className="col-span-2 font-bold text-primary">${formData.amountClaimed}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 pb-2">
                <div className="font-semibold text-muted-foreground">County</div>
                <div className="col-span-2">{formData.county}</div>
              </div>
            </div>
            
            {caseData.intakeComplete && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex gap-3">
                <CheckCircle2 className="h-5 w-5 mt-0.5" />
                <div>
                  <h4 className="font-bold">Intake Complete</h4>
                  <p className="text-sm mt-1">You have successfully completed the intake process. You can now generate forms or proceed to court.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between items-center border-t pt-6">
        <Button variant="outline" onClick={prevStep} disabled={step === 1 || updateMutation.isPending}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => handleSave()} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Draft
          </Button>
          
          {step < 7 ? (
            <Button onClick={nextStep} disabled={updateMutation.isPending}>
              Next Step
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => handleSave(8)} className="bg-green-600 hover:bg-green-700 text-white" disabled={updateMutation.isPending || caseData.intakeComplete}>
              {caseData.intakeComplete ? "Saved" : "Complete Intake"}
              {!caseData.intakeComplete && <CheckCircle2 className="h-4 w-4 ml-2" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
