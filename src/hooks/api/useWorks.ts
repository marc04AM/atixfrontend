import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { worksApi } from '@/lib/api';
import { Work, PaginatedResponse } from '@/types';

// Query key factory
type WorkKeyId = string | number;

const normalizeWorkId = (id: WorkKeyId) => String(id);

export const worksKeys = {
  all: ['works'] as const,
  lists: () => [...worksKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...worksKeys.lists(), { filters }] as const,
  details: () => [...worksKeys.all, 'detail'] as const,
  detail: (id: WorkKeyId) => [...worksKeys.details(), normalizeWorkId(id)] as const,
};

// Fetch all works with filters
export function useWorks(params?: Record<string, any>) {
  return useQuery<PaginatedResponse<Work>>({
    queryKey: worksKeys.list(params),
    queryFn: () => worksApi.getAll(params),
    placeholderData: keepPreviousData,
  });
}

// Fetch single work
export function useWork(id: WorkKeyId) {
  const workId = normalizeWorkId(id);
  return useQuery<Work>({
    queryKey: worksKeys.detail(workId),
    queryFn: () => worksApi.getById(workId),
    enabled: !!id,
  });
}

// Create work mutation
export function useCreateWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => worksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: worksKeys.lists() });
    },
  });
}

// Update work mutation
export function useUpdateWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      worksApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(worksKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: worksKeys.lists() });
    },
  });
}

// Close work mutation
export function useCloseWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => worksApi.close(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: worksKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: worksKeys.lists() });
    },
  });
}

// Invoice work mutation
export function useInvoiceWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => worksApi.invoice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: worksKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: worksKeys.lists() });
    },
  });
}

// Delete work mutation
export function useDeleteWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: WorkKeyId) => worksApi.delete(normalizeWorkId(id)),
    onSuccess: (_, workId) => {
      const normalizedId = normalizeWorkId(workId);
      queryClient.invalidateQueries({ queryKey: worksKeys.lists() });
      queryClient.removeQueries({ queryKey: worksKeys.detail(normalizedId) });
    },
  });
}

// Assign technician mutation
export function useAssignTechnician() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workId, technicianId }: { workId: string; technicianId: string }) =>
      worksApi.assignTechnician(workId, technicianId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: worksKeys.detail(variables.workId) });
    },
  });
}

// Unassign technician mutation
export function useUnassignTechnician() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workId, technicianId }: { workId: string; technicianId: string }) =>
      worksApi.unassignTechnician(workId, technicianId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: worksKeys.detail(variables.workId) });
    },
  });
}

// Add reference mutation
export function useAddReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workId, data }: { workId: string; data: any }) =>
      worksApi.addReference(workId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: worksKeys.detail(variables.workId) });
    },
  });
}

// Remove reference mutation
export function useRemoveReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workId, assignmentId }: { workId: string; assignmentId: string }) =>
      worksApi.removeReference(workId, assignmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: worksKeys.detail(variables.workId) });
    },
  });
}
