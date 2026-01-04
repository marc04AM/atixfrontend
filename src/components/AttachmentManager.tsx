import { useState, useCallback } from 'react';
import { Upload, File, Image, FileText, Download, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAttachments, useUploadAttachment, useDeleteAttachment } from '@/hooks/api/useAttachments';
import { AttachmentType, AttachmentTargetType, Attachment } from '@/types';
import { cn } from '@/lib/utils';

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
  const { t } = useTranslation('attachments');
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Fetch attachments from API
  const { data, isLoading } = useAttachments(targetType, targetId);
  const attachments = data ?? [];

  // Upload mutation
  const uploadMutation = useUploadAttachment();

  // Delete mutation
  const deleteMutation = useDeleteAttachment();

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    try {
      for (const file of fileArray) {
        await uploadMutation.mutateAsync({
          targetType,
          targetId,
          file,
        });
      }
      toast({ title: t('common:titles.success'), description: t('messages.uploadSuccess', { count: fileArray.length }) });
    } catch {
      toast({ title: t('common:titles.error'), description: t('messages.uploadError'), variant: 'destructive' });
    }
  }, [targetType, targetId, uploadMutation, toast]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    await uploadFiles(files);
    event.target.value = '';
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!readOnly) {
      setIsDragOver(true);
    }
  }, [readOnly]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (readOnly || uploadMutation.isPending) return;

    const files = e.dataTransfer.files;
    await uploadFiles(files);
  }, [readOnly, uploadMutation.isPending, uploadFiles]);

  const handleDelete = async (attachmentId: string) => {
    try {
      await deleteMutation.mutateAsync({
        attachmentId,
        targetType,
        targetId,
      });
      toast({ title: t('common:titles.deleted'), description: t('messages.deleteSuccess') });
    } catch {
      toast({ title: t('common:titles.error'), description: t('messages.deleteError'), variant: 'destructive' });
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
          <CardTitle className="text-lg">{t('title')}</CardTitle>
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
        <CardTitle className="text-lg">{t('title')}</CardTitle>
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
              {uploadMutation.isPending ? t('uploading') : t('upload')}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {/* Drop Zone */}
        {!readOnly && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 mb-4 text-center transition-colors",
              isDragOver 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/25 hover:border-muted-foreground/50",
              uploadMutation.isPending && "opacity-50 pointer-events-none"
            )}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragOver ? t('dropHere') : t('dropZone')}
            </p>
          </div>
        )}

        {attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('noAttachments')}
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
            <DialogTitle>{t('imagePreview')}</DialogTitle>
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
