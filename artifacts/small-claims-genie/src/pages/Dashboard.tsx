import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDashboard, useListCases } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Clock, CheckCircle2, Plus, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: dashboard, isLoading: isLoadingDash } = useGetDashboard();
  const { data: cases, isLoading: isLoadingCases } = useListCases();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Your Cases</h1>
          </div>
          <Button asChild size="sm" className="gap-2">
            <Link href="/cases/new">
              <Plus className="mr-2 h-5 w-5" />
              Start New Case
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="border-0 bg-primary/5">
            <CardContent className="p-6 flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Cases</p>
                {isLoadingDash ? <Skeleton className="h-8 w-16" /> : (
                  <p className="text-3xl font-bold">{dashboard?.totalCases || 0}</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-primary/5">
            <CardContent className="p-6 flex items-center gap-4">
              <Clock className="h-8 w-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Intakes</p>
                {isLoadingDash ? <Skeleton className="h-8 w-16" /> : (
                  <p className="text-3xl font-bold">{dashboard?.pendingIntakes || 0}</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-primary/5">
            <CardContent className="p-6 flex items-center gap-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                {isLoadingDash ? <Skeleton className="h-8 w-16" /> : (
                  <p className="text-3xl font-bold">{dashboard?.completedIntakes || 0}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoadingCases ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !cases || cases.length === 0 ? (
          <div className="p-14 text-center border-dashed rounded-2xl border">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">You haven't started any cases yet.</p>
            <Button asChild className="gap-2">
              <Link href="/cases/new">
                <Plus className="mr-2 h-5 w-5" />
                Start Your First Case
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((c) => (
              <Card key={c.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div className="mb-4 sm:mb-0">
                    <h4 className="font-semibold text-lg">{c.claimDescription || c.claimType || "New Case"}</h4>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      {c.plaintiffName && <span>Plaintiff: {c.plaintiffName}</span>}
                      {c.amountClaimed && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-primary">${c.amountClaimed}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {c.intakeComplete ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                          Step {c.intakeStep} of 7
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Updated {new Date(c.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link href={`/cases/${c.id}`} className="w-full sm:w-auto inline-flex h-9 items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors">
                    {c.intakeComplete ? "View Case" : "Continue"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
