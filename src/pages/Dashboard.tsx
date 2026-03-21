import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Ticket,
  AlertCircle
} from 'lucide-react';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useDashboard, useWorks } from '@/hooks/api';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatDate } from '@/lib/date';
import { useTranslation } from 'react-i18next';
import { StatusBadge, getWorkStatusBadgeKey } from '@/components/ui/status-badge';

// Chart colors - orange palette
const WORK_COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa'];
const TICKET_COLORS = ['#ea580c', '#f97316', '#fb923c', '#fdba74'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useDashboard();
  const { t } = useTranslation('dashboard');
  const { user: currentUser } = useAuth();

  // F9: when logged in as TECHNICIAN, show only works assigned to that user
  const isTechnician = currentUser?.type === 'TECHNICIAN';
  const { data: technicianWorksData } = useWorks(
    isTechnician && currentUser?.id
      ? { technicianId: currentUser.id, status: 'IN_PROGRESS', page: 0, size: 100, sort: 'createdAt,desc' }
      : null
  );
  const recentWorksToShow = isTechnician && technicianWorksData?.content
    ? technicianWorksData.content
    : data?.recentWorks ?? [];
  const { t: tTickets } = useTranslation('tickets');
  const { t: tWorks } = useTranslation('works');

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

  const ticketChartData = (data.ticketStatusCounts || []).map((item: any) => ({
    name: t(`charts.ticketStatuses.${item.status.toLowerCase()}`, { defaultValue: item.status.replace('_', ' ') }),
    value: item.count,
  }));

  // Build work chart data from per-status counts
  const workChartData = (data.workStatusCounts || []).map((item: any) => ({
    name: t(`charts.workStatuses.${item.status.toLowerCase()}`, { defaultValue: item.status.replace('_', ' ') }),
    value: item.count,
  }));

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
            <div className="h-[200px]">
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
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
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
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
              {workChartData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5 min-w-0">
                  <span className="shrink-0 h-2 w-2 rounded-full" style={{ backgroundColor: WORK_COLORS[index] }} />
                  <span className="text-xs text-muted-foreground truncate">{item.name}:</span>
                  <span className="text-xs font-semibold shrink-0">{item.value}</span>
                </div>
              ))}
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
            <div className="h-[200px]">
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
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    {ticketChartData.map((_: any, index: number) => (
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
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
              {ticketChartData.map((item: { name: string; value: number }, index: number) => (
                <div key={item.name} className="flex items-center gap-1.5 min-w-0">
                  <span className="shrink-0 h-2 w-2 rounded-full" style={{ backgroundColor: TICKET_COLORS[index] }} />
                  <span className="text-xs text-muted-foreground truncate">{item.name}:</span>
                  <span className="text-xs font-semibold shrink-0">{item.value}</span>
                </div>
              ))}
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
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle className="flex items-baseline gap-2">
                {t('recentWorks.title')}
                {isTechnician && currentUser && (
                  <span className="text-sm font-normal text-muted-foreground">
                    — {currentUser.firstName} {currentUser.lastName}
                  </span>
                )}
              </CardTitle>
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
              {recentWorksToShow.map((work) => (
                <div
                  key={work.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:bg-muted/10 cursor-pointer transition-colors"
                  onClick={() => navigate(`/works/${work.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{work.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(work.orderDate, t('recentWorks.notSet'))}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-2">
                    <StatusBadge
                      status={work.status}
                      type="work"
                      label={tWorks(`badges.${getWorkStatusBadgeKey(work.status)}`)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card className="overflow-hidden">
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
                  className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:bg-muted/10 cursor-pointer transition-colors"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{ticket.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {ticket.senderEmail}
                    </p>
                  </div>
                  <div className="shrink-0 ml-2">
                    <StatusBadge
                      status={ticket.status}
                      type="ticket"
                      label={tTickets(`statuses.${ticket.status}`)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
