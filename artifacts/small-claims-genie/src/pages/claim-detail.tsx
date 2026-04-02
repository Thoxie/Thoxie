import { useLocation, useParams } from "wouter";
import { useGetClaim, getGetClaimQueryKey, useDeleteClaim } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Scale, 
  MapPin, 
  User, 
  Building2, 
  DollarSign,
  FileText,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ClaimDetail() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  
  const id = parseInt(params.id!);

  const { data: claim, isLoading } = useGetClaim(id, {
    query: {
      enabled: !!id,
      queryKey: getGetClaimQueryKey(id)
    }
  });

  const deleteClaim = useDeleteClaim();

  const handleDelete = async () => {
    try {
      await deleteClaim.mutateAsync({ id });
      toast({ title: "Claim deleted successfully" });
      setLocation("/");
    } catch (error) {
      toast({ title: "Failed to delete claim", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="col-span-1 space-y-6">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold">Claim not found</h2>
        <p className="text-muted-foreground mb-6">The claim you are looking for does not exist or has been deleted.</p>
        <Button onClick={() => setLocation("/")}>Return to Dashboard</Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return "bg-gray-100 text-gray-800 border-gray-200";
      case 'filed': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'served': return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case 'hearing_scheduled': return "bg-purple-100 text-purple-800 border-purple-200";
      case 'resolved': return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="-ml-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">Vs. {claim.defendantName}</h1>
                <Badge variant="outline" className={`capitalize px-2.5 py-0.5 ${getStatusColor(claim.status)}`}>
                  {claim.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Created on {format(new Date(claim.createdAt), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setLocation(`/claims/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Claim
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-transparent">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this claim?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the claim
                    and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <div className="bg-primary p-6 text-primary-foreground flex justify-between items-center">
                <div>
                  <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wider mb-1">Claim Amount</p>
                  <h2 className="text-4xl font-bold tracking-tight">${claim.claimAmount?.toLocaleString() || 0}</h2>
                </div>
                <div className="bg-white/10 p-4 rounded-full">
                  <DollarSign className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Description of Dispute
                </h3>
                <div className="bg-muted/30 p-4 rounded-lg border border-border/50 text-sm leading-relaxed whitespace-pre-wrap">
                  {claim.claimDescription || "No description provided."}
                </div>
                
                {claim.claimDate && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Date of incident: <span className="font-medium text-foreground">{claim.claimDate}</span></span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Plaintiff Info (You)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Name</p>
                    <p className="font-medium">{claim.plaintiffName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Address</p>
                    <p className="text-sm">{claim.plaintiffAddress || "Not provided"}</p>
                    {(claim.plaintiffCity || claim.plaintiffState || claim.plaintiffZip) && (
                      <p className="text-sm">{claim.plaintiffCity}, {claim.plaintiffState} {claim.plaintiffZip}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-sm">{claim.plaintiffPhone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Email</p>
                      <p className="text-sm truncate" title={claim.plaintiffEmail}>{claim.plaintiffEmail || "—"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm border-amber-200/50">
                <CardHeader className="pb-3 border-b border-border/50 bg-amber-50/50">
                  <CardTitle className="text-base flex items-center gap-2 text-amber-900">
                    <Building2 className="h-4 w-4 text-amber-600" />
                    Defendant Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Name</p>
                    <p className="font-medium">{claim.defendantName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Address</p>
                    <p className="text-sm">{claim.defendantAddress || "Not provided"}</p>
                    {(claim.defendantCity || claim.defendantState || claim.defendantZip) && (
                      <p className="text-sm">{claim.defendantCity}, {claim.defendantState} {claim.defendantZip}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-sm">{claim.defendantPhone || "—"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  Court & Jurisdiction
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Court</p>
                  <p className="text-sm font-medium">{claim.courtName || "Not specified"}</p>
                  <p className="text-sm text-muted-foreground mt-1">{claim.courtAddress}</p>
                </div>
                {claim.caseNumber && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Case Number</p>
                    <p className="font-mono text-sm font-bold bg-muted/50 p-1.5 rounded inline-block">{claim.caseNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Reason for Venue</p>
                  <p className="text-sm capitalize">{claim.filingReasonLocation?.replace(/_/g, ' ') || "Not specified"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm bg-blue-50/50 border-blue-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-3 text-sm text-blue-800">
                  {claim.status === 'draft' && (
                    <>
                      <p>1. Review your claim details.</p>
                      <p>2. Edit any missing information.</p>
                      <p>3. Submit the claim to move forward.</p>
                      <Button className="w-full mt-2" onClick={() => setLocation(`/claims/${id}/edit`)}>Continue Editing</Button>
                    </>
                  )}
                  {claim.status === 'filed' && (
                    <>
                      <p className="font-medium">Your claim is filed.</p>
                      <p>The court will review and issue a case number and hearing date.</p>
                      <p>Once you receive the stamped SC-100 form, you must have the defendant served.</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
