import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Search, 
  Filter, 
  Briefcase,
  Calendar,
  Building2,
  Factory,
  User,
  X,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Work, Client, Plant, SellerUser, TechnicianUser, Ticket } from '@/types';

// Mock data
const mockWorks: Work[] = [
  {
    id: '1',
    name: 'Automation System Upgrade',
    bidNumber: 'BID-2024-001',
    orderNumber: 'ORD-2024-001',
    orderDate: '2024-01-15',
    expectedStartDate: '2024-02-01',
    electricalSchemaProgression: 75,
    programmingProgression: 50,
    completed: false,
    invoiced: false,
    createdAt: '2024-01-15T10:00:00',
    nasSubDirectory: '/projects/asu-2024',
    expectedOfficeHours: 40,
    expectedPlantHours: 80,
    seller: { id: 's1', firstName: 'Marco', lastName: 'Rossi', email: 'marco@company.com', role: 'USER', userType: 'SELLER' },
    plant: { id: 'p1', name: 'Plant Alpha', notes: '', nasDirectory: '/nas/alpha', pswPhrase: '', pswPlatform: '', pswStation: '' },
    atixClient: { id: 'c1', name: 'Atix Industries', type: 'ATIX' },
    finalClient: { id: 'c2', name: 'Final Corp', type: 'FINAL' },
    assignments: [
      { id: 'a1', assignedAt: '2024-01-16T09:00:00', user: { id: 't1', firstName: 'Giuseppe', lastName: 'Verdi', email: 'giuseppe@company.com', role: 'USER', userType: 'TECHNICIAN' } },
      { id: 'a2', assignedAt: '2024-01-17T10:00:00', user: { id: 't2', firstName: 'Anna', lastName: 'Ferrari', email: 'anna@company.com', role: 'USER', userType: 'TECHNICIAN' } }
    ]
  },
  {
    id: '2',
    name: 'PLC Programming - Line 3',
    bidNumber: 'BID-2024-002',
    orderNumber: 'ORD-2024-002',
    orderDate: '2024-01-12',
    expectedStartDate: '2024-01-18',
    electricalSchemaProgression: 100,
    programmingProgression: 100,
    completed: true,
    completedAt: '2024-01-20T15:00:00',
    invoiced: false,
    createdAt: '2024-01-12T09:00:00',
    nasSubDirectory: '/projects/plc-line3',
    expectedOfficeHours: 20,
    expectedPlantHours: 40,
    seller: { id: 's1', firstName: 'Marco', lastName: 'Rossi', email: 'marco@company.com', role: 'USER', userType: 'SELLER' },
    plant: { id: 'p2', name: 'Plant Beta', notes: '', nasDirectory: '/nas/beta', pswPhrase: '', pswPlatform: '', pswStation: '' },
    atixClient: { id: 'c3', name: 'Tech Solutions', type: 'ATIX' },
    assignments: [
      { id: 'a3', assignedAt: '2024-01-13T09:00:00', user: { id: 't3', firstName: 'Luca', lastName: 'Romano', email: 'luca@company.com', role: 'USER', userType: 'TECHNICIAN' } }
    ]
  },
  {
    id: '3',
    name: 'Electrical Panel Installation',
    bidNumber: 'BID-2024-003',
    orderNumber: 'ORD-2024-003',
    orderDate: '2024-01-10',
    expectedStartDate: '2024-01-15',
    electricalSchemaProgression: 100,
    programmingProgression: 100,
    completed: true,
    completedAt: '2024-01-18T12:00:00',
    invoiced: true,
    invoicedAt: '2024-01-25T10:00:00',
    createdAt: '2024-01-10T14:00:00',
    nasSubDirectory: '/projects/ep-install',
    expectedOfficeHours: 16,
    expectedPlantHours: 32,
    seller: { id: 's2', firstName: 'Laura', lastName: 'Bianchi', email: 'laura@company.com', role: 'USER', userType: 'SELLER' },
    plant: { id: 'p1', name: 'Plant Alpha', notes: '', nasDirectory: '/nas/alpha', pswPhrase: '', pswPlatform: '', pswStation: '' },
    atixClient: { id: 'c1', name: 'Atix Industries', type: 'ATIX' },
    assignments: [
      { id: 'a4', assignedAt: '2024-01-11T08:00:00', user: { id: 't1', firstName: 'Giuseppe', lastName: 'Verdi', email: 'giuseppe@company.com', role: 'USER', userType: 'TECHNICIAN' } }
    ]
  },
  {
    id: '4',
    name: 'SCADA System Integration',
    bidNumber: 'BID-2024-004',
    orderNumber: 'ORD-2024-004',
    orderDate: '2024-01-08',
    expectedStartDate: '2024-02-10',
    electricalSchemaProgression: 30,
    programmingProgression: 15,
    completed: false,
    invoiced: false,
    createdAt: '2024-01-08T11:00:00',
    nasSubDirectory: '/projects/scada-int',
    expectedOfficeHours: 60,
    expectedPlantHours: 120,
    seller: { id: 's2', firstName: 'Laura', lastName: 'Bianchi', email: 'laura@company.com', role: 'USER', userType: 'SELLER' },
    plant: { id: 'p3', name: 'Plant Gamma', notes: '', nasDirectory: '/nas/gamma', pswPhrase: '', pswPlatform: '', pswStation: '' },
    atixClient: { id: 'c4', name: 'Industrial Co', type: 'ATIX' },
    assignments: [
      { id: 'a5', assignedAt: '2024-01-09T09:00:00', user: { id: 't2', firstName: 'Anna', lastName: 'Ferrari', email: 'anna@company.com', role: 'USER', userType: 'TECHNICIAN' } },
      { id: 'a6', assignedAt: '2024-01-10T10:00:00', user: { id: 't3', firstName: 'Luca', lastName: 'Romano', email: 'luca@company.com', role: 'USER', userType: 'TECHNICIAN' } }
    ]
  },
  {
    id: '5',
    name: 'Safety System Audit',
    bidNumber: 'BID-2024-005',
    orderNumber: 'ORD-2024-005',
    orderDate: '2024-01-05',
    expectedStartDate: '2024-01-08',
    electricalSchemaProgression: 100,
    programmingProgression: 100,
    completed: true,
    completedAt: '2024-01-15T16:00:00',
    invoiced: true,
    invoicedAt: '2024-01-20T09:00:00',
    createdAt: '2024-01-05T08:00:00',
    nasSubDirectory: '/projects/safety-audit',
    expectedOfficeHours: 24,
    expectedPlantHours: 16,
    seller: { id: 's1', firstName: 'Marco', lastName: 'Rossi', email: 'marco@company.com', role: 'USER', userType: 'SELLER' },
    plant: { id: 'p2', name: 'Plant Beta', notes: '', nasDirectory: '/nas/beta', pswPhrase: '', pswPlatform: '', pswStation: '' },
    atixClient: { id: 'c2', name: 'Final Corp', type: 'FINAL' },
    assignments: [
      { id: 'a7', assignedAt: '2024-01-06T08:00:00', user: { id: 't1', firstName: 'Giuseppe', lastName: 'Verdi', email: 'giuseppe@company.com', role: 'USER', userType: 'TECHNICIAN' } }
    ]
  },
];

