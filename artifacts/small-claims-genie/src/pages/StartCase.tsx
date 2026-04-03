import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCreateCase } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
  const [title, setTitle] = useState("");
  const [claimType, setClaimType] = useState("");
  const [county, setCounty] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateCase({
    mutation: {
      onSuccess: (data: any) => {
        navigate(`/cases/${data.id}`);
      },
      onError: () => {
        toast({ title: "Could not create case. Please try again.", variant: "destructive" });
      },
    },
  });

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (title.trim().length < 3) {
      newErrors.title = "Please enter a title (at least 3 characters)";
    }
    if (!claimType) {
      newErrors.claimType = "Please select a claim type";
    }
    if (!county) {
      newErrors.county = "Please select a county";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    createMutation.mutate({
      data: {
        claimDescription: title.trim(),
        claimType,
        county,
      },
    });
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold text-navy">
              Start Your Case
            </CardTitle>
            <CardDescription>
              Fill in the basics to get started. You can add more details after.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-navy">
                What is this case about?
              </label>
              <Input
                placeholder="e.g., Unpaid Rent from John Smith"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background"
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-navy">
                Type of claim
              </label>
              <div className="grid grid-cols-2 gap-2">
                {claimTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setClaimType(type)}
                    className={`px-4 py-2.5 rounded-md border text-sm font-medium text-left transition-colors ${
                      claimType === type
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.claimType && <p className="text-sm text-destructive">{errors.claimType}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-navy">
                California County <span className="text-red-500">*</span>
              </label>
              <select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className={`w-full h-14 px-3 rounded-md border bg-background text-base ${
                  county ? "border-input" : "border-input text-muted-foreground"
                }`}
              >
                <option value="">Select your county</option>
                {counties.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.county && <p className="text-sm text-destructive">{errors.county}</p>}
              <p className="text-xs text-muted-foreground">Usually where the defendant lives or where the incident happened.</p>
            </div>

            <button
              type="button"
              disabled={createMutation.isPending}
              onClick={handleSubmit}
              className="w-full h-12 rounded-lg bg-navy text-white font-bold text-base hover:bg-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? "Creating..." : "Create My Case →"}
            </button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
