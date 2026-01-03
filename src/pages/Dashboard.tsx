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
import { useDashboard } from '@/hooks/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatDate } from '@/lib/date';
import { useTranslation } from 'react-i18next';

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

// Chart colors - orange palette
const WORK_COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa'];
const TICKET_COLORS = ['#ea580c', '#f97316', '#fb923c', '#fdba74'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useDashboard();
  const { t } = useTranslation('dashboard');

  if (isLoading) return <LoadingSpinner message={t('loading')} />;
  if (error) return (
    <div className="flex items-center justify-center py-12">
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{t('error', { message: (error as Error).message })}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  if (!data) return null;

  const openTickets = data.ticketStatusCounts?.find((t: any) => t.status === 'OPEN')?.count || 0;
  const inProgressTickets = data.ticketStatusCounts?.find((t: any) => t.status === 'IN_PROGRESS')?.count || 0;

  const ticketChartData = (data.ticketStatusCounts || []).map((t: any) => ({
    name: t.status.replace('_', ' '),
    value: t.count,
  }));

  // Build work chart data from completed and pending counts
  const workChartData = [
    { name: 'Pending', value: data.pendingWorkCount || 0 },
    { name: 'Completed', value: data.completedWorkCount || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Work Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              {t('charts.worksByStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {WORK_COLORS.map((color, index) => (
                      <linearGradient key={`workGradient-${index}`} id={`workGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={workChartData}
                    cx="50%"
                    cy="42%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    {workChartData.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#workGradient-${index})`}
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      padding: '8px 12px'
                    }}
                    formatter={(value: number, name: string) => [`${value} ${t('charts.works')}`, name]}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{ paddingTop: '16px' }}
                    formatter={(value, entry) => {
                      const item = workChartData.find(d => d.name === value);
                      return <span className="text-sm text-foreground">{value}: <strong>{item?.value || 0}</strong></span>;
                    }}
                  />
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
              {t('charts.ticketsByStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {TICKET_COLORS.map((color, index) => (
                      <linearGradient key={`ticketGradient-${index}`} id={`ticketGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={ticketChartData}
                    cx="50%"
                    cy="42%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    {ticketChartData.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#ticketGradient-${index})`}
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      padding: '8px 12px'
                    }}
                    formatter={(value: number, name: string) => [`${value} ${t('charts.tickets')}`, name]}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{ paddingTop: '16px' }}
                    formatter={(value, entry) => {
                      const item = ticketChartData.find(d => d.name === value);
                      return <span className="text-sm text-foreground">{value}: <strong>{item?.value || 0}</strong></span>;
                    }}
                  />
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
              <p className="text-sm" dangerouslySetInnerHTML={{
                __html: t('alerts.ticketsNeedAttention', {
                  open: openTickets,
                  inProgress: inProgressTickets
                })
              }} />
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
              <CardTitle>{t('recentWorks.title')}</CardTitle>
            </div>
            <button
              onClick={() => navigate('/works')}
              className="text-sm text-primary hover:underline"
            >
              {t('recentWorks.viewAll')}
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
                      {formatDate(work.orderDate, t('recentWorks.notSet'))}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {work.invoiced ? (
                      <Badge variant="secondary">{t('recentWorks.badges.invoiced')}</Badge>
                    ) : work.completed ? (
                      <Badge className="bg-chart-3/20 text-chart-3 border-chart-3">{t('recentWorks.badges.completed')}</Badge>
                    ) : (
                      <Badge variant="outline">{t('recentWorks.badges.inProgress')}</Badge>
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
              <CardTitle>{t('recentTickets.title')}</CardTitle>
            </div>
            <button
              onClick={() => navigate('/tickets')}
              className="text-sm text-primary hover:underline"
            >
              {t('recentTickets.viewAll')}
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
