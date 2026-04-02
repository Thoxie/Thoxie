import { useGetDashboardSummary, getGetDashboardSummaryQueryKey, useGetRecentActivity, getGetRecentActivityQueryKey, useListClaims, getListClaimsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { 
  FileText, 
  Scale, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  PlusCircle,
  ChevronRight,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({
    query: {
      queryKey: getGetDashboardSummaryQueryKey()
    }
  });

  const { data: recentActivity, isLoading: loadingActivity } = useGetRecentActivity(
    { limit: 5 },
    { query: { queryKey: getGetRecentActivityQueryKey({ limit: 5 }) } }
  );

  const { data: claimsData, isLoading: loadingClaims } = useListClaims(
    { limit: 5 },
    { query: { queryKey: getListClaimsQueryKey({ limit: 5 }) } }
  );

  return (
    <div className="flex-1 h-full overflow-auto bg-gray-50/50">
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-1">Here is the latest on your small claims cases.</p>
          </div>
          <Link href="/claims/new">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
              <PlusCircle className="mr-2 h-5 w-5" />
              Start New Claim
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Claims</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{summary?.totalClaims || 0}</div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{summary?.draftClaims || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Hearings</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{summary?.upcomingHearings || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm bg-primary text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/80">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-primary-foreground/80" />
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <Skeleton className="h-8 w-24 bg-primary-foreground/20" />
              ) : (
                <div className="text-2xl font-bold">
                  ${(summary?.totalClaimValue || 0).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Claims */}
          <Card className="lg:col-span-2 border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Claims</CardTitle>
                <CardDescription>Your most recently modified claims</CardDescription>
              </div>
              <Link href="/claims">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  View All <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loadingClaims ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !claimsData?.claims?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-8 w-8 mb-3 opacity-50" />
                  <p>No claims yet.</p>
                  <Link href="/claims/new">
                    <Button variant="link" className="mt-2 text-primary">Start your first claim</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {claimsData.claims.map(claim => (
                    <div key={claim.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="bg-muted p-2 rounded-md">
                          <Scale className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <Link href={`/claims/${claim.id}`}>
                            <h3 className="font-medium hover:text-primary transition-colors cursor-pointer">
                              Vs. {claim.defendantName || "Unknown Defendant"}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>Last updated {format(new Date(claim.updatedAt), 'MMM d, yyyy')}</span>
                            <span>•</span>
                            <span className="font-medium text-foreground">${claim.claimAmount?.toLocaleString() || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">
                          {claim.status.replace('_', ' ')}
                        </Badge>
                        <Link href={`/claims/${claim.id}`}>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingActivity ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-2 w-2 mt-2 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !recentActivity?.activities?.length ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No recent activity.
                </div>
              ) : (
                <div className="relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  <div className="space-y-6">
                    {recentActivity.activities.map((activity, index) => (
                      <div key={activity.id} className="relative flex items-start justify-between gap-4">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-background border-2 border-primary shrink-0 mt-0.5 z-10" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                          <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                            {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
