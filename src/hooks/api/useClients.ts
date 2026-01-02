import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '@/lib/api';
import { Client, PaginatedResponse } from '@/types';

// Query key factory
export const clientsKeys = {
  all: ['clients'] as const,
  lists: () => [...clientsKeys.all, 'list'] as const,
  list: (page?: number, size?: number) => [...clientsKeys.lists(), { page, size }] as const,
  details: () => [...clientsKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientsKeys.details(), id] as const,
};

// Fetch all clients with pagination
export function useClients(page = 0, size = 20) {
  return useQuery<PaginatedResponse<Client>>({
    queryKey: clientsKeys.list(page, size),
    queryFn: () => clientsApi.getAll(page, size),
  });
}

// Fetch single client
export function useClient(id: string) {
  return useQuery<Client>({
    queryKey: clientsKeys.detail(id),
    queryFn: () => clientsApi.getById(id),
    enabled: !!id,
  });
}

// Create client mutation
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; type: string }) => clientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
    },
  });
}

// Update client mutation
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      clientsApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(clientsKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
    },
  });
}

// Delete client mutation
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
    },
  });
}
