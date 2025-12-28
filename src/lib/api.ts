// API configuration and helper functions
// This will connect to your backend at localhost:3001/api

const API_BASE_URL = 'http://localhost:3001/api';

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
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; email: string; firstName: string; lastName: string; role: string }>(
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
    userType: string;
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

// Dashboard API (GraphQL)
export const dashboardApi = {
  getSummary: async (limit = 5) => {
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
    
    const response = await apiRequest<{ data: { dashboardSummary: any } }>('/graphql', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    
    return response.data.dashboardSummary;
  },
};
