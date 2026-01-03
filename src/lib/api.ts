// API configuration and helper functions
// This will connect to your backend

import { PaginatedResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Get stored auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const isDemoToken = (token: string | null) => token?.startsWith('demo-token-') ?? false;

let demoIdCounter = 1;

const createDemoId = (prefix: string) => {
  const id = `${prefix}-${Date.now()}-${demoIdCounter}`;
  demoIdCounter += 1;
  return id;
};

const createDemoStore = () => {
  const users = [
    {
      id: 'demo-admin',
      email: 'admin@demo.com',
      firstName: 'Ava',
      lastName: 'Rossi',
      role: 'ADMIN',
      type: 'ADMINISTRATION',
      profileImageUrl: '',
    },
    {
      id: 'demo-owner',
      email: 'owner@demo.com',
      firstName: 'Marco',
      lastName: 'Manfrin',
      role: 'OWNER',
      type: 'TECHNICIAN',
      profileImageUrl: '',
    },
    {
      id: 'demo-tech-1',
      email: 'luca@demo.com',
      firstName: 'Luca',
      lastName: 'Bianchi',
      role: 'USER',
      type: 'TECHNICIAN',
      profileImageUrl: '',
    },
    {
      id: 'demo-tech-2',
      email: 'giulia@demo.com',
      firstName: 'Giulia',
      lastName: 'Conti',
      role: 'USER',
      type: 'TECHNICIAN',
      profileImageUrl: '',
    },
    {
      id: 'demo-seller-1',
      email: 'sara@demo.com',
      firstName: 'Sara',
      lastName: 'Gallo',
      role: 'USER',
      type: 'SELLER',
      profileImageUrl: '',
    },
  ];

  const clients = [
    { id: 'client-atix-1', name: 'Atix Automation', type: 'ATIX' },
    { id: 'client-final-1', name: 'Nova Foods', type: 'FINAL' },
    { id: 'client-final-2', name: 'Helios Packaging', type: 'FINAL' },
  ];

  const plants = [
    {
      id: 'plant-1',
      name: 'Bologna Plant',
      notes: 'Main packaging line',
      nasDirectory: '/nas/bologna',
      pswPhrase: 'bologna-demo',
      pswPlatform: 'PLC',
      pswStation: 'WS-01',
    },
    {
      id: 'plant-2',
      name: 'Verona Plant',
      notes: 'Automation retrofit',
      nasDirectory: '/nas/verona',
      pswPhrase: 'verona-demo',
      pswPlatform: 'SCADA',
      pswStation: 'WS-12',
    },
  ];

  const tickets = [
    {
      id: 'ticket-1',
      name: 'Line 4 PLC alarm',
      description: 'Alarm 205 on line 4 after firmware update.',
      senderEmail: 'ops@novafoods.com',
      status: 'OPEN',
      createdAt: '2024-11-02T09:15:00Z',
    },
    {
      id: 'ticket-2',
      name: 'Robot cell restart issue',
      description: 'Controller reboots during cycle change.',
      senderEmail: 'maintenance@helios.com',
      status: 'IN_PROGRESS',
      createdAt: '2024-10-26T14:30:00Z',
    },
    {
      id: 'ticket-3',
      name: 'Safety relay validation',
      description: 'Need verification for the new safety relay wiring.',
      senderEmail: 'qa@novafoods.com',
      status: 'RESOLVED',
      createdAt: '2024-10-01T08:10:00Z',
    },
    {
      id: 'ticket-4',
      name: 'HMI localization update',
      description: 'Italian strings missing on screen 3.',
      senderEmail: 'support@helios.com',
      status: 'CLOSED',
      createdAt: '2024-09-18T11:45:00Z',
    },
  ];

  const seller = users.find((user) => user.type === 'SELLER');
  const techOne = users.find((user) => user.id === 'demo-tech-1');
  const techTwo = users.find((user) => user.id === 'demo-tech-2');

  const works = [
    {
      id: 'work-1',
      name: 'Packaging Line Revamp',
      description: 'Revise PLC logic and refresh electrical documentation for line 4.',
      bidNumber: 'BID-2024-001',
      orderNumber: 'ORD-2024-441',
      orderDate: '2024-10-12',
      expectedStartDate: '2024-11-01',
      electricalSchemaProgression: 45,
      programmingProgression: 20,
      completed: false,
      completedAt: '',
      createdAt: '2024-10-05T09:15:00Z',
      invoiced: false,
      invoicedAt: '',
      nasSubDirectory: '/packaging-line',
      expectedOfficeHours: 120,
      expectedPlantHours: 80,
      seller,
      plant: plants[0],
      atixClient: clients[0],
      finalClient: clients[1],
      ticket: tickets[0],
      assignments: [
        {
          id: 'assign-1',
          assignedAt: '2024-10-12T10:00:00Z',
          user: techOne,
        },
      ],
    },
    {
      id: 'work-2',
      name: 'Robot Cell Upgrade',
      description: 'Upgrade robot cell safety and validate interlocks after firmware update.',
      bidNumber: 'BID-2024-014',
      orderNumber: 'ORD-2024-882',
      orderDate: '2024-09-05',
      expectedStartDate: '2024-09-20',
      electricalSchemaProgression: 90,
      programmingProgression: 75,
      completed: true,
      completedAt: '2024-10-20T16:30:00Z',
      createdAt: '2024-09-02T08:45:00Z',
      invoiced: false,
      invoicedAt: '',
      nasSubDirectory: '/robot-cell',
      expectedOfficeHours: 60,
      expectedPlantHours: 50,
      seller,
      plant: plants[1],
      atixClient: clients[0],
      finalClient: clients[2],
      ticket: tickets[1],
      assignments: [
        {
          id: 'assign-2',
          assignedAt: '2024-09-06T11:00:00Z',
          user: techTwo,
        },
      ],
    },
    {
      id: 'work-3',
      name: 'MES Integration',
      description: 'Integrate MES data points and align reporting for production events.',
      bidNumber: 'BID-2023-122',
      orderNumber: 'ORD-2023-990',
      orderDate: '2024-06-14',
      expectedStartDate: '2024-07-01',
      electricalSchemaProgression: 100,
      programmingProgression: 100,
      completed: true,
      completedAt: '2024-08-30T13:00:00Z',
      createdAt: '2024-06-01T10:20:00Z',
      invoiced: true,
      invoicedAt: '2024-09-05T09:00:00Z',
      nasSubDirectory: '/mes-integration',
      expectedOfficeHours: 140,
      expectedPlantHours: 110,
      seller,
      plant: plants[0],
      atixClient: clients[0],
      finalClient: clients[2],
      ticket: tickets[2],
      assignments: [
        {
          id: 'assign-3',
          assignedAt: '2024-06-15T09:30:00Z',
          user: techOne,
        },
        {
          id: 'assign-4',
          assignedAt: '2024-06-20T09:30:00Z',
          user: techTwo,
        },
      ],
    },
    {
      id: 'work-4',
      name: 'Safety PLC Audit',
      description: 'Audit safety PLC wiring and produce compliance checklist.',
      bidNumber: 'BID-2024-055',
      orderNumber: 'ORD-2024-777',
      orderDate: '2024-11-05',
      expectedStartDate: '2024-11-20',
      electricalSchemaProgression: 25,
      programmingProgression: 10,
      completed: false,
      completedAt: '',
      createdAt: '2024-10-30T12:00:00Z',
      invoiced: false,
      invoicedAt: '',
      nasSubDirectory: '/safety-audit',
      expectedOfficeHours: 40,
      expectedPlantHours: 32,
      seller,
      plant: plants[1],
      atixClient: clients[0],
      finalClient: clients[1],
      ticket: tickets[3],
      assignments: [
        {
          id: 'assign-5',
          assignedAt: '2024-10-31T09:00:00Z',
          user: techOne,
        },
      ],
    },
  ];

  const workReportEntries = {
    'work-1': [
      {
        id: 'entry-1',
        description: 'Electrical schema review and updates.',
        hours: 4,
      },
      {
        id: 'entry-2',
        description: 'PLC IO list alignment.',
        hours: 3.5,
      },
    ],
    'work-2': [
      {
        id: 'entry-3',
        description: 'Robot cell safety checks.',
        hours: 5,
      },
      {
        id: 'entry-4',
        description: 'Program backup and validation.',
        hours: 2,
      },
    ],
  };

  const worksiteReferences = [
    {
      id: 'worksite-ref-1',
      name: 'Mario Rossi - Idraulico',
    },
    {
      id: 'worksite-ref-2',
      name: 'Luca Bianchi - Elettricista',
    },
    {
      id: 'worksite-ref-3',
      name: 'Giulia Verdi - Responsabile Impianto',
    },
  ];

  return {
    users,
    clients,
    plants,
    tickets,
    works,
    workReportEntries,
    worksiteReferences,
  };
};

const demoStore = createDemoStore();

const syncDemoUserFromStorage = () => {
  const storedUser = localStorage.getItem('authUser');
  if (!storedUser) return;

  try {
    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser?.email) return;

    const match = demoStore.users.find(
      (user) => user.email.toLowerCase() === parsedUser.email.toLowerCase()
    );

    if (match) {
      Object.assign(match, {
        ...parsedUser,
        id: match.id ?? parsedUser.id ?? match.id,
        type: parsedUser.type ?? match.type,
        role: parsedUser.role ?? match.role,
      });
      return;
    }

    demoStore.users.unshift({
      id: parsedUser.id ?? createDemoId('demo-user'),
      email: parsedUser.email,
      firstName: parsedUser.firstName || 'Demo',
      lastName: parsedUser.lastName || 'User',
      role: parsedUser.role || 'USER',
      type: parsedUser.type || 'TECHNICIAN',
      profileImageUrl: parsedUser.profileImageUrl || '',
    });
  } catch {
    // Ignore malformed storage.
  }
};

