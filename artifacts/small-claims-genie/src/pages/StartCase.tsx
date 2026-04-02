import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useCreateCase } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const claimTypes = [
  "Money Owed",
  "Unpaid Debt",
  "Security Deposit",
  "Property Damage",
  "Contract Dispute",
  "Fraud",
  "Other",
];

const counties = [
  "Alameda", "Alpine", "Amador", "Butte", "Calaveras", "Colusa", "Contra Costa",
  "Del Norte", "El Dorado", "Fresno", "Glenn", "Humboldt", "Imperial", "Inyo",
  "Kern", "Kings", "Lake", "Lassen", "Los Angeles", "Madera", "Marin", "Mariposa",
  "Mendocino", "Merced", "Modoc", "Mono", "Monterey", "Napa", "Nevada", "Orange",
  "Placer", "Plumas", "Riverside", "Sacramento", "San Benito", "San Bernardino",
  "San Diego", "San Francisco", "San Joaquin", "San Luis Obispo", "San Mateo",
  "Santa Barbara", "Santa Clara", "Santa Cruz", "Shasta", "Sierra", "Siskiyou",
  "Solano", "Sonoma", "Stanislaus", "Sutter", "Tehama", "Trinity", "Tulare",
  "Tuolumne", "Ventura", "Yolo", "Yuba",
];

export default function StartCase() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [caseTitle, setCaseTitle] = useState("");
  const [claimType, setClaimType] = useState("");
  const [county, setCounty] = useState("");

  const createMutation = useCreateCase({
    mutation: {
      onSuccess: (data: any) => {
        toast({ title: "Case created!" });
        navigate(`/cases/${data.id}`);
      },
      onError: () => {
        toast({ title: "Failed to create case", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      data: {
        claimDescription: caseTitle,
        claimType,
        county,
      },
    });
  };

  return (
    <PublicLayout>
      <section className="py-16 md:py-24 bg-background flex-1 flex items-start justify-center">
        <div className="w-full max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-border/60 p-8 md:p-10 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-extrabold text-navy mb-2">
              Start Your Case
            </h1>
            <p className="text-muted-foreground mb-8">
              Fill in the basics to get started. You can add more details after.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-navy">
                  What is this case about?
                </Label>
                <Input
                  placeholder="e.g., Unpaid Rent from John Smith"
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-navy">
                  Type of claim
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {claimTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setClaimType(type)}
                      className={`px-4 py-2.5 rounded-lg border text-sm font-medium text-left transition-colors ${
                        claimType === type
                          ? "border-navy bg-navy/5 text-navy"
                          : "border-border bg-white text-foreground hover:border-navy/30"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-navy">
                  California County <span className="text-red-500">*</span>
                </Label>
                <Select value={county} onValueChange={setCounty}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select your county" />
                  </SelectTrigger>
                  <SelectContent>
                    {counties.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Usually where the defendant lives or where the incident happened.
                </p>
              </div>

              <button
                type="submit"
                disabled={!county || createMutation.isPending}
                className="w-full h-12 rounded-lg bg-navy text-white font-bold text-base hover:bg-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? "Creating..." : "Create My Case →"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
