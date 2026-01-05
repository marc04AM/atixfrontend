import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workReportsApi } from '@/lib/api';

// Query key factory
type WorkReportKeyId = string | number;

const normalizeWorkReportId = (id: WorkReportKeyId) => String(id);

export const workReportsKeys = {
  all: ['workReports'] as const,
  byWork: (workId: WorkReportKeyId) => [
    ...workReportsKeys.all,
    'work',
    normalizeWorkReportId(workId),
  ] as const,
  entries: (workId: WorkReportKeyId) => [
    ...workReportsKeys.all,
    'entries',
    normalizeWorkReportId(workId),
  ] as const,
};

// Fetch work report by work ID
export function useWorkReport(workId: WorkReportKeyId) {
  const normalizedWorkId = normalizeWorkReportId(workId);
  return useQuery({
    queryKey: workReportsKeys.byWork(normalizedWorkId),
    queryFn: () => workReportsApi.getByWorkId(normalizedWorkId),
    enabled: !!workId,
  });
}

// Fetch work report entries
export function useWorkReportEntries(workId: WorkReportKeyId) {
  const normalizedWorkId = normalizeWorkReportId(workId);
  return useQuery({
    queryKey: workReportsKeys.entries(normalizedWorkId),
    queryFn: () => workReportsApi.getEntries(normalizedWorkId),
    enabled: !!workId,
  });
}

// Create work report entry mutation
export function useCreateReportEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { workId: string; description: string; hours: number; date?: string; technicianId?: string }) =>
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
    mutationFn: ({ id, workId, data }: { id: string; workId: string; data: { description?: string; hours?: number; date?: string } }) =>
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