const parseSearchParams = (endpoint: string) => {
  try {
    return new URL(`${API_BASE_URL}${endpoint}`).searchParams;
  } catch {
    return new URLSearchParams();
  }
};

const getPagination = (endpoint: string, total: number) => {
  const params = parseSearchParams(endpoint);
  const page = Number(params.get('page') ?? 0);
  const sizeParam = params.get('size');
  const size = sizeParam ? Number(sizeParam) : total;
  const safePage = Number.isNaN(page) || page < 0 ? 0 : page;
  const safeSize = Number.isNaN(size) || size <= 0 ? total : size;
  return { page: safePage, size: safeSize };
};

const paginateItems = <T,>(items: T[], endpoint: string) => {
  const { page, size } = getPagination(endpoint, items.length);
  const start = page * size;
  const content = size > 0 ? items.slice(start, start + size) : items;
  const totalPages = size > 0 ? Math.ceil(items.length / size) : 0;
  return {
    content,
    totalElements: items.length,
    totalPages,
    size,
    number: page,
  };
};

const normalizeDateOnly = (value?: string) => (value ? value.split('T')[0] : '');

const matchesDateRange = (value: string | undefined, from?: string | null, to?: string | null) => {
  if (!from && !to) return true;
  const date = normalizeDateOnly(value);
  if (!date) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
};

