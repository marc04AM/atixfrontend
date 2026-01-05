import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  PlayCircle,
  CheckCheck,
  XCircle,
  LucideIcon
} from 'lucide-react';
import { WorkStatus, TicketStatus } from '@/types';
import { cn } from '@/lib/utils';

type StatusType = WorkStatus | TicketStatus;

interface StatusConfig {
  icon: LucideIcon;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

const workStatusConfig: Record<WorkStatus, StatusConfig> = {
  PENDING: {
    icon: AlertCircle,
    variant: 'outline',
    className: 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-700'
  },
  IN_PROGRESS: {
    icon: Clock,
    variant: 'outline',
    className: 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-700'
  },
  COMPLETED: {
    icon: CheckCircle2,
    variant: 'outline',
    className: 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-700'
  },
  INVOICED: {
    icon: TrendingUp,
    variant: 'outline',
    className: 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-700'
  }
};

const ticketStatusConfig: Record<TicketStatus, StatusConfig> = {
  OPEN: {
    icon: AlertCircle,
    variant: 'outline',
    className: 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400 dark:border-red-700'
  },
  IN_PROGRESS: {
    icon: PlayCircle,
    variant: 'outline',
    className: 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-700'
  },
  RESOLVED: {
    icon: CheckCheck,
    variant: 'outline',
    className: 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 dark:border-green-700'
  },
  CLOSED: {
    icon: XCircle,
    variant: 'outline',
    className: 'border-gray-500 bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-700'
  }
};

interface StatusBadgeProps {
  status: StatusType;
  type: 'work' | 'ticket';
  label: string;
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type,
  label,
  showIcon = true,
  className
}) => {
  const config = type === 'work'
    ? workStatusConfig[status as WorkStatus]
    : ticketStatusConfig[status as TicketStatus];

  if (!config) {
    return null;
  }

  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {label}
    </Badge>
  );
};

// Helper function per ottenere lo status dei work
export const getWorkStatus = (work: { completed?: boolean; invoiced?: boolean }): WorkStatus => {
  if (work.invoiced) return 'INVOICED';
  if (work.completed) return 'COMPLETED';
  return 'IN_PROGRESS';
};
