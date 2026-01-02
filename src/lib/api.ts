// API configuration and helper functions
// This will connect to your backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Get stored auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// API request helper
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Try to parse error response
    const error = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`
    }));

    // Handle specific status codes
    if (response.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      window.location.href = '/login';
      throw new Error(error.message || 'Authentication required');
    }

    if (response.status === 403) {
      throw new Error(error.message || 'Permission denied');
    }

    if (response.status === 404) {
      throw new Error(error.message || 'Resource not found');
    }

    if (response.status === 500) {
      throw new Error(error.message || 'Server error. Please try again later.');
    }

    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{
      token: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      id?: string;
      profileImageUrl?: string;
    }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    ),
};

// Users API
export const usersApi = {
  getAll: () => apiRequest<any[]>('/users'),
  getByType: (type: string) => apiRequest<any[]>(`/users/type/${type}`),
  getById: (id: string) => apiRequest<any>(`/users/${id}`),
  create: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    type: string;
  }) =>
    apiRequest<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest<any>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  updatePassword: (id: string, data: { currentPassword: string; newPassword: string }) =>
    apiRequest<void>(`/users/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  uploadAvatar: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/users/${id}/avatar`, {
      method: 'PATCH',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }

    return response.json();
  },
  delete: (id: string) =>
    apiRequest<void>(`/users/${id}`, { method: 'DELETE' }),
};

// Clients API
export const clientsApi = {
  getAll: (page = 0, size = 20) =>
    apiRequest<any>(`/clients?page=${page}&size=${size}`),
  getById: (id: string) => apiRequest<any>(`/clients/${id}`),
  create: (data: { name: string; type: string }) =>
    apiRequest<any>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest<any>(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/clients/${id}`, { method: 'DELETE' }),
};

// Plants API
export const plantsApi = {
  getAll: (page = 0, size = 20) =>
    apiRequest<any>(`/plants?page=${page}&size=${size}`),
  getById: (id: string) => apiRequest<any>(`/plants/${id}`),
  create: (data: any) =>
    apiRequest<any>('/plants', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest<any>(`/plants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/plants/${id}`, { method: 'DELETE' }),
};

// Works API
export const worksApi = {
  getAll: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    return apiRequest<any>(`/works?${searchParams.toString()}`);
  },
  getById: (id: string) => apiRequest<any>(`/works/${id}`),
  create: (data: any) =>
    apiRequest<any>('/works', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest<any>(`/works/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  close: (id: string) =>
    apiRequest<any>(`/works/${id}/close`, { method: 'PATCH' }),
  invoice: (id: string) =>
    apiRequest<any>(`/works/${id}/invoice`, { method: 'PATCH' }),
  assignTechnician: (id: string, technicianId: string) =>
    apiRequest<any>(`/works/${id}/assign-technician`, {
      method: 'POST',
      body: JSON.stringify({ technicianId }),
    }),
  addReference: (id: string, data: any) =>
    apiRequest<any>(`/works/${id}/add-reference`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Tickets API
export const ticketsApi = {
  getAll: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    return apiRequest<any>(`/tickets?${searchParams.toString()}`);
  },
  getById: (id: string) => apiRequest<any>(`/tickets/${id}`),
  create: (data: any) =>
    apiRequest<any>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest<any>(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/tickets/${id}`, { method: 'DELETE' }),
};

// Work Reports API
export const workReportsApi = {
  getByWorkId: (workId: string) =>
    apiRequest<any>(`/work-reports/work/${workId}`),
  createEntry: (data: { workId: string; description: string; hours: number }) =>
    apiRequest<any>('/work-reports/entries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getEntries: (workId: string) =>
    apiRequest<any[]>(`/work-reports/entries/work/${workId}`),
  updateEntry: (id: string, data: { description?: string; hours?: number }) =>
    apiRequest<any>(`/work-reports/entries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteEntry: (id: string) =>
    apiRequest<void>(`/work-reports/entries/${id}`, { method: 'DELETE' }),
};

// Dashboard API
export const dashboardApi = {
  getSummary: async (limit = 5) => {
    try {
      // Try GraphQL endpoint first
      const query = `
        query {
          dashboardSummary(limit: ${limit}) {
            clientCount
            plantCount
            completedWorkCount
            pendingWorkCount
            ticketStatusCounts {
              status
              count
            }
            recentWorks {
              id
              name
              orderDate
              completed
              invoiced
            }
            recentTickets {
              id
              name
              senderEmail
              status
              createdAt
            }
          }
        }
      `;

      const response = await apiRequest<any>('/graphql', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });

      // Handle GraphQL response
      if (response?.data?.dashboardSummary) {
        return response.data.dashboardSummary;
      }
    } catch (graphqlError) {
      console.warn('GraphQL dashboard endpoint not available, using REST endpoints');
    }

    // Fallback: Use REST endpoints to build dashboard data
    try {
      const [clientsRes, plantsRes, worksRes, ticketsRes] = await Promise.all([
        apiRequest<PaginatedResponse<any>>('/clients?page=0&size=1'),
        apiRequest<PaginatedResponse<any>>('/plants?page=0&size=1'),
        apiRequest<PaginatedResponse<any>>('/works?page=0&size=100'),
        apiRequest<PaginatedResponse<any>>('/tickets?page=0&size=100'),
      ]);

      const works = worksRes.content || [];
      const tickets = ticketsRes.content || [];

      // Calculate counts
      const completedWorks = works.filter((w: any) => w.completed);
      const pendingWorks = works.filter((w: any) => !w.completed);

      // Count tickets by status
      const ticketStatusCounts = tickets.reduce((acc: any[], ticket: any) => {
        const existing = acc.find((t) => t.status === ticket.status);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ status: ticket.status, count: 1 });
        }
        return acc;
      }, []);

      // Get recent works (sorted by orderDate descending)
      const recentWorks = works
        .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
        .slice(0, limit);

      // Get recent tickets (sorted by createdAt descending)
      const recentTickets = tickets
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);

      return {
        clientCount: clientsRes.totalElements || 0,
        plantCount: plantsRes.totalElements || 0,
        completedWorkCount: completedWorks.length,
        pendingWorkCount: pendingWorks.length,
        ticketStatusCounts,
        recentWorks,
        recentTickets,
      };
    } catch (restError) {
      console.error('Dashboard REST fallback error:', restError);
      // Return empty data as last resort
      return {
        clientCount: 0,
        plantCount: 0,
        completedWorkCount: 0,
        pendingWorkCount: 0,
        ticketStatusCounts: [],
        recentWorks: [],
        recentTickets: [],
      };
    }
  },
};
