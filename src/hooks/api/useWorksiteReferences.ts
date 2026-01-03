import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { worksiteReferencesApi } from '@/lib/api';
import { WorksiteReference } from '@/types';

// Query key factory
export const worksiteReferencesKeys = {
  all: ['worksiteReferences'] as const,
  lists: () => [...worksiteReferencesKeys.all, 'list'] as const,
  details: () => [...worksiteReferencesKeys.all, 'detail'] as const,
  detail: (id: string) => [...worksiteReferencesKeys.details(), id] as const,
};

// Fetch all worksite references
export function useWorksiteReferences() {
  return useQuery<WorksiteReference[]>({
    queryKey: worksiteReferencesKeys.lists(),
    queryFn: () => worksiteReferencesApi.getAll(),
  });
}

// Fetch single worksite reference
export function useWorksiteReference(id: string) {
  return useQuery<WorksiteReference>({
    queryKey: worksiteReferencesKeys.detail(id),
    queryFn: () => worksiteReferencesApi.getById(id),
    enabled: !!id,
  });
}

// Create worksite reference mutation
export function useCreateWorksiteReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; telephone?: string; notes?: string }) =>
      worksiteReferencesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: worksiteReferencesKeys.lists() });
    },
  });
}

// Update worksite reference mutation
export function useUpdateWorksiteReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; telephone?: string; notes?: string } }) =>
      worksiteReferencesApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(worksiteReferencesKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: worksiteReferencesKeys.lists() });
    },
  });
}

// Delete worksite reference mutation
export function useDeleteWorksiteReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => worksiteReferencesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: worksiteReferencesKeys.lists() });
    },
  });
}
