import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Factory, 
  CheckCircle2, 
  Clock, 
  Ticket,
  Briefcase,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { TicketStatus } from '@/types';

// Mock data - replace with real API calls
const mockDashboardData = {
  clientCount: 45,
  plantCount: 23,
  completedWorkCount: 128,
  pendingWorkCount: 34,
  ticketStatusCounts: [
    { status: 'OPEN' as TicketStatus, count: 12 },
    { status: 'IN_PROGRESS' as TicketStatus, count: 8 },
    { status: 'RESOLVED' as TicketStatus, count: 5 },
    { status: 'CLOSED' as TicketStatus, count: 45 },
  ],
  recentWorks: [
    { id: '1', name: 'Automation System Upgrade', orderDate: '2024-01-15', completed: false, invoiced: false },
    { id: '2', name: 'PLC Programming - Line 3', orderDate: '2024-01-12', completed: true, invoiced: false },
    { id: '3', name: 'Electrical Panel Installation', orderDate: '2024-01-10', completed: true, invoiced: true },
    { id: '4', name: 'SCADA System Integration', orderDate: '2024-01-08', completed: false, invoiced: false },
    { id: '5', name: 'Safety System Audit', orderDate: '2024-01-05', completed: true, invoiced: true },
  ],
  recentTickets: [
    { id: '1', name: 'Machine malfunction on Line 2', senderEmail: 'operator@plant.com', status: 'OPEN' as TicketStatus, createdAt: '2024-01-16T10:30:00' },
    { id: '2', name: 'Software update required', senderEmail: 'it@factory.com', status: 'IN_PROGRESS' as TicketStatus, createdAt: '2024-01-15T14:00:00' },
    { id: '3', name: 'Annual maintenance request', senderEmail: 'maintenance@client.com', status: 'OPEN' as TicketStatus, createdAt: '2024-01-14T09:15:00' },
    { id: '4', name: 'Emergency repair needed', senderEmail: 'urgent@plant.com', status: 'RESOLVED' as TicketStatus, createdAt: '2024-01-13T16:45:00' },
    { id: '5', name: 'New installation quote', senderEmail: 'sales@company.com', status: 'CLOSED' as TicketStatus, createdAt: '2024-01-12T11:20:00' },
  ],
};

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

export default function Dashboard() {
  const navigate = useNavigate();
  const data = mockDashboardData;

  const statCards = [
    {
      title: 'Total Clients',
      value: data.clientCount,
      icon: Building2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Plants',
      value: data.plantCount,
      icon: Factory,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      title: 'Completed Works',
      value: data.completedWorkCount,
      icon: CheckCircle2,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
    },
    {
      title: 'Pending Works',
      value: data.pendingWorkCount,
      icon: Clock,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
  ];

  const openTickets = data.ticketStatusCounts.find(t => t.status === 'OPEN')?.count || 0;
  const inProgressTickets = data.ticketStatusCounts.find(t => t.status === 'IN_PROGRESS')?.count || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your work management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ticket Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.ticketStatusCounts.map((ticketStatus) => (
          <Card 
            key={ticketStatus.status} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/tickets?status=${ticketStatus.status}`)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {ticketStatus.status.replace('_', ' ')}
                  </p>
                  <p className="text-2xl font-bold mt-1">{ticketStatus.count}</p>
                </div>
                <Badge className={getTicketStatusColor(ticketStatus.status)}>
                  <Ticket className="h-3 w-3 mr-1" />
                  Tickets
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Banner */}
      {(openTickets > 0 || inProgressTickets > 0) && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-primary" />
              <p className="text-sm">
                You have <strong>{openTickets} open</strong> and{' '}
                <strong>{inProgressTickets} in-progress</strong> tickets that need attention.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Items Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Works */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle>Recent Works</CardTitle>
            </div>
            <button
              onClick={() => navigate('/works')}
              className="text-sm text-primary hover:underline"
            >
              View all
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentWorks.map((work) => (
                <div
                  key={work.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/works/${work.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{work.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(work.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              <CardTitle>Recent Tickets</CardTitle>
            </div>
            <button
              onClick={() => navigate('/tickets')}
              className="text-sm text-primary hover:underline"
            >
              View all
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{ticket.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {ticket.senderEmail}
                    </p>
                  </div>
                  <Badge className={getTicketStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
