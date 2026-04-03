import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDashboard, useListCases, useCreateCase } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Clock, CheckCircle2, Plus, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: dashboard, isLoading: isLoadingDash } = useGetDashboard();
  const { data: cases, isLoading: isLoadingCases } = useListCases();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPlaintiffName, setNewPlaintiffName] = useState("");
  
  const createMutation = useCreateCase({
    mutation: {
      onSuccess: (newCase) => {
        setIsCreateOpen(false);
        setLocation(`/cases/${newCase.id}`);
      }
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaintiffName.trim()) return;
    createMutation.mutate({ data: { plaintiffName: newPlaintiffName } });
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your active cases and intake forms.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Start New Case
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Cases</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoadingDash ? <Skeleton className="h-8 w-16" /> : (
                <div className="text-3xl font-bold">{dashboard?.totalCases || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Intakes</CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              {isLoadingDash ? <Skeleton className="h-8 w-16" /> : (
                <div className="text-3xl font-bold">{dashboard?.pendingIntakes || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {isLoadingDash ? <Skeleton className="h-8 w-16" /> : (
                <div className="text-3xl font-bold">{dashboard?.completedIntakes || 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cases List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Cases</CardTitle>
            <CardDescription>Recent cases and their current progress.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCases ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : !cases || cases.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No cases yet</h3>
                <p className="text-muted-foreground mb-4">Start your first case to begin the intake process.</p>
                <Button onClick={() => setIsCreateOpen(true)} variant="outline">Create Case</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cases.map((c) => (
                  <div key={c.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors bg-card">
                    <div className="mb-4 sm:mb-0">
                      <h4 className="font-semibold text-lg">{c.claimType || "New Case"}</h4>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <span>Plaintiff: {c.plaintiffName}</span>
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
                            Step {c.intakeStep} of 4
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Start New Case</DialogTitle>
              <DialogDescription>Enter your legal name as it appears on your ID. You will be the plaintiff.</DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <Label htmlFor="name">Plaintiff Full Name</Label>
              <Input
                id="name"
                value={newPlaintiffName}
                onChange={(e) => setNewPlaintiffName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="mt-2"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!newPlaintiffName.trim() || createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Case"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
