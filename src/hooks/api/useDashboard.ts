import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';

// Query key factory
export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: (limit?: number) => [...dashboardKeys.all, 'summary', limit] as const,
};

// Fetch dashboard summary
export function useDashboard(limit = 5) {
  return useQuery({
    queryKey: dashboardKeys.summary(limit),
    queryFn: () => dashboardApi.getSummary(limit),
  });
}