const mockClients: Client[] = [
  { id: 'c1', name: 'Atix Industries', type: 'ATIX' },
  { id: 'c2', name: 'Final Corp', type: 'FINAL' },
  { id: 'c3', name: 'Tech Solutions', type: 'ATIX' },
  { id: 'c4', name: 'Industrial Co', type: 'ATIX' },
];

const mockPlants: Plant[] = [
  { id: 'p1', name: 'Plant Alpha', notes: '', nasDirectory: '/nas/alpha', pswPhrase: '', pswPlatform: '', pswStation: '' },
  { id: 'p2', name: 'Plant Beta', notes: '', nasDirectory: '/nas/beta', pswPhrase: '', pswPlatform: '', pswStation: '' },
  { id: 'p3', name: 'Plant Gamma', notes: '', nasDirectory: '/nas/gamma', pswPhrase: '', pswPlatform: '', pswStation: '' },
];

const mockSellers: SellerUser[] = [
  { id: 's1', firstName: 'Marco', lastName: 'Rossi', email: 'marco@company.com', role: 'USER', userType: 'SELLER' },
  { id: 's2', firstName: 'Laura', lastName: 'Bianchi', email: 'laura@company.com', role: 'USER', userType: 'SELLER' },
];

const mockTechnicians: TechnicianUser[] = [
  { id: 't1', firstName: 'Giuseppe', lastName: 'Verdi', email: 'giuseppe@company.com', role: 'USER', userType: 'TECHNICIAN' },
  { id: 't2', firstName: 'Anna', lastName: 'Ferrari', email: 'anna@company.com', role: 'USER', userType: 'TECHNICIAN' },
  { id: 't3', firstName: 'Luca', lastName: 'Romano', email: 'luca@company.com', role: 'USER', userType: 'TECHNICIAN' },
];

