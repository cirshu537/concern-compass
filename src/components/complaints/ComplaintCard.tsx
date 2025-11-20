import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { Complaint } from '@/types/database';
import { Clock, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface ComplaintCardProps {
  complaint: Complaint;
  onClick: () => void;
  showStudentInfo?: boolean;
}

export function ComplaintCard({ complaint, onClick, showStudentInfo = true }: ComplaintCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-all"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-2 truncate">{complaint.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {complaint.description}
            </p>
          </div>
          <StatusBadge status={complaint.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {complaint.category.replace(/_/g, ' ')}
          </Badge>
          {complaint.student_type !== 'none' && (
            <Badge variant="secondary" className="text-xs">
              {complaint.student_type}
            </Badge>
          )}
          {complaint.anonymous && (
            <Badge variant="destructive" className="text-xs">
              Anonymous
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{complaint.branch}</span>
          </div>
          {complaint.program && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{complaint.program}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{format(new Date(complaint.created_at), 'MMM dd, yyyy')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