const matchesText = (value: string | undefined, query: string | null) => {
  if (!query) return true;
  if (!value) return false;
  return value.toLowerCase().includes(query.toLowerCase());
};

const buildDemoDashboardSummary = () => {
  const tickets = demoStore.tickets;
  const works = demoStore.works;
  const ticketStatusCounts = tickets.reduce((acc: any[], ticket: any) => {
    const entry = acc.find((item) => item.status === ticket.status);
    if (entry) {
      entry.count += 1;
    } else {
      acc.push({ status: ticket.status, count: 1 });
    }
    return acc;
  }, []);
  const completedWorkCount = works.filter((work: any) => work.completed).length;
  const pendingWorkCount = works.filter((work: any) => !work.completed).length;
  const recentWorks = [...works].sort(
    (a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  );
  const recentTickets = [...tickets].sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return {
    clientCount: demoStore.clients.length,
    plantCount: demoStore.plants.length,
    completedWorkCount,
    pendingWorkCount,
    ticketStatusCounts,
    recentWorks: recentWorks.slice(0, 5),
    recentTickets: recentTickets.slice(0, 5),
  };
};

const buildDemoGetResponse = (endpoint: string) => {
  syncDemoUserFromStorage();
  const path = endpoint.split('?')[0];
  const params = parseSearchParams(endpoint);

  if (path.startsWith('/users/type/')) {
    const type = path.split('/')[3];
    return demoStore.users.filter((user) => user.type === type);
  }
  if (path === '/users') return demoStore.users;
  if (path.startsWith('/users/')) {
    const id = path.split('/')[2];
    return demoStore.users.find((user) => user.id === id) || demoStore.users[0];
  }

  if (path === '/clients') {
    return paginateItems(demoStore.clients, endpoint);
  }
  if (path.startsWith('/clients/')) {
    const id = path.split('/')[2];
    return demoStore.clients.find((client) => client.id === id) || demoStore.clients[0];
  }

  if (path === '/plants') {
    return paginateItems(demoStore.plants, endpoint);
  }
  if (path.startsWith('/plants/')) {
    const id = path.split('/')[2];
    return demoStore.plants.find((plant) => plant.id === id) || demoStore.plants[0];
  }

  if (path === '/works') {
    let works = [...demoStore.works];
    const completedParam = params.get('completed');
    const invoicedParam = params.get('invoiced');
    const atixClientId = params.get('atixClientId');
    const finalClientId = params.get('finalClientId');
    const clientId = params.get('clientId');
    const plantId = params.get('plantId');
    const sellerId = params.get('sellerId');
    const technicianId = params.get('technicianId');
    const ticketId = params.get('ticketId');
    const name = params.get('name');
    const bidNumber = params.get('bidNumber');
    const orderNumber = params.get('orderNumber');
    const orderDateFrom = params.get('orderDateFrom');
    const orderDateTo = params.get('orderDateTo');
    const expectedStartDateFrom = params.get('expectedStartDateFrom');
    const expectedStartDateTo = params.get('expectedStartDateTo');

    if (completedParam !== null) {
      const completedValue = completedParam === 'true';
      works = works.filter((work) => work.completed === completedValue);
    }
    if (invoicedParam !== null) {
      const invoicedValue = invoicedParam === 'true';
      works = works.filter((work) => work.invoiced === invoicedValue);
    }
    if (atixClientId) {
      works = works.filter((work) => work.atixClient?.id === atixClientId);
    }
    if (finalClientId) {
      works = works.filter((work) => work.finalClient?.id === finalClientId);
    }
    if (clientId) {
      works = works.filter(
        (work) => work.atixClient?.id === clientId || work.finalClient?.id === clientId
      );
    }
    if (plantId) {
      works = works.filter((work) => work.plant?.id === plantId);
    }
    if (sellerId) {
      works = works.filter((work) => work.seller?.id === sellerId);
    }
    if (technicianId) {
      works = works.filter((work) =>
        work.assignments?.some((assignment: any) => assignment.user?.id === technicianId)
      );
    }
    if (ticketId) {
      works = works.filter((work) => work.ticket?.id === ticketId);
    }
    if (name) {
      works = works.filter((work) => matchesText(work.name, name));
    }
    if (bidNumber) {
      works = works.filter((work) => matchesText(work.bidNumber, bidNumber));
    }
    if (orderNumber) {
      works = works.filter((work) => matchesText(work.orderNumber, orderNumber));
    }
    if (orderDateFrom || orderDateTo) {
      works = works.filter((work) =>
        matchesDateRange(work.orderDate, orderDateFrom, orderDateTo)
      );
    }
    if (expectedStartDateFrom || expectedStartDateTo) {
      works = works.filter((work) =>
        matchesDateRange(work.expectedStartDate, expectedStartDateFrom, expectedStartDateTo)
      );
    }

    return paginateItems(works, endpoint);
  }
  if (path.startsWith('/works/')) {
    const id = path.split('/')[2];
    return demoStore.works.find((work) => work.id === id) || demoStore.works[0];
  }

  if (path === '/tickets') {
    let tickets = [...demoStore.tickets];
    const status = params.get('status');
    const senderEmail = params.get('senderEmail');
    const name = params.get('name');
    const description = params.get('description');
    const createdAtFrom = params.get('createdAtFrom');
    const createdAtTo = params.get('createdAtTo');

    if (status) {
      tickets = tickets.filter((ticket) => ticket.status === status);
    }
    if (senderEmail) {
      tickets = tickets.filter((ticket) => matchesText(ticket.senderEmail, senderEmail));
    }
    if (name) {
      tickets = tickets.filter((ticket) => matchesText(ticket.name, name));
    }
    if (description) {
      tickets = tickets.filter((ticket) => matchesText(ticket.description, description));
    }
    if (createdAtFrom || createdAtTo) {
      tickets = tickets.filter((ticket) =>
        matchesDateRange(ticket.createdAt, createdAtFrom, createdAtTo)
      );
    }

    return paginateItems(tickets, endpoint);
  }
  if (path.startsWith('/tickets/')) {
    const id = path.split('/')[2];
    return demoStore.tickets.find((ticket) => ticket.id === id) || demoStore.tickets[0];
  }

  if (path.startsWith('/work-reports/work/')) {
    const workId = path.split('/')[3];
    const entries = demoStore.workReportEntries[workId] || [];
    return {
      id: `report-${workId}`,
      totalHours: entries.reduce((sum: number, entry: any) => sum + entry.hours, 0),
      createdAt: '2024-10-01T10:00:00Z',
      work: { id: workId },
      entries,
    };
  }
  if (path.startsWith('/work-reports/entries/work/')) {
    const workId = path.split('/')[4];
    return demoStore.workReportEntries[workId] || [];
  }
  if (path.startsWith('/work-reports/entries/')) {
    const entryId = path.split('/')[3];
    const allEntries = Object.values(demoStore.workReportEntries).flat();
    return allEntries.find((entry: any) => entry.id === entryId) || null;
  }

  if (path === '/graphql') {
    return { data: { dashboardSummary: buildDemoDashboardSummary() } };
  }

  if (path === '/worksite-references') {
    return demoStore.worksiteReferences;
  }
  if (path.startsWith('/worksite-references/')) {
    const id = path.split('/')[2];
    return demoStore.worksiteReferences.find((ref) => ref.id === id) || demoStore.worksiteReferences[0];
  }

  return null;
};

const parseJsonBody = (body: RequestInit['body']) => {
  if (!body) return null;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  return body;
};

const buildDemoMutationResponse = (endpoint: string, method: string, options: RequestInit) => {
  syncDemoUserFromStorage();
  const path = endpoint.split('?')[0];
  const body = parseJsonBody(options.body);

  if (path === '/graphql') {
    return { data: { dashboardSummary: buildDemoDashboardSummary() } };
  }

  if (path === '/clients' && method === 'POST') {
    const client = { id: createDemoId('client'), ...body };
    demoStore.clients.push(client);
    return client;
  }
  if (path.startsWith('/clients/') && method === 'PATCH') {
    const id = path.split('/')[2];
    const client = demoStore.clients.find((item) => item.id === id);
    if (client) Object.assign(client, body);
    return client || null;
  }
  if (path.startsWith('/clients/') && method === 'DELETE') {
    const id = path.split('/')[2];
    demoStore.clients = demoStore.clients.filter((item) => item.id !== id);
    return null;
  }

  if (path === '/plants' && method === 'POST') {
    const plant = { id: createDemoId('plant'), ...body };
    demoStore.plants.push(plant);
    return plant;
  }
  if (path.startsWith('/plants/') && method === 'PATCH') {
    const id = path.split('/')[2];
    const plant = demoStore.plants.find((item) => item.id === id);
    if (plant) Object.assign(plant, body);
    return plant || null;
  }
  if (path.startsWith('/plants/') && method === 'DELETE') {
    const id = path.split('/')[2];
    demoStore.plants = demoStore.plants.filter((item) => item.id !== id);
    return null;
  }

  if (path === '/users' && method === 'POST') {
    const user = { id: createDemoId('user'), ...body };
    demoStore.users.push(user);
    return user;
  }
  if (path.startsWith('/users/') && method === 'DELETE') {
    const id = path.split('/')[2];
    demoStore.users = demoStore.users.filter((item) => item.id !== id);
    return null;
  }
  if (path.endsWith('/password') && method === 'PATCH') {
    return null;
  }
  if (path.startsWith('/users/') && method === 'PATCH') {
    const id = path.split('/')[2];
    const user = demoStore.users.find((item) => item.id === id);
    if (user) Object.assign(user, body);
    return user || null;
  }
  if (path === '/works' && method === 'POST') {
    const workId = createDemoId('work');
    const ticket = demoStore.tickets.find((item) => item.id === body?.ticketId);
    const plant = demoStore.plants.find((item) => item.id === body?.plantId);
    const seller = demoStore.users.find((item) => item.id === body?.sellerId);
    const atixClient = demoStore.clients.find((item) => item.id === body?.atixClientId);
    const finalClient = demoStore.clients.find((item) => item.id === body?.finalClientId);
    const work = {
      id: workId,
      name: body?.name || 'New Work',
      description: body?.description || '',
      bidNumber: body?.bidNumber || '',
      orderNumber: body?.orderNumber || '',
      orderDate: body?.orderDate || '',
      electricalSchemaProgression: body?.electricalSchemaProgression ?? 0,
      programmingProgression: body?.programmingProgression ?? 0,
      completed: false,
      completedAt: '',
      createdAt: new Date().toISOString(),
      invoiced: false,
      invoicedAt: '',
      nasSubDirectory: body?.nasSubDirectory || '',
      expectedOfficeHours: body?.expectedOfficeHours ?? 0,
      expectedPlantHours: body?.expectedPlantHours ?? 0,
      expectedStartDate: body?.expectedStartDate || '',
      seller,
      plant,
      atixClient,
      finalClient,
      ticket,
      assignments: [],
    };
    demoStore.works.unshift(work);
    return work;
  }
  if (path.startsWith('/works/') && method === 'PATCH' && path.endsWith('/close')) {
    const id = path.split('/')[2];
    const work = demoStore.works.find((item) => item.id === id);
    if (work) {
      work.completed = true;
      work.completedAt = new Date().toISOString();
    }
    return work || null;
  }
  if (path.startsWith('/works/') && method === 'PATCH' && path.endsWith('/invoice')) {
    const id = path.split('/')[2];
    const work = demoStore.works.find((item) => item.id === id);
    if (work) {
      work.invoiced = true;
      work.invoicedAt = new Date().toISOString();
    }
    return work || null;
  }
  if (path.startsWith('/works/') && method === 'POST' && path.endsWith('/assign-technician')) {
    const id = path.split('/')[2];
    const work = demoStore.works.find((item) => item.id === id);
    const technician = demoStore.users.find((item) => item.id === body?.technicianId);
    if (work && technician) {
      work.assignments = work.assignments || [];
      const alreadyAssigned = work.assignments.some(
        (assignment: any) => assignment.user?.id === technician.id
      );
      if (!alreadyAssigned) {
        work.assignments.push({
          id: createDemoId('assign'),
          assignedAt: new Date().toISOString(),
          user: technician,
        });
      }
    }
    return work || null;
  }
  if (path.startsWith('/works/') && method === 'POST' && path.endsWith('/add-reference')) {
    const id = path.split('/')[2];
    return demoStore.works.find((item) => item.id === id) || null;
  }
  if (path.startsWith('/works/') && method === 'PATCH') {
    const id = path.split('/')[2];
    const work = demoStore.works.find((item) => item.id === id);
    if (work) Object.assign(work, body);
    return work || null;
  }
  if (path.startsWith('/works/') && method === 'DELETE') {
    const id = path.split('/')[2];
    demoStore.works = demoStore.works.filter((item) => item.id !== id);
    return null;
  }

  if (path === '/tickets' && method === 'POST') {
    const ticket = {
      id: createDemoId('ticket'),
      name: body?.name || 'New Ticket',
      description: body?.description || '',
      senderEmail: body?.senderEmail || '',
      status: body?.status || 'OPEN',
      createdAt: new Date().toISOString(),
    };
    demoStore.tickets.unshift(ticket);
    return ticket;
  }
  if (path.startsWith('/tickets/') && method === 'PATCH') {
    const id = path.split('/')[2];
    const ticket = demoStore.tickets.find((item) => item.id === id);
    if (ticket) Object.assign(ticket, body);
    return ticket || null;
  }
  if (path.startsWith('/tickets/') && method === 'DELETE') {
    const id = path.split('/')[2];
    demoStore.tickets = demoStore.tickets.filter((item) => item.id !== id);
    return null;
  }

  if (path === '/work-reports/entries' && method === 'POST') {
    const entry = {
      id: createDemoId('entry'),
      description: body?.description || '',
      hours: Number(body?.hours ?? 0),
      report: { work: { id: body?.workId } },
    };
    const workId = body?.workId;
    if (workId) {
      demoStore.workReportEntries[workId] = demoStore.workReportEntries[workId] || [];
      demoStore.workReportEntries[workId].push(entry);
    }
    return entry;
  }
  if (path.startsWith('/work-reports/entries/') && method === 'PATCH') {
    const id = path.split('/')[3];
    const entries = Object.values(demoStore.workReportEntries).flat();
    const entry = entries.find((item: any) => item.id === id);
    if (entry) Object.assign(entry, body);
    return entry || null;
  }
  if (path.startsWith('/work-reports/entries/') && method === 'DELETE') {
    const id = path.split('/')[3];
    Object.keys(demoStore.workReportEntries).forEach((workId) => {
      demoStore.workReportEntries[workId] = demoStore.workReportEntries[workId].filter(
        (entry: any) => entry.id !== id
      );
    });
    return null;
  }

  if (path === '/worksite-references' && method === 'POST') {
    const reference = { id: createDemoId('worksite-ref'), ...body };
    demoStore.worksiteReferences.push(reference);
    return reference;
  }
  if (path.startsWith('/worksite-references/') && method === 'PATCH') {
    const id = path.split('/')[2];
    const reference = demoStore.worksiteReferences.find((item) => item.id === id);
    if (reference) Object.assign(reference, body);
    return reference || null;
  }
  if (path.startsWith('/worksite-references/') && method === 'DELETE') {
    const id = path.split('/')[2];
    demoStore.worksiteReferences = demoStore.worksiteReferences.filter((item) => item.id !== id);
    return null;
  }

  return null;
};

// API request helper
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const demoMode = isDemoToken(token);

  if (demoMode) {
    const method = (options.method || 'GET').toUpperCase();
    if (method === 'GET') {
      return buildDemoGetResponse(endpoint) as T;
    }
    return buildDemoMutationResponse(endpoint, method, options) as T;
  }
  
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

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  if (!text) {
    return null as T;
  }

  if (contentType.includes('application/json')) {
    return JSON.parse(text) as T;
  }

  return text as unknown as T;
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
    if (isDemoToken(token)) {
      const previewUrl = URL.createObjectURL(file);
      const user = demoStore.users.find((item) => item.id === id);
      if (user) {
        user.profileImageUrl = previewUrl;
      }
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.id === id) {
            parsedUser.profileImageUrl = previewUrl;
            localStorage.setItem('authUser', JSON.stringify(parsedUser));
          }
        } catch {
          // Ignore malformed storage.
        }
      }
      return { profileImageUrl: previewUrl };
    }

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

// Worksite References API
export const worksiteReferencesApi = {
  getAll: () => apiRequest<any[]>('/worksite-references'),
  getById: (id: string) => apiRequest<any>(`/worksite-references/${id}`),
  create: (data: { name: string }) =>
    apiRequest<any>('/worksite-references', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { name: string }) =>
    apiRequest<any>(`/worksite-references/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/worksite-references/${id}`, { method: 'DELETE' }),
};