const mockTickets: Ticket[] = [
  { id: 'tk1', name: 'Machine malfunction', senderEmail: 'op@plant.com', description: 'Issue', status: 'OPEN', createdAt: '2024-01-16' },
  { id: 'tk2', name: 'Software update', senderEmail: 'it@factory.com', description: 'Update', status: 'IN_PROGRESS', createdAt: '2024-01-15' },
];

interface WorkFilters {
  atixClientId: string;
  finalClientId: string;
  sellerId: string;
  plantId: string;
  ticketId: string;
  technicianId: string;
  invoiced: string;
  orderDateFrom: string;
  orderDateTo: string;
  expectedStartDateFrom: string;
  expectedStartDateTo: string;
  name: string;
  bidNumber: string;
  orderNumber: string;
}

export default function WorksPage() {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<WorkFilters>({
    atixClientId: '',
    finalClientId: '',
    sellerId: '',
    plantId: '',
    ticketId: '',
    technicianId: '',
    invoiced: '',
    orderDateFrom: '',
    orderDateTo: '',
    expectedStartDateFrom: '',
    expectedStartDateTo: '',
    name: '',
    bidNumber: '',
    orderNumber: '',
  });

  // Filter works based on tab and filters
  const filteredWorks = mockWorks.filter((work) => {
    // Tab filter
    if (activeTab === 'open' && work.completed) return false;
    if (activeTab === 'closed' && !work.completed) return false;

    // Filter by atix client
    if (filters.atixClientId && work.atixClient?.id !== filters.atixClientId) {
      return false;
    }

    // Filter by final client
    if (filters.finalClientId && work.finalClient?.id !== filters.finalClientId) {
      return false;
    }

    // Filter by plant
    if (filters.plantId && work.plant?.id !== filters.plantId) return false;

    // Filter by seller
    if (filters.sellerId && work.seller?.id !== filters.sellerId) return false;

    // Filter by technician
    if (filters.technicianId && !work.assignments?.some(a => a.user?.id === filters.technicianId)) {
      return false;
    }

    // Filter by ticket
    if (filters.ticketId && work.ticket?.id !== filters.ticketId) return false;

    // Filter by invoiced
    if (filters.invoiced === 'true' && !work.invoiced) return false;
    if (filters.invoiced === 'false' && work.invoiced) return false;

    // Filter by order date range
    if (filters.orderDateFrom && work.orderDate < filters.orderDateFrom) return false;
    if (filters.orderDateTo && work.orderDate > filters.orderDateTo) return false;

    // Filter by expected start date range
    if (filters.expectedStartDateFrom && work.expectedStartDate && work.expectedStartDate < filters.expectedStartDateFrom) return false;
    if (filters.expectedStartDateTo && work.expectedStartDate && work.expectedStartDate > filters.expectedStartDateTo) return false;

    // Filter by name
    if (filters.name && !work.name.toLowerCase().includes(filters.name.toLowerCase())) return false;

    // Filter by bid number
    if (filters.bidNumber && !work.bidNumber.toLowerCase().includes(filters.bidNumber.toLowerCase())) return false;

    // Filter by order number
    if (filters.orderNumber && !work.orderNumber.toLowerCase().includes(filters.orderNumber.toLowerCase())) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        work.name.toLowerCase().includes(query) ||
        work.bidNumber.toLowerCase().includes(query) ||
        work.orderNumber.toLowerCase().includes(query) ||
        work.atixClient?.name.toLowerCase().includes(query) ||
        work.finalClient?.name.toLowerCase().includes(query) ||
        work.plant?.name.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const clearFilters = () => {
    setFilters({
      atixClientId: '',
      finalClientId: '',
      sellerId: '',
      plantId: '',
      ticketId: '',
      technicianId: '',
      invoiced: '',
      orderDateFrom: '',
      orderDateTo: '',
      expectedStartDateFrom: '',
      expectedStartDateTo: '',
      name: '',
      bidNumber: '',
      orderNumber: '',
    });
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '') || searchQuery !== '';

  const openWorks = mockWorks.filter(w => !w.completed);
  const closedWorks = mockWorks.filter(w => w.completed);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Works</h1>
          <p className="text-muted-foreground mt-1">
            Manage work orders and projects
          </p>
        </div>
        <Button onClick={() => navigate('/works/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Work
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="open">
              Open ({openWorks.length})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Closed ({closedWorks.length})
            </TabsTrigger>
          </TabsList>

          {/* Search & Filters */}
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search works..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-muted' : ''}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mt-4">
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {/* Atix Client */}
                <div>
                  <Label className="mb-2 block text-sm">Atix Client</Label>
                  <Select value={filters.atixClientId || "__all__"} onValueChange={(v) => setFilters({...filters, atixClientId: v === "__all__" ? "" : v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All</SelectItem>
                      {mockClients.filter(c => c.type === 'ATIX').map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Final Client */}
                <div>
                  <Label className="mb-2 block text-sm">Final Client</Label>
                  <Select value={filters.finalClientId || "__all__"} onValueChange={(v) => setFilters({...filters, finalClientId: v === "__all__" ? "" : v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All</SelectItem>
                      {mockClients.filter(c => c.type === 'FINAL').map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Plant */}
                <div>
                  <Label className="mb-2 block text-sm">Plant</Label>
                  <Select value={filters.plantId || "__all__"} onValueChange={(v) => setFilters({...filters, plantId: v === "__all__" ? "" : v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All</SelectItem>
                      {mockPlants.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Seller */}
                <div>
                  <Label className="mb-2 block text-sm">Seller</Label>
                  <Select value={filters.sellerId || "__all__"} onValueChange={(v) => setFilters({...filters, sellerId: v === "__all__" ? "" : v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All</SelectItem>
                      {mockSellers.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Technician */}
                <div>
                  <Label className="mb-2 block text-sm">Technician</Label>
                  <Select value={filters.technicianId || "__all__"} onValueChange={(v) => setFilters({...filters, technicianId: v === "__all__" ? "" : v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All</SelectItem>
                      {mockTechnicians.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ticket */}
                <div>
                  <Label className="mb-2 block text-sm">Ticket</Label>
                  <Select value={filters.ticketId || "__all__"} onValueChange={(v) => setFilters({...filters, ticketId: v === "__all__" ? "" : v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All</SelectItem>
                      {mockTickets.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Invoiced */}
                <div>
                  <Label className="mb-2 block text-sm">Invoiced</Label>
                  <Select value={filters.invoiced || "__all__"} onValueChange={(v) => setFilters({...filters, invoiced: v === "__all__" ? "" : v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All</SelectItem>
                      <SelectItem value="true">Invoiced</SelectItem>
                      <SelectItem value="false">Not Invoiced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Order Date From */}
                <div>
                  <Label className="mb-2 block text-sm">Order Date From</Label>
                  <Input
                    type="date"
                    value={filters.orderDateFrom}
                    onChange={(e) => setFilters({...filters, orderDateFrom: e.target.value})}
                  />
                </div>

                {/* Order Date To */}
                <div>
                  <Label className="mb-2 block text-sm">Order Date To</Label>
                  <Input
                    type="date"
                    value={filters.orderDateTo}
                    onChange={(e) => setFilters({...filters, orderDateTo: e.target.value})}
                  />
                </div>

                {/* Expected Start From */}
                <div>
                  <Label className="mb-2 block text-sm">Expected Start From</Label>
                  <Input
                    type="date"
                    value={filters.expectedStartDateFrom}
                    onChange={(e) => setFilters({...filters, expectedStartDateFrom: e.target.value})}
                  />
                </div>

                {/* Expected Start To */}
                <div>
                  <Label className="mb-2 block text-sm">Expected Start To</Label>
                  <Input
                    type="date"
                    value={filters.expectedStartDateTo}
                    onChange={(e) => setFilters({...filters, expectedStartDateTo: e.target.value})}
                  />
                </div>

                {/* Name */}
                <div>
                  <Label className="mb-2 block text-sm">Name</Label>
                  <Input
                    placeholder="Search name..."
                    value={filters.name}
                    onChange={(e) => setFilters({...filters, name: e.target.value})}
                  />
                </div>

                {/* Bid Number */}
                <div>
                  <Label className="mb-2 block text-sm">Bid Number</Label>
                  <Input
                    placeholder="Search bid..."
                    value={filters.bidNumber}
                    onChange={(e) => setFilters({...filters, bidNumber: e.target.value})}
                  />
                </div>

                {/* Order Number */}
                <div>
                  <Label className="mb-2 block text-sm">Order Number</Label>
                  <Input
                    placeholder="Search order..."
                    value={filters.orderNumber}
                    onChange={(e) => setFilters({...filters, orderNumber: e.target.value})}
                  />
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters} disabled={!hasActiveFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Works List */}
        <TabsContent value="open" className="mt-4">
          <WorksList works={filteredWorks} navigate={navigate} />
        </TabsContent>
        <TabsContent value="closed" className="mt-4">
          <WorksList works={filteredWorks} navigate={navigate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WorksList({
  works,
  navigate
}: {
  works: Work[];
  navigate: (path: string) => void;
}) {
  // Generate work index (e.g., "nasplant1work1")
  const getWorkIndex = (work: Work): string => {
    const plantDir = work.plant?.nasDirectory || '';
    const workDir = work.nasSubDirectory || '';
    return (plantDir + workDir).toLowerCase().replace(/\//g, '');
  };

  if (works.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No works found</h3>
          <p className="text-muted-foreground mt-1">
            No works match your current filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {works.map((work) => (
        <Card
          key={work.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/works/${work.id}`)}
        >
          <CardContent className="py-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="outline" className="font-mono text-xs">
                    {getWorkIndex(work)}
                  </Badge>
                  <h3 className="font-medium">{work.name}</h3>
                  {work.completed ? (
                    <Badge variant="outline" className="border-chart-3 text-chart-3">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-primary text-primary">
                      <Clock className="h-3 w-3 mr-1" />
                      In Progress
                    </Badge>
                  )}
                  {work.invoiced && (
                    <Badge variant="secondary">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Invoiced
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {work.expectedStartDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(work.expectedStartDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {work.atixClient && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      <span>{work.atixClient.name}</span>
                    </div>
                  )}
                  {work.plant && (
                    <div className="flex items-center gap-1">
                      <Factory className="h-3 w-3" />
                      <span>{work.plant.name}</span>
                    </div>
                  )}
                  {work.assignments && work.assignments.length > 0 && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{work.assignments.map(a => `${a.user?.firstName} ${a.user?.lastName}`).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress indicators */}
              <div className="flex gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <BarChart3 className="h-3 w-3" />
                    Electrical
                  </div>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${work.electricalSchemaProgression}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{work.electricalSchemaProgression}%</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <BarChart3 className="h-3 w-3" />
                    Programming
                  </div>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-chart-2 rounded-full transition-all"
                      style={{ width: `${work.programmingProgression}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{work.programmingProgression}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
