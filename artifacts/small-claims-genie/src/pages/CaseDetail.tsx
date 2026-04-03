import { AppLayout } from "@/components/layout/AppLayout";
import { useGetCase, useDeleteCase } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, FileText, MessageSquare, Mail, Scale, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { IntakeWizard } from "@/components/case/IntakeWizard";
import { DocumentsTab } from "@/components/case/DocumentsTab";
import { DemandLetterTab } from "@/components/case/DemandLetterTab";
import { FormsTab } from "@/components/case/FormsTab";
import { AskGenie } from "@/components/AskGenie";

export default function CaseDetail({ id }: { id: string }) {
  const caseId = parseInt(id, 10);
  const [, setLocation] = useLocation();

  const { data: caseData, isLoading } = useGetCase(caseId);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-8">
          <Skeleton className="h-12 w-1/3 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!caseData) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Case not found.</h2>
          <Link href="/dashboard" className="text-primary hover:underline mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 pt-3 pb-6 max-w-6xl flex flex-col gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary border rounded-md px-3 py-1.5 transition-colors w-fit bg-background hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Your Cases
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-5 rounded-xl border shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">
                {caseData.claimDescription || caseData.plaintiffName || "Untitled Case"}
              </h1>
              {caseData.intakeComplete ? (
                <Badge variant="default" className="capitalize text-sm">Complete</Badge>
              ) : (
                <Badge variant="secondary" className="capitalize text-sm">In Progress</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {caseData.amountClaimed
                ? <>Claim Amount: <span className="font-semibold text-foreground">${Number(caseData.amountClaimed).toLocaleString()}</span></>
                : "No amount set yet"
              }
            </p>
          </div>
        </div>

        <Tabs defaultValue="intake" className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-auto p-1 bg-muted/80 rounded-xl gap-1">
            <TabsTrigger
              value="intake"
              data-testid="tab-intake"
              className="flex flex-col sm:flex-row items-center gap-1.5 py-3 px-2 text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              <ClipboardList className="h-4 w-4 shrink-0" />
              <span>Intake</span>
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              data-testid="tab-documents"
              className="flex flex-col sm:flex-row items-center gap-1.5 py-3 px-2 text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              data-testid="tab-chat"
              className="flex flex-col sm:flex-row items-center gap-1.5 py-3 px-2 text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span>Ask The Genie AI</span>
            </TabsTrigger>
            <TabsTrigger
              value="demand-letter"
              data-testid="tab-demand-letter"
              className="flex flex-col sm:flex-row items-center gap-1.5 py-3 px-2 text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              <Mail className="h-4 w-4 shrink-0" />
              <span>Demand Letter</span>
            </TabsTrigger>
            <TabsTrigger
              value="forms"
              data-testid="tab-forms"
              className="flex flex-col sm:flex-row items-center gap-1.5 py-3 px-2 text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              <Scale className="h-4 w-4 shrink-0" />
              <span>Forms</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="intake">
            <IntakeWizard caseData={caseData} />
          </TabsContent>
          <TabsContent value="documents">
            <DocumentsTab caseId={caseId} />
          </TabsContent>
          <TabsContent value="chat">
            <AskGenie caseData={caseData} />
          </TabsContent>
          <TabsContent value="demand-letter">
            <DemandLetterTab caseData={caseData} />
          </TabsContent>
          <TabsContent value="forms">
            <FormsTab caseData={caseData} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
