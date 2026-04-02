import { useState } from "react";
import { useListDocuments, useUploadDocument, useDeleteDocument } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Trash2, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DocumentsTab({ caseId }: { caseId: number }) {
  const { data: documents, isLoading, refetch } = useListDocuments(caseId);
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);

  const uploadMutation = useUploadDocument({
    mutation: {
      onSuccess: () => {
        toast({ title: "Document uploaded successfully" });
        setFile(null);
        refetch();
      },
      onError: () => {
        toast({ title: "Failed to upload document", variant: "destructive" });
      }
    }
  });

  const deleteMutation = useDeleteDocument({
    mutation: {
      onSuccess: () => {
        toast({ title: "Document deleted" });
        refetch();
      },
      onError: () => {
        toast({ title: "Failed to delete document", variant: "destructive" });
      }
    }
  });

  const handleUpload = () => {
    if (!file) return;
    uploadMutation.mutate({
      caseId,
      data: {
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
      }
    });
  };

  const handleDelete = (docId: number) => {
    deleteMutation.mutate({ caseId, documentId: docId });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Evidence & Documents</h2>
        <p className="text-muted-foreground">Upload receipts, contracts, photos, and any other evidence for your case.</p>
      </div>

      <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/20">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-semibold mb-1">Upload a document</h3>
        <p className="text-sm text-muted-foreground mb-4">PDF, JPG, PNG up to 10MB</p>

        <div className="flex gap-2 items-center">
          <Input
            type="file"
            className="max-w-[250px]"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Button onClick={handleUpload} disabled={!file || uploadMutation.isPending}>
            {uploadMutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">Case Files</h3>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : !documents || documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-lg border">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{doc.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {(doc.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(doc.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
