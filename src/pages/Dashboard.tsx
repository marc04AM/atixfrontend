import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase,
  Ticket,
  AlertCircle
} from 'lucide-react';
import { TicketStatus } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Mock data - replace with real API calls
const mockDashboardData = {
  ticketStatusCounts: [
    { status: 'OPEN' as TicketStatus, count: 12 },
    { status: 'IN_PROGRESS' as TicketStatus, count: 8 },
    { status: 'RESOLVED' as TicketStatus, count: 5 },
    { status: 'CLOSED' as TicketStatus, count: 45 },
  ],
  workStatusCounts: [
    { status: 'PENDING', count: 15, label: 'Pending' },
    { status: 'IN_PROGRESS', count: 22, label: 'In Progress' },
    { status: 'COMPLETED', count: 38, label: 'Completed' },
    { status: 'INVOICED', count: 52, label: 'Invoiced' },
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

// Chart colors using CSS variable fallbacks
const WORK_COLORS = ['hsl(var(--chart-4))', 'hsl(var(--primary))', 'hsl(var(--chart-3))', 'hsl(var(--chart-2))'];
const TICKET_COLORS = ['hsl(var(--destructive))', 'hsl(var(--primary))', 'hsl(var(--chart-3))', 'hsl(var(--muted-foreground))'];

export default function Dashboard() {
  const navigate = useNavigate();
  const data = mockDashboardData;

  const openTickets = data.ticketStatusCounts.find(t => t.status === 'OPEN')?.count || 0;
  const inProgressTickets = data.ticketStatusCounts.find(t => t.status === 'IN_PROGRESS')?.count || 0;

  const ticketChartData = data.ticketStatusCounts.map(t => ({
    name: t.status.replace('_', ' '),
    value: t.count,
  }));

  const workChartData = data.workStatusCounts.map(w => ({
    name: w.label,
    value: w.count,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your work management system
        </p>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Work Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Works by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {workChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={WORK_COLORS[index % WORK_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              Tickets by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {ticketChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={TICKET_COLORS[index % TICKET_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
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
                    {work.invoiced ? (
                      <Badge variant="secondary">Invoiced</Badge>
                    ) : work.completed ? (
                      <Badge className="bg-chart-3/20 text-chart-3 border-chart-3">Completed</Badge>
                    ) : (
                      <Badge variant="outline">In Progress</Badge>
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
