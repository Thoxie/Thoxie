import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetCase, useDeleteCase } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, AlertTriangle, FileText, FolderOpen, MessageSquare, Mail, Scale } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { IntakeWizard } from "@/components/case/IntakeWizard";
import { DocumentsTab } from "@/components/case/DocumentsTab";
import { DemandLetterTab } from "@/components/case/DemandLetterTab";
import { FormsTab } from "@/components/case/FormsTab";
import { AskGenie } from "@/components/AskGenie";

const tabs = [
  { id: "intake", label: "Intake", icon: FileText },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "ask-genie", label: "Ask The Genie AI", icon: MessageSquare },
  { id: "demand", label: "Demand Letter", icon: Mail },
  { id: "forms", label: "Forms", icon: Scale },
];

export default function CaseDetail({ id }: { id: string }) {
  const caseId = parseInt(id, 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("intake");

  const { data: caseData, isLoading } = useGetCase(caseId);
  const deleteMutation = useDeleteCase({
    mutation: {
      onSuccess: () => {
        toast({ title: "Case deleted successfully" });
        setLocation("/dashboard");
      },
      onError: () => {
        toast({ title: "Failed to delete case", variant: "destructive" });
      }
    }
  });

  const handleDelete = () => {
    deleteMutation.mutate({ caseId });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!caseData) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Case Not Found</h2>
          <p className="text-muted-foreground mt-2 mb-6">The case you are looking for does not exist or you don't have access.</p>
          <Button onClick={() => setLocation("/dashboard")}>Back to Dashboard</Button>
        </div>
      </AppLayout>
    );
  }

  const amount = caseData.amountClaimed ? `$${Number(caseData.amountClaimed).toLocaleString()}` : null;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-4">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border rounded-full px-3 py-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Your Cases
        </Link>

        <div className="bg-white rounded-xl border border-border/60 p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-navy">{caseData.claimDescription || caseData.plaintiffName || "Untitled Case"}</h1>
                {caseData.intakeComplete && (
                  <span className="text-xs font-semibold bg-navy/10 text-navy px-2.5 py-0.5 rounded">Intake Complete</span>
                )}
              </div>
              {amount && (
                <p className="text-sm text-muted-foreground mt-1">Claim Amount: <span className="font-bold text-foreground">{amount}</span></p>
              )}
            </div>
          </div>
        </div>

        <div className="flex bg-white rounded-xl border border-border/60 overflow-hidden">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors flex-1 justify-center ${
                  isActive
                    ? "bg-navy text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-border/60 p-6">
          {activeTab === "intake" && <IntakeWizard caseData={caseData} />}
          {activeTab === "documents" && <DocumentsTab caseId={caseId} />}
          {activeTab === "ask-genie" && <AskGenie caseData={caseData} />}
          {activeTab === "demand" && <DemandLetterTab caseData={caseData} />}
          {activeTab === "forms" && <FormsTab caseData={caseData} />}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this case and all associated documents and progress. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete Case
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
