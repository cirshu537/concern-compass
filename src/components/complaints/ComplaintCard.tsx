import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { Complaint } from '@/types/database';
import { Clock, User, MapPin, UserCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

interface ComplaintCardProps {
  complaint: Complaint;
  onClick: () => void;
  showStudentInfo?: boolean;
  studentName?: string;
}

export function ComplaintCard({ complaint, onClick, showStudentInfo = true, studentName }: ComplaintCardProps) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'main_admin' || profile?.role === 'branch_admin';
  
  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden"
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1">
            {complaint.title}
          </h3>
          <StatusBadge status={complaint.status} />
        </div>
        
        {isAdmin && studentName && (
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-1.5 bg-muted/50 rounded-md">
              <UserCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Student: {studentName}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs font-medium capitalize px-3 py-1">
                {complaint.category.replace(/_/g, ' ')}
              </Badge>
              {complaint.student_type !== 'none' && (
                <Badge variant="secondary" className="text-xs font-medium capitalize px-3 py-1">
                  {complaint.student_type}
                </Badge>
              )}
              {complaint.anonymous && (
                <Badge variant="destructive" className="text-xs font-medium px-3 py-1">
                  Anonymous
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {(!isAdmin || !studentName) && (
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className="text-xs font-medium capitalize px-3 py-1">
              {complaint.category.replace(/_/g, ' ')}
            </Badge>
            {complaint.student_type !== 'none' && (
              <Badge variant="secondary" className="text-xs font-medium capitalize px-3 py-1">
                {complaint.student_type}
              </Badge>
            )}
            {complaint.anonymous && (
              <Badge variant="destructive" className="text-xs font-medium px-3 py-1">
                Anonymous
              </Badge>
            )}
          </div>
        )}
        
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {complaint.description}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0">
        
        <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary/70" />
            <span className="font-medium">{complaint.branch}</span>
          </div>
          {complaint.program && (
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary/70" />
              <span className="font-medium">{complaint.program}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary/70" />
            <span className="font-medium">{format(new Date(complaint.created_at), 'MMM dd, yyyy')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
