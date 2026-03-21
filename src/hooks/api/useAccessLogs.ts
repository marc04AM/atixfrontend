import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { accessLogsApi } from '@/lib/api';
import { AccessLog, PaginatedResponse } from '@/types';

export const accessLogsKeys = {
  all: ['access-logs'] as const,
  lists: () => [...accessLogsKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...accessLogsKeys.lists(), { filters }] as const,
};

export function useAccessLogs(params?: Record<string, any> | null) {
  return useQuery<PaginatedResponse<AccessLog>>({
    queryKey: accessLogsKeys.list(params ?? undefined),
    queryFn: () => accessLogsApi.getAll(params ?? undefined),
    placeholderData: keepPreviousData,
    enabled: params !== null,
  });
}
