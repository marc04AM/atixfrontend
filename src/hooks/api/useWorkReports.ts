import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workReportsApi } from '@/lib/api';

// Query key factory
export const workReportsKeys = {
  all: ['workReports'] as const,
  byWork: (workId: string) => [...workReportsKeys.all, 'work', workId] as const,
  entries: (workId: string) => [...workReportsKeys.all, 'entries', workId] as const,
};

// Fetch work report by work ID
export function useWorkReport(workId: string) {
  return useQuery({
    queryKey: workReportsKeys.byWork(workId),
    queryFn: () => workReportsApi.getByWorkId(workId),
    enabled: !!workId,
  });
}

// Fetch work report entries
export function useWorkReportEntries(workId: string) {
  return useQuery({
    queryKey: workReportsKeys.entries(workId),
    queryFn: () => workReportsApi.getEntries(workId),
    enabled: !!workId,
  });
}

// Create work report entry mutation
export function useCreateReportEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { workId: string; description: string; hours: number }) =>
      workReportsApi.createEntry(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workReportsKeys.byWork(variables.workId) });
      queryClient.invalidateQueries({ queryKey: workReportsKeys.entries(variables.workId) });
    },
  });
}

// Update work report entry mutation
export function useUpdateReportEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, workId, data }: { id: string; workId: string; data: { description?: string; hours?: number } }) =>
      workReportsApi.updateEntry(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workReportsKeys.byWork(variables.workId) });
      queryClient.invalidateQueries({ queryKey: workReportsKeys.entries(variables.workId) });
    },
  });
}

// Delete work report entry mutation
export function useDeleteReportEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, workId }: { id: string; workId: string }) =>
      workReportsApi.deleteEntry(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workReportsKeys.byWork(variables.workId) });
      queryClient.invalidateQueries({ queryKey: workReportsKeys.entries(variables.workId) });
    },
  });
}
