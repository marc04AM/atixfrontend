import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Filter, 
  Ticket as TicketIcon,
  Calendar,
  Mail,
  X
} from 'lucide-react';
import { TicketStatus, Ticket } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockTickets: Ticket[] = [
  { id: '1', name: 'Machine malfunction on Line 2', senderEmail: 'operator@plant.com', description: 'The main conveyor belt is not working properly and needs immediate attention.', status: 'OPEN', createdAt: '2024-01-16T10:30:00' },
  { id: '2', name: 'Software update required', senderEmail: 'it@factory.com', description: 'SCADA system needs to be updated to the latest version.', status: 'IN_PROGRESS', createdAt: '2024-01-15T14:00:00' },
  { id: '3', name: 'Annual maintenance request', senderEmail: 'maintenance@client.com', description: 'Request for annual preventive maintenance scheduling.', status: 'OPEN', createdAt: '2024-01-14T09:15:00' },
  { id: '4', name: 'Emergency repair needed', senderEmail: 'urgent@plant.com', description: 'Critical pump failure in section A.', status: 'RESOLVED', createdAt: '2024-01-13T16:45:00' },
  { id: '5', name: 'New installation quote', senderEmail: 'sales@company.com', description: 'Customer requesting quote for new automation system.', status: 'CLOSED', createdAt: '2024-01-12T11:20:00' },
  { id: '6', name: 'PLC programming issue', senderEmail: 'tech@plant.com', description: 'PLC on Line 4 showing communication errors.', status: 'IN_PROGRESS', createdAt: '2024-01-11T08:00:00' },
  { id: '7', name: 'Safety audit request', senderEmail: 'safety@client.com', description: 'Annual safety compliance audit needed.', status: 'CLOSED', createdAt: '2024-01-10T13:30:00' },
];

const getTicketStatusColor = (status: TicketStatus) => {
  switch (status) {
    case 'OPEN':
      return 'bg-destructive text-destructive-foreground';
    case 'IN_PROGRESS':
      return 'bg-primary text-primary-foreground';
    case 'RESOLVED':
      return 'bg-accent text-accent-foreground';
    case 'CLOSED':
      return 'bg-secondary text-secondary-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

interface TicketFilters {
  senderEmail: string;
  name: string;
  description: string;
  status: string;
  createdAtFrom: string;
  createdAtTo: string;
}

export default function TicketsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const initialTab = searchParams.get('status') === 'CLOSED' ? 'closed' : 'open';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filters, setFilters] = useState<TicketFilters>({
    senderEmail: '',
    name: '',
    description: '',
    status: 'all',
    createdAtFrom: '',
    createdAtTo: '',
  });
  const [newTicket, setNewTicket] = useState({
    name: '',
    senderEmail: '',
    description: '',
  });

  // Filter tickets based on tab and filters
  const filteredTickets = mockTickets.filter((ticket) => {
    // Tab filter
    if (activeTab === 'open' && (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED')) {
      return false;
    }
    if (activeTab === 'closed' && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED') {
      return false;
    }

    // Status filter
    if (filters.status !== 'all' && ticket.status !== filters.status) {
      return false;
    }

    // Sender email filter
    if (filters.senderEmail && !ticket.senderEmail?.toLowerCase().includes(filters.senderEmail.toLowerCase())) {
      return false;
    }

    // Name filter
    if (filters.name && !ticket.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }

    // Description filter
    if (filters.description && !ticket.description.toLowerCase().includes(filters.description.toLowerCase())) {
      return false;
    }

    // Created at date range filter
    const ticketDate = ticket.createdAt.split('T')[0];
    if (filters.createdAtFrom && ticketDate < filters.createdAtFrom) return false;
    if (filters.createdAtTo && ticketDate > filters.createdAtTo) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ticket.name.toLowerCase().includes(query) ||
        ticket.senderEmail?.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const clearFilters = () => {
    setFilters({
      senderEmail: '',
      name: '',
      description: '',
      status: 'all',
      createdAtFrom: '',
      createdAtTo: '',
    });
    setSearchQuery('');
  };

  const hasActiveFilters = filters.senderEmail !== '' || filters.name !== '' || filters.description !== '' || 
    filters.status !== 'all' || filters.createdAtFrom !== '' || filters.createdAtTo !== '' || searchQuery !== '';

  const handleCreateTicket = () => {
    // In real app, call API
    toast({
      title: 'Ticket Created',
      description: `Ticket "${newTicket.name}" has been created successfully.`,
    });
    setIsCreateOpen(false);
    setNewTicket({ name: '', senderEmail: '', description: '' });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFilters(prev => ({ ...prev, status: 'all' }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Manage support tickets and requests
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
              <DialogDescription>
                Create a new support ticket. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="ticket-name">Ticket Name</Label>
                <Input
                  id="ticket-name"
                  placeholder="Enter ticket name"
                  value={newTicket.name}
                  onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sender-email">Sender Email</Label>
                <Input
                  id="sender-email"
                  type="email"
                  placeholder="sender@example.com"
                  value={newTicket.senderEmail}
                  onChange={(e) => setNewTicket({ ...newTicket, senderEmail: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue or request..."
                  rows={4}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTicket} disabled={!newTicket.name || !newTicket.description}>
                Create Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="open">
              Open ({mockTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Closed ({mockTickets.filter(t => t.status === 'CLOSED' || t.status === 'RESOLVED').length})
            </TabsTrigger>
          </TabsList>

          {/* Search & Filters */}
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
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
                {/* Status */}
                <div>
                  <Label className="mb-2 block text-sm">Status</Label>
                  <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sender Email */}
                <div>
                  <Label className="mb-2 block text-sm">Sender Email</Label>
                  <Input
                    placeholder="Search email..."
                    value={filters.senderEmail}
                    onChange={(e) => setFilters({...filters, senderEmail: e.target.value})}
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

                {/* Description */}
                <div>
                  <Label className="mb-2 block text-sm">Description</Label>
                  <Input
                    placeholder="Search description..."
                    value={filters.description}
                    onChange={(e) => setFilters({...filters, description: e.target.value})}
                  />
                </div>

                {/* Created At From */}
                <div>
                  <Label className="mb-2 block text-sm">Created From</Label>
                  <Input
                    type="date"
                    value={filters.createdAtFrom}
                    onChange={(e) => setFilters({...filters, createdAtFrom: e.target.value})}
                  />
                </div>

                {/* Created At To */}
                <div>
                  <Label className="mb-2 block text-sm">Created To</Label>
                  <Input
                    type="date"
                    value={filters.createdAtTo}
                    onChange={(e) => setFilters({...filters, createdAtTo: e.target.value})}
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

        {/* Tickets List */}
        <TabsContent value="open" className="mt-4">
          <TicketsList tickets={filteredTickets} navigate={navigate} />
        </TabsContent>
        <TabsContent value="closed" className="mt-4">
          <TicketsList tickets={filteredTickets} navigate={navigate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TicketsList({ 
  tickets, 
  navigate 
}: { 
  tickets: Ticket[]; 
  navigate: (path: string) => void;
}) {
  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <TicketIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No tickets found</h3>
          <p className="text-muted-foreground mt-1">
            No tickets match your current filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <Card
          key={ticket.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/tickets/${ticket.id}`)}
        >
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">{ticket.name}</h3>
                  <Badge className={getTicketStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {ticket.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {ticket.senderEmail && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{ticket.senderEmail}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
