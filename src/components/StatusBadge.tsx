import { Badge } from '@/components/ui/badge';
import { ComplaintStatus } from '@/types/database';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ComplaintStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'logged':
        return 'bg-status-logged/20 text-status-logged border-status-logged/30';
      case 'noted':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'in_process':
        return 'bg-status-inProcess/20 text-status-inProcess border-status-inProcess/30';
      case 'fixed':
        return 'bg-status-fixed/20 text-status-fixed border-status-fixed/30';
      case 'cancelled':
        return 'bg-status-cancelled/20 text-status-cancelled border-status-cancelled/30';
      case 'rejected':
        return 'bg-status-rejected/20 text-status-rejected border-status-rejected/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'noted':
        return 'Noted';
      case 'in_process':
        return 'In Process';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Badge variant="outline" className={cn('font-medium', getStatusColor())}>
      {getStatusLabel()}
    </Badge>
  );
};