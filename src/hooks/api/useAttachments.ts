import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentsApi } from '@/lib/api';
import { Attachment, AttachmentTargetType } from '@/types';

// Query key factory for attachments
export const attachmentsKeys = {
  all: ['attachments'] as const,
  byTarget: (targetType: AttachmentTargetType, targetId: string) =>
    [...attachmentsKeys.all, targetType, targetId] as const,
};

// Hook to fetch attachments for a specific target
export function useAttachments(targetType: AttachmentTargetType, targetId: string) {
  return useQuery({
    queryKey: attachmentsKeys.byTarget(targetType, targetId),
    queryFn: () => attachmentsApi.getByTarget(targetType, targetId),
    enabled: !!targetId,
  });
}

// Hook to upload an attachment
export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      targetType,
      targetId,
      file,
    }: {
      targetType: AttachmentTargetType;
      targetId: string;
      file: File;
    }) => attachmentsApi.upload(targetType, targetId, file),
    onSuccess: (data, variables) => {
      // Invalidate the attachments list for this target
      queryClient.invalidateQueries({
        queryKey: attachmentsKeys.byTarget(variables.targetType, variables.targetId),
      });
    },
  });
}

// Hook to delete an attachment
export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attachmentId,
      targetType,
      targetId,
    }: {
      attachmentId: string;
      targetType: AttachmentTargetType;
      targetId: string;
    }) => attachmentsApi.delete(attachmentId),
    onSuccess: (_, variables) => {
      // Invalidate the attachments list for this target
      queryClient.invalidateQueries({
        queryKey: attachmentsKeys.byTarget(variables.targetType, variables.targetId),
      });
    },
  });
}
