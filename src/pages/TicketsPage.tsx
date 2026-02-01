import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
import { useTickets, useCreateTicket } from '@/hooks/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatDate } from '@/lib/date';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '@/components/ui/status-badge';
import { ticketSchema, ValidationErrors, TicketFormData } from '@/lib/validations';

const PAGE_SIZE = 10;

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
  const { t } = useTranslation('tickets');

  const initialTab = searchParams.get('status') === 'CLOSED' ? 'closed' : 'open';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentPage, setCurrentPage] = useState(0);
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
  const [formErrors, setFormErrors] = useState<ValidationErrors<TicketFormData>>({});

  // Build API params
  const baseParams = useMemo(() => {
    const p: Record<string, any> = {
      ...filters,
    };
    if (p.status === 'all') {
      delete p.status;
    }
    // Remove empty values
    Object.keys(p).forEach((key) => {
      if (p[key] === '' || p[key] === undefined || p[key] === null) {
        delete p[key];
      }
    });
    return p;
  }, [filters]);

  const listParams = useMemo(() => ({
    ...baseParams,
    page: currentPage,
    size: PAGE_SIZE,
  }), [baseParams, currentPage, activeTab]);

  const countBaseParams = useMemo(() => {
    const { status, ...rest } = baseParams;
    return {
      ...rest,
      page: 0,
      size: 1,
    };
  }, [baseParams]);

  const openCountParams = useMemo(() => ({
    ...countBaseParams,
    status: 'OPEN',
  }), [countBaseParams]);
  const inProgressCountParams = useMemo(() => ({
    ...countBaseParams,
    status: 'IN_PROGRESS',
  }), [countBaseParams]);
  const resolvedCountParams = useMemo(() => ({
    ...countBaseParams,
    status: 'RESOLVED',
  }), [countBaseParams]);
  const closedCountParams = useMemo(() => ({
    ...countBaseParams,
    status: 'CLOSED',
  }), [countBaseParams]);

  // Fetch tickets
  const { data: ticketsData, isLoading, error } = useTickets(listParams);
  const { data: openTicketsData } = useTickets(openCountParams);
  const { data: inProgressTicketsData } = useTickets(inProgressCountParams);
  const { data: resolvedTicketsData } = useTickets(resolvedCountParams);
  const { data: closedTicketsData } = useTickets(closedCountParams);
  const createTicket = useCreateTicket();

  const tickets = ticketsData?.content || [];
  const filteredTickets = tickets.filter((ticket: Ticket) => {
    // Tab filter
    if (activeTab === 'open' && (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED')) {
      return false;
    }
    if (activeTab === 'closed' && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED') {
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
    if (ticket.createdAt) {
      const ticketDate = ticket.createdAt.split('T')[0];
      if (filters.createdAtFrom && ticketDate < filters.createdAtFrom) return false;
      if (filters.createdAtTo && ticketDate > filters.createdAtTo) return false;
    }

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
    setCurrentPage(0);
  };

  const hasActiveFilters = filters.senderEmail !== '' || filters.name !== '' || filters.description !== '' ||
    filters.status !== 'all' || filters.createdAtFrom !== '' || filters.createdAtTo !== '' || searchQuery !== '';

  const totalPages = ticketsData?.totalPages || 0;
  const totalElements = ticketsData?.totalElements || 0;
  const statusFilter = baseParams.status as TicketStatus | undefined;
  const openTicketsCount = statusFilter
    ? statusFilter === 'OPEN'
      ? openTicketsData?.totalElements || 0
      : statusFilter === 'IN_PROGRESS'
        ? inProgressTicketsData?.totalElements || 0
        : 0
    : (openTicketsData?.totalElements || 0) + (inProgressTicketsData?.totalElements || 0);
  const closedTicketsCount = statusFilter
    ? statusFilter === 'CLOSED'
      ? closedTicketsData?.totalElements || 0
      : statusFilter === 'RESOLVED'
        ? resolvedTicketsData?.totalElements || 0
        : 0
    : (closedTicketsData?.totalElements || 0) + (resolvedTicketsData?.totalElements || 0);

  if (isLoading) return <LoadingSpinner message={t('messages.loading')} />;
  if (error) return (
    <div className="flex items-center justify-center py-12">
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">{t('messages.error')}: {(error as Error).message}</p>
        </CardContent>
      </Card>
    </div>
  );

  const handleCreateTicket = () => {
    const dataToValidate = {
      name: newTicket.name,
      description: newTicket.description,
      senderEmail: newTicket.senderEmail || undefined,
      status: 'OPEN' as const,
    };
    
    const result = ticketSchema.safeParse(dataToValidate);
    
    if (!result.success) {
      const errors: ValidationErrors<TicketFormData> = {};
      result.error.errors.forEach((error) => {
        const path = error.path[0] as keyof TicketFormData;
        if (path && !errors[path]) {
          errors[path] = error.message;
        }
      });
      setFormErrors(errors);
      toast({
        title: t('common:titles.validationError'),
        description: t('validation:form.hasErrors'),
        variant: 'destructive',
      });
      return;
    }

    setFormErrors({});

    createTicket.mutate({
      ...newTicket,
      status: 'OPEN',
    }, {
      onSuccess: () => {
        toast({
          title: t('messages.createSuccess'),
          description: `${t('title')} "${newTicket.name}" ${t('messages.created')}.`,
        });
        setIsCreateOpen(false);
        setNewTicket({ name: '', senderEmail: '', description: '' });
        setFormErrors({});
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFilters(prev => ({ ...prev, status: 'all' }));
    setCurrentPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('createButton')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('form.createTitle')}</DialogTitle>
              <DialogDescription>
                {t('form.createDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="ticket-name">{t('form.nameLabel')} *</Label>
                <Input
                  id="ticket-name"
                  placeholder={t('form.namePlaceholder')}
                  value={newTicket.name}
                  onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                  className={formErrors.name ? 'border-destructive' : ''}
                />
                {formErrors.name && (
                  <p className="text-sm text-destructive">{formErrors.name}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sender-email">{t('form.senderEmailLabel')}</Label>
                <Input
                  id="sender-email"
                  type="email"
                  placeholder={t('form.senderEmailPlaceholder')}
                  value={newTicket.senderEmail}
                  onChange={(e) => setNewTicket({ ...newTicket, senderEmail: e.target.value })}
                  className={formErrors.senderEmail ? 'border-destructive' : ''}
                />
                {formErrors.senderEmail && (
                  <p className="text-sm text-destructive">{formErrors.senderEmail}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">{t('form.descriptionLabel')} *</Label>
                <Textarea
                  id="description"
                  placeholder={t('form.descriptionPlaceholder')}
                  rows={4}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className={formErrors.description ? 'border-destructive' : ''}
                />
                {formErrors.description && (
                  <p className="text-sm text-destructive">{formErrors.description}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                {t('form.cancel', { ns: 'common' })}
              </Button>
              <Button onClick={handleCreateTicket}>
                {t('form.createButton')}
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
              {t('tabs.open')} ({openTicketsCount})
            </TabsTrigger>
            <TabsTrigger value="closed">
              {t('tabs.closed')} ({closedTicketsCount})
            </TabsTrigger>
          </TabsList>

          {/* Search & Filters */}
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
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
                  <Label className="mb-2 block text-sm">{t('filters.status')}</Label>
                  <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('filters.allStatuses')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                      <SelectItem value="OPEN">{t('statuses.OPEN')}</SelectItem>
                      <SelectItem value="IN_PROGRESS">{t('statuses.IN_PROGRESS')}</SelectItem>
                      <SelectItem value="RESOLVED">{t('statuses.RESOLVED')}</SelectItem>
                      <SelectItem value="CLOSED">{t('statuses.CLOSED')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sender Email */}
                <div>
                  <Label className="mb-2 block text-sm">{t('filters.senderEmail')}</Label>
                  <Input
                    placeholder={t('filters.searchEmail')}
                    value={filters.senderEmail}
                    onChange={(e) => setFilters({...filters, senderEmail: e.target.value})}
                  />
                </div>

                {/* Name */}
                <div>
                  <Label className="mb-2 block text-sm">{t('filters.name')}</Label>
                  <Input
                    placeholder={t('filters.searchName')}
                    value={filters.name}
                    onChange={(e) => setFilters({...filters, name: e.target.value})}
                  />
                </div>

                {/* Description */}
                <div>
                  <Label className="mb-2 block text-sm">{t('filters.description')}</Label>
                  <Input
                    placeholder={t('filters.searchDescription')}
                    value={filters.description}
                    onChange={(e) => setFilters({...filters, description: e.target.value})}
                  />
                </div>

                {/* Created At From */}
                <div>
                  <Label className="mb-2 block text-sm">{t('filters.createdFrom')}</Label>
                  <Input
                    type="date"
                    value={filters.createdAtFrom}
                    onChange={(e) => setFilters({...filters, createdAtFrom: e.target.value})}
                  />
                </div>

                {/* Created At To */}
                <div>
                  <Label className="mb-2 block text-sm">{t('filters.createdTo')}</Label>
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
                    {t('filters.clearFilters')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tickets List */}
        <TabsContent value="open" className="mt-4 space-y-4">
          <TicketsList tickets={filteredTickets} navigate={navigate} />
          {totalPages > 1 && (
            <TicketsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          )}
        </TabsContent>
        <TabsContent value="closed" className="mt-4 space-y-4">
          <TicketsList tickets={filteredTickets} navigate={navigate} />
          {totalPages > 1 && (
            <TicketsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TicketsPagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useTranslation('tickets');
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      if (currentPage < 3) {
        for (let i = 0; i < Math.min(maxVisible, totalPages); i++) pages.push(i);
      } else if (currentPage > totalPages - 4) {
        for (let i = totalPages - maxVisible; i < totalPages; i++) pages.push(i);
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        {t('pagination.showing', { ns: 'tickets', start: startItem, end: endItem, total: totalElements })}
      </p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(0, currentPage - 1))}
              className={currentPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          {getPageNumbers().map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
              className={currentPage >= totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
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
  const { t } = useTranslation('tickets');

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <TicketIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{t('messages.noTickets')}</h3>
          <p className="text-muted-foreground mt-1">
            {t('messages.noTicketsFilters')}
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
                  <StatusBadge
                    status={ticket.status}
                    type="ticket"
                    label={t(`statuses.${ticket.status}`)}
                  />
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
                    <span>{formatDate(ticket.createdAt, t('messages.notSet', { ns: 'common' }))}</span>
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
