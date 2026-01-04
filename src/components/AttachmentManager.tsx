import { useState } from 'react';
import { Upload, File, Image, FileText, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAttachments, useUploadAttachment, useDeleteAttachment } from '@/hooks/api/useAttachments';
import { AttachmentType, AttachmentTargetType, Attachment } from '@/types';

interface AttachmentManagerProps {
  targetType: AttachmentTargetType;
  targetId: string;
  readOnly?: boolean;
}

const getAttachmentIcon = (type: AttachmentType) => {
  switch (type) {
    case 'PHOTO':
      return Image;
    case 'PDF':
      return FileText;
    case 'DOC':
      return FileText;
    default:
      return File;
  }
};

export default function AttachmentManager({
  targetType,
  targetId,
  readOnly = false,
}: AttachmentManagerProps) {
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch attachments from API
  const { data: attachments = [], isLoading } = useAttachments(targetType, targetId);

  // Upload mutation
  const uploadMutation = useUploadAttachment();

  // Delete mutation
  const deleteMutation = useDeleteAttachment();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      // Upload files sequentially to avoid race conditions
      for (const file of Array.from(files)) {
        await uploadMutation.mutateAsync({
          targetType,
          targetId,
          file,
        });
      }
      toast({ title: 'Success', description: `${files.length} file(s) uploaded` });
    } catch {
      toast({ title: 'Error', description: 'Failed to upload files', variant: 'destructive' });
    } finally {
      event.target.value = '';
    }
  };

  const handleDelete = async (attachmentId: string) => {
    try {
      await deleteMutation.mutateAsync({
        attachmentId,
        targetType,
        targetId,
      });
      toast({ title: 'Deleted', description: 'Attachment removed' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete attachment', variant: 'destructive' });
    }
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.publicId;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (attachment: Attachment) => {
    if (attachment.type === 'PHOTO') {
      setPreviewImage(attachment.url);
    } else {
      handleDownload(attachment);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Attachments</CardTitle>
        {!readOnly && (
          <div className="relative">
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploadMutation.isPending}
            />
            <Button variant="outline" size="sm" disabled={uploadMutation.isPending}>
              <Upload className="mr-2 h-4 w-4" />
              {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No attachments yet
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {attachments.map((attachment: Attachment) => {
              const Icon = getAttachmentIcon(attachment.type);
              const isImage = attachment.type === 'PHOTO';

              return (
                <div
                  key={attachment.id}
                  className="group relative border rounded-lg overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  {isImage ? (
                    <div
                      className="aspect-square cursor-pointer"
                      onClick={() => handlePreview(attachment)}
                    >
                      <img
                        src={attachment.url}
                        alt={attachment.publicId}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="aspect-square flex flex-col items-center justify-center cursor-pointer p-4"
                      onClick={() => handlePreview(attachment)}
                    >
                      <Icon className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground text-center truncate w-full">
                        {attachment.publicId}
                      </p>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(attachment);
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    {!readOnly && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6"
                        disabled={deleteMutation.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(attachment.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
