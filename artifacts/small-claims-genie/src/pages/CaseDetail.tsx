import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetCase, useUpdateCase, useDeleteCase } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, ArrowLeft, Loader2, FileText, UploadCloud, FileSignature, FileKey, AlertTriangle } from "lucide-react";
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

export default function CaseDetail({ id }: { id: string }) {
  const caseId = parseInt(id, 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
        <div className="space-y-6">
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

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {caseData.plaintiffName} v. {caseData.defendantName || "Unknown"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {caseData.claimType || "New Case"} • Updated {new Date(caseData.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)} className="gap-2">
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete Case</span>
          </Button>
        </div>

        <Tabs defaultValue="intake" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mb-6">
            <TabsTrigger value="intake" className="flex gap-2">
              <FileText className="h-4 w-4 hidden sm:block" /> Intake
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex gap-2">
              <UploadCloud className="h-4 w-4 hidden sm:block" /> Documents
            </TabsTrigger>
            <TabsTrigger value="demand" className="flex gap-2">
              <FileSignature className="h-4 w-4 hidden sm:block" /> Demand Letter
            </TabsTrigger>
            <TabsTrigger value="forms" className="flex gap-2">
              <FileKey className="h-4 w-4 hidden sm:block" /> Forms
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="intake" className="mt-0">
            <Card>
              <CardContent className="p-0 sm:p-6">
                <IntakeWizard caseData={caseData} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <DocumentsTab caseId={caseId} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="demand" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <DemandLetterTab caseData={caseData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forms" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <FormsTab caseData={caseData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
