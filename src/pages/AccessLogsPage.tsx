import { useState } from 'react';
import { Shield, Search, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessLogs } from '@/hooks/api';
import { AccessLog } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const PAGE_SIZE = 50;

export default function AccessLogsPage() {
  const { isOwner } = useAuth();
  const { t } = useTranslation('access-logs');

  const [emailFilter, setEmailFilter] = useState('');
  const [successFilter, setSuccessFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);

  const params = {
    page: currentPage,
    size: PAGE_SIZE,
    sort: 'timestamp,desc',
    ...(emailFilter ? { email: emailFilter } : {}),
    ...(successFilter !== 'all' ? { success: successFilter } : {}),
  };

  const { data, isLoading } = useAccessLogs(params);

  const logs = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const handleEmailChange = (value: string) => {
    setEmailFilter(value);
    setCurrentPage(0);
  };

  const handleSuccessChange = (value: string) => {
    setSuccessFilter(value);
    setCurrentPage(0);
  };

  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const formatTimestamp = (ts: string) =>
    new Date(ts).toLocaleString();

  const formatMs = (ms: number): string => {
    const totalMinutes = Math.floor(ms / 60000);
    if (totalMinutes < 1) return t('duration.lessThanMinute');
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return t('duration.minutes', { count: minutes });
    if (minutes === 0) return t('duration.hours', { count: hours });
    return t('duration.hoursAndMinutes', { hours, minutes });
  };

  const formatDuration = (log: AccessLog): string => {
    if (!log.success) return '—';
    const now = new Date();
    if (log.logoutTimestamp) {
      return formatMs(new Date(log.logoutTimestamp).getTime() - new Date(log.timestamp).getTime());
    }
    if (log.jwtExpiresAt && new Date(log.jwtExpiresAt) > now) {
      return t('duration.active');
    }
    if (log.jwtExpiresAt) {
      return formatMs(new Date(log.jwtExpiresAt).getTime() - new Date(log.timestamp).getTime())
        + ' (' + t('duration.expired') + ')';
    }
    return t('duration.active');
  };

  if (!isOwner()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">{t('accessDenied.title')}</h2>
        <p className="text-muted-foreground max-w-md">
          {t('accessDenied.description')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('filters.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('filters.emailPlaceholder')}
                value={emailFilter}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={successFilter} onValueChange={handleSuccessChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t('filters.outcome')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.all')}</SelectItem>
                <SelectItem value="true">{t('success')}</SelectItem>
                <SelectItem value="false">{t('failure')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('columns.timestamp')}</TableHead>
                    <TableHead>{t('columns.user')}</TableHead>
                    <TableHead>{t('columns.email')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('columns.ipAddress')}</TableHead>
                    <TableHead className="hidden lg:table-cell">{t('columns.userAgent')}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t('columns.duration')}</TableHead>
                    <TableHead>{t('columns.outcome')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {t('noResults')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.userFullName ?? <span className="text-muted-foreground italic">{t('deletedUser')}</span>}
                        </TableCell>
                        <TableCell className="text-sm">{log.email}</TableCell>
                        <TableCell className="text-sm hidden md:table-cell font-mono">
                          {log.ipAddress ?? '—'}
                        </TableCell>
                        <TableCell className="text-sm hidden lg:table-cell max-w-xs truncate" title={log.userAgent}>
                          {log.userAgent ?? '—'}
                        </TableCell>
                        <TableCell className="text-sm hidden sm:table-cell whitespace-nowrap">
                          {formatDuration(log)}
                        </TableCell>
                        <TableCell>
                          {log.success ? (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600 gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {t('success')}
                            </Badge>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <Badge variant="destructive" className="gap-1 w-fit">
                                <XCircle className="h-3 w-3" />
                                {t('failure')}
                              </Badge>
                              {log.failureReason && (
                                <span className="text-xs text-muted-foreground">
                                  {t(`failureReasons.${log.failureReason}`, { defaultValue: log.failureReason })}
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {t('pagination.showing', {
                      start: currentPage * PAGE_SIZE + 1,
                      end: Math.min((currentPage + 1) * PAGE_SIZE, totalElements),
                      total: totalElements,
                    })}
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                          className={currentPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {getPageNumbers().map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                          className={currentPage >= totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
