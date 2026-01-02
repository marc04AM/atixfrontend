import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '@/lib/api';
import { Ticket, PaginatedResponse } from '@/types';

// Query key factory
export const ticketsKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketsKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...ticketsKeys.lists(), { filters }] as const,
  details: () => [...ticketsKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketsKeys.details(), id] as const,
};

// Fetch all tickets with filters
export function useTickets(params?: Record<string, any>) {
  return useQuery<PaginatedResponse<Ticket>>({
    queryKey: ticketsKeys.list(params),
    queryFn: () => ticketsApi.getAll(params),
  });
}

// Fetch single ticket
export function useTicket(id: string) {
  return useQuery<Ticket>({
    queryKey: ticketsKeys.detail(id),
    queryFn: () => ticketsApi.getById(id),
    enabled: !!id,
  });
}

// Create ticket mutation
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => ticketsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
    },
  });
}

// Update ticket mutation
export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      ticketsApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(ticketsKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
    },
  });
}

// Delete ticket mutation
export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
    },
  });
}
