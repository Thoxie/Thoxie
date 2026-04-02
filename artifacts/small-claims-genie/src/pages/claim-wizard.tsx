import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { 
  useCreateClaim, 
  useUpdateClaim, 
  useGetClaim, 
  getGetClaimQueryKey,
  UpdateClaimBodyFilingReasonLocation
} from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Save, Scale, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const STEPS = [
  { id: "court", title: "Court Info", description: "Which court to file in" },
  { id: "plaintiff", title: "Your Info", description: "Plaintiff details" },
  { id: "defendant", title: "Who You're Suing", description: "Defendant details" },
  { id: "claim", title: "Your Claim", description: "Amount and details" },
  { id: "jurisdiction", title: "Why This Court", description: "Venue questions" },
  { id: "additional", title: "Additional Questions", description: "Legal history" },
  { id: "review", title: "Review", description: "Check your answers" },
];

const formSchema = z.object({
  courtName: z.string().optional(),
  courtAddress: z.string().optional(),
  
  plaintiffName: z.string().min(2, "Name is required"),
  plaintiffAddress: z.string().optional(),
  plaintiffCity: z.string().optional(),
  plaintiffState: z.string().optional(),
  plaintiffZip: z.string().optional(),
  plaintiffPhone: z.string().optional(),
  plaintiffEmail: z.string().email("Invalid email").or(z.literal("")).optional(),
  
  defendantName: z.string().min(2, "Defendant name is required"),
  defendantAddress: z.string().optional(),
  defendantCity: z.string().optional(),
  defendantState: z.string().optional(),
  defendantZip: z.string().optional(),
  defendantPhone: z.string().optional(),
  numberOfDefendants: z.coerce.number().min(1).default(1),
  
  claimAmount: z.coerce.number().min(1, "Amount must be greater than 0").max(10000, "Max $10,000 for individuals"),
  claimDescription: z.string().min(10, "Please provide more detail"),
  claimDate: z.string().optional(),
  
  filingReasonLocation: z.enum([
    "defendant_residence", 
    "defendant_business", 
    "contract_signed", 
    "contract_performed", 
    "property_damaged", 
    "plaintiff_injured", 
    "buyer_signed_contract", 
    "other"
  ]).optional(),
  filingReasonZip: z.string().optional(),
  
  isAttorneyClientDispute: z.boolean().default(false),
  isSuingPublicEntity: z.boolean().default(false),
  publicEntityClaimDate: z.string().optional(),
  hasFiledMoreThan12: z.boolean().default(false),
  isClaimMoreThan2500: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function ClaimWizard() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  
  const isEditing = !!params.id && params.id !== "new";
  const claimId = isEditing ? parseInt(params.id!) : null;

  const [currentStep, setCurrentStep] = useState(0);
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  const { data: claim, isLoading: isClaimLoading } = useGetClaim(claimId as number, {
    query: {
      enabled: isEditing,
      queryKey: getGetClaimQueryKey(claimId as number)
    }
  });

  const createClaim = useCreateClaim();
  const updateClaim = useUpdateClaim();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plaintiffName: "",
      defendantName: "",
      claimAmount: 0,
      claimDescription: "",
      numberOfDefendants: 1,
      isAttorneyClientDispute: false,
      isSuingPublicEntity: false,
      hasFiledMoreThan12: false,
      isClaimMoreThan2500: false,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (claim && isEditing) {
      form.reset({
        courtName: claim.courtName || "",
        courtAddress: claim.courtAddress || "",
        plaintiffName: claim.plaintiffName || "",
        plaintiffAddress: claim.plaintiffAddress || "",
        plaintiffCity: claim.plaintiffCity || "",
        plaintiffState: claim.plaintiffState || "",
        plaintiffZip: claim.plaintiffZip || "",
        plaintiffPhone: claim.plaintiffPhone || "",
        plaintiffEmail: claim.plaintiffEmail || "",
        defendantName: claim.defendantName || "",
        defendantAddress: claim.defendantAddress || "",
        defendantCity: claim.defendantCity || "",
        defendantState: claim.defendantState || "",
        defendantZip: claim.defendantZip || "",
        defendantPhone: claim.defendantPhone || "",
        numberOfDefendants: claim.numberOfDefendants || 1,
        claimAmount: claim.claimAmount || 0,
        claimDescription: claim.claimDescription || "",
        claimDate: claim.claimDate || "",
        filingReasonLocation: claim.filingReasonLocation as any,
        filingReasonZip: claim.filingReasonZip || "",
        isAttorneyClientDispute: claim.isAttorneyClientDispute || false,
        isSuingPublicEntity: claim.isSuingPublicEntity || false,
        publicEntityClaimDate: claim.publicEntityClaimDate || "",
        hasFiledMoreThan12: claim.hasFiledMoreThan12 || false,
        isClaimMoreThan2500: claim.isClaimMoreThan2500 || false,
      });
    }
  }, [claim, isEditing, form]);

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isStepValid = await form.trigger(fieldsToValidate as any);
    
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const handleSaveDraft = async () => {
    setIsDraftSaving(true);
    try {
      const values = form.getValues();
      // Ensure required fields for API are present even in draft
      const draftData = {
        ...values,
        plaintiffName: values.plaintiffName || "Draft Plaintiff",
        defendantName: values.defendantName || "Draft Defendant",
        claimAmount: values.claimAmount || 0,
        claimDescription: values.claimDescription || "Draft description",
        status: "draft" as const
      };

      if (isEditing && claimId) {
        await updateClaim.mutateAsync({
          id: claimId,
          data: draftData
        });
        toast({ title: "Draft saved successfully" });
      } else {
        const newClaim = await createClaim.mutateAsync({
          data: draftData
        });
        toast({ title: "Draft created successfully" });
        setLocation(`/claims/${newClaim.id}/edit`);
      }
    } catch (error) {
      toast({ title: "Failed to save draft", variant: "destructive" });
    } finally {
      setIsDraftSaving(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditing && claimId) {
        await updateClaim.mutateAsync({
          id: claimId,
          data: { ...data, status: "filed" }
        });
        toast({ title: "Claim filed successfully!" });
        setLocation(`/claims/${claimId}`);
      } else {
        const newClaim = await createClaim.mutateAsync({
          data: { ...data, status: "filed" as any } // hack to pass validation
        });
        // we update status immediately to filed
        await updateClaim.mutateAsync({ id: newClaim.id, data: { status: "filed" } });
        
        toast({ title: "Claim filed successfully!" });
        setLocation(`/claims/${newClaim.id}`);
      }
    } catch (error) {
      toast({ title: "Failed to file claim", variant: "destructive" });
    }
  };

  const getFieldsForStep = (step: number): string[] => {
    switch (step) {
      case 0: return ["courtName", "courtAddress"];
      case 1: return ["plaintiffName", "plaintiffAddress", "plaintiffCity", "plaintiffState", "plaintiffZip", "plaintiffPhone", "plaintiffEmail"];
      case 2: return ["defendantName", "defendantAddress", "defendantCity", "defendantState", "defendantZip", "defendantPhone", "numberOfDefendants"];
      case 3: return ["claimAmount", "claimDescription", "claimDate"];
      case 4: return ["filingReasonLocation", "filingReasonZip"];
      case 5: return ["isAttorneyClientDispute", "isSuingPublicEntity", "publicEntityClaimDate", "hasFiledMoreThan12", "isClaimMoreThan2500"];
      default: return [];
    }
  };

  if (isEditing && isClaimLoading) {
    return (
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    );
  }

  const StepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-100 mb-6">
              <h4 className="font-semibold mb-1">Where to file?</h4>
              <p>You must file your claim in the right courthouse. Usually, this is where the defendant lives or does business, where a contract was signed, or where the injury/damage happened.</p>
            </div>
            
            <FormField control={form.control} name="courtName" render={({ field }) => (
              <FormItem>
                <FormLabel>Court Name (if known)</FormLabel>
                <FormControl><Input placeholder="e.g. Superior Court of California, County of Santa Clara" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="courtAddress" render={({ field }) => (
              <FormItem>
                <FormLabel>Court Address</FormLabel>
                <FormControl><Textarea placeholder="Street, City, Zip" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-100 mb-6">
              <h4 className="font-semibold mb-1">Who is the Plaintiff?</h4>
              <p>That's you! You are the person or business bringing this claim to court.</p>
            </div>

            <FormField control={form.control} name="plaintiffName" render={({ field }) => (
              <FormItem>
                <FormLabel>Your Full Name *</FormLabel>
                <FormControl><Input placeholder="First Last" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="plaintiffPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl><Input placeholder="(555) 555-5555" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="plaintiffEmail" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl><Input placeholder="you@example.com" type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="plaintiffAddress" render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="plaintiffCity" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>City</FormLabel>
                  <FormControl><Input placeholder="San Jose" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="plaintiffZip" render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code</FormLabel>
                  <FormControl><Input placeholder="95112" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm border border-amber-100 mb-6">
              <h4 className="font-semibold mb-1">Who is the Defendant?</h4>
              <p>This is the person or business you are suing. You must have their exact legal name and a valid address where they can be served papers.</p>
            </div>

            <FormField control={form.control} name="defendantName" render={({ field }) => (
              <FormItem>
                <FormLabel>Defendant's Full Name *</FormLabel>
                <FormControl><Input placeholder="First Last or Business Name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="numberOfDefendants" render={({ field }) => (
              <FormItem>
                <FormLabel>How many defendants are you suing?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>If more than 1, you will need to attach an SC-100A form later.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="defendantAddress" render={({ field }) => (
              <FormItem>
                <FormLabel>Defendant's Street Address</FormLabel>
                <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="defendantCity" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>City</FormLabel>
                  <FormControl><Input placeholder="San Jose" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="defendantZip" render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code</FormLabel>
                  <FormControl><Input placeholder="95112" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            
            <FormField control={form.control} name="defendantPhone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl><Input placeholder="(555) 555-5555" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <FormField control={form.control} name="claimAmount" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">How much are you suing for? *</FormLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <FormControl>
                    <Input type="number" className="pl-8 text-lg" placeholder="0.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                </div>
                <FormDescription>Individuals can sue for up to $10,000. Businesses up to $5,000.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="claimDescription" render={({ field }) => (
              <FormItem>
                <FormLabel>Why does the defendant owe you this money? *</FormLabel>
                <FormControl>
                  <Textarea className="h-32" placeholder="Explain briefly what happened. (e.g. Defendant rear-ended my car and refused to pay for repairs)" {...field} />
                </FormControl>
                <FormDescription>Keep it factual and concise. The judge will read this before your hearing.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="claimDate" render={({ field }) => (
              <FormItem>
                <FormLabel>When did this happen?</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <FormField control={form.control} name="filingReasonLocation" render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base">Why are you filing your claim at this courthouse?</FormLabel>
                <FormDescription>Select the reason that best explains why this court has jurisdiction (check one):</FormDescription>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2 mt-4">
                    <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md cursor-pointer hover:bg-slate-50 transition-colors">
                      <FormControl><RadioGroupItem value="defendant_residence" /></FormControl>
                      <FormLabel className="font-normal flex-1 cursor-pointer">The defendant lives or does business here</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md cursor-pointer hover:bg-slate-50 transition-colors">
                      <FormControl><RadioGroupItem value="property_damaged" /></FormControl>
                      <FormLabel className="font-normal flex-1 cursor-pointer">Damage to property or vehicle happened here</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md cursor-pointer hover:bg-slate-50 transition-colors">
                      <FormControl><RadioGroupItem value="contract_signed" /></FormControl>
                      <FormLabel className="font-normal flex-1 cursor-pointer">A contract was signed or performed here</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md cursor-pointer hover:bg-slate-50 transition-colors">
                      <FormControl><RadioGroupItem value="other" /></FormControl>
                      <FormLabel className="font-normal flex-1 cursor-pointer">Other legally authorized reason</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="filingReasonZip" render={({ field }) => (
              <FormItem>
                <FormLabel>Zip code for the reason selected above</FormLabel>
                <FormControl><Input placeholder="e.g. 95112" {...field} /></FormControl>
                <FormDescription>This helps confirm the court covers the correct geographic area.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground mb-4">The court requires answers to a few specific legal questions before you can file.</p>
            
            <FormField control={form.control} name="isAttorneyClientDispute" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Is this dispute with an attorney about their fee?</FormLabel>
                  <FormDescription>If yes, you may need to go to arbitration first.</FormDescription>
                </div>
              </FormItem>
            )} />

            <FormField control={form.control} name="isSuingPublicEntity" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Are you suing a public entity? (City, County, State, etc.)</FormLabel>
                  <FormDescription>If yes, you must file a formal claim with them first.</FormDescription>
                </div>
              </FormItem>
            )} />

            {form.watch("isSuingPublicEntity") && (
              <FormField control={form.control} name="publicEntityClaimDate" render={({ field }) => (
                <FormItem className="ml-8 border-l-2 border-primary/20 pl-4">
                  <FormLabel>When did you file your claim with the public entity?</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            <FormField control={form.control} name="hasFiledMoreThan12" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Have you filed more than 12 small claims cases in California in the past 12 months?</FormLabel>
                </div>
              </FormItem>
            )} />

            <FormField control={form.control} name="isClaimMoreThan2500" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Have you filed more than 2 small claims cases for more than $2,500 in California this year?</FormLabel>
                  <FormDescription>By law, you can only file two claims over $2,500 per calendar year.</FormDescription>
                </div>
              </FormItem>
            )} />
          </div>
        );

      case 6:
        const values = form.getValues();
        return (
          <div className="space-y-6">
            <div className="bg-muted/50 p-6 rounded-xl border border-border">
              <h3 className="font-serif text-xl font-bold text-primary mb-6">Review Your Claim</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Plaintiff (You)</h4>
                    <p className="font-medium">{values.plaintiffName || "—"}</p>
                    <p className="text-sm text-muted-foreground">{values.plaintiffAddress || "—"}</p>
                    <p className="text-sm text-muted-foreground">{values.plaintiffCity}, {values.plaintiffState} {values.plaintiffZip}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Defendant</h4>
                    <p className="font-medium">{values.defendantName || "—"}</p>
                    <p className="text-sm text-muted-foreground">{values.defendantAddress || "—"}</p>
                    <p className="text-sm text-muted-foreground">{values.defendantCity}, {values.defendantState} {values.defendantZip}</p>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Claim Details</h4>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-primary">${values.claimAmount || 0}</span>
                  </div>
                  <p className="text-sm border-l-2 border-primary/20 pl-3 py-1 my-3 bg-white/50">{values.claimDescription || "—"}</p>
                </div>
                
                <div className="bg-primary/10 text-primary-foreground/90 p-4 rounded-lg text-sm border border-primary/20 flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-primary mb-1">Declaration</p>
                    <p className="text-primary/80">By submitting this form, you declare under penalty of perjury under the laws of the State of California that the information provided is true and correct.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => setLocation("/")} className="mb-4 -ml-4 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span className="w-12 h-1 bg-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-in-out" 
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              />
            </span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground">{STEPS[currentStep].title}</h1>
          <p className="text-muted-foreground mt-1">{STEPS[currentStep].description}</p>
        </div>

        <Card className="border-border/50 shadow-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="p-6 md:p-8">
                {StepContent()}
              </CardContent>
              
              <CardFooter className="bg-muted/30 p-6 flex items-center justify-between border-t border-border/50 rounded-b-xl">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack} 
                  disabled={currentStep === 0}
                >
                  Back
                </Button>
                
                <div className="flex items-center gap-3">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="text-muted-foreground"
                    onClick={handleSaveDraft}
                    disabled={isDraftSaving || createClaim.isPending || updateClaim.isPending}
                  >
                    {isDraftSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Draft
                  </Button>
                  
                  {currentStep < STEPS.length - 1 ? (
                    <Button type="button" onClick={handleNext} className="min-w-24">
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-32"
                      disabled={createClaim.isPending || updateClaim.isPending}
                    >
                      {(createClaim.isPending || updateClaim.isPending) ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Submit Claim
                    </Button>
                  )}
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
