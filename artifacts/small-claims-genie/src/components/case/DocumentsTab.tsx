import { useState, useRef, useCallback } from "react";
import { useListDocuments, useUploadDocument, useDeleteDocument } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Trash2, Upload, Eye, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DocumentsTab({ caseId }: { caseId: number }) {
  const { data: documents, isLoading, refetch } = useListDocuments(caseId);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useUploadDocument({
    mutation: {
      onSuccess: () => {
        toast({ title: "Document uploaded successfully" });
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

  const handleFiles = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      uploadMutation.mutate({
        caseId,
        data: {
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          fileSize: file.size,
        }
      });
    });
  }, [caseId, uploadMutation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDelete = (docId: number) => {
    deleteMutation.mutate({ caseId, documentId: docId });
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy">Case Documents</h2>
        <Button onClick={() => fileInputRef.current?.click()} className="bg-navy hover:bg-navy/90 gap-2">
          <Paperclip className="h-4 w-4" />
          Upload Document
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          multiple
          onChange={e => { if (e.target.files) handleFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      <div
        ref={dropRef}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors ${
          isDragging ? "border-navy bg-navy/5" : "border-border bg-muted/10"
        }`}
      >
        <div className="bg-muted/30 p-3 rounded-full mb-3">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="font-semibold text-sm">Drag and drop files here</p>
        <p className="text-xs text-muted-foreground mt-1">Tap or drag to upload — PDF, JPG, PNG accepted</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => fileInputRef.current?.click()}
        >
          Browse Files
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-4 border rounded-xl bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-muted/30 p-2 rounded">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{doc.fileName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">Complete</span>
                    <span className="text-xs text-muted-foreground">{formatSize(doc.fileSize)}</span>
                    <span className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(doc.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-xl border">
          No documents uploaded yet.
        </div>
      )}
    </div>
  );
}
