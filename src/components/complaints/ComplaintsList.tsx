import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Complaint, ComplaintStatus } from '@/types/database';
import { ComplaintCard } from './ComplaintCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComplaintsListProps {
  filterByBranch?: string;
  filterByTrainer?: boolean;
  filterByAssigned?: string;
  filterByStudentType?: 'brocamp' | 'exclusive' | 'none';
  onComplaintClick?: (complaint: Complaint) => void;
}

export function ComplaintsList({ 
  filterByBranch, 
  filterByTrainer, 
  filterByAssigned,
  filterByStudentType,
  onComplaintClick 
}: ComplaintsListProps) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['complaints', filterByBranch, filterByTrainer, filterByAssigned, filterByStudentType, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterByBranch) {
        query = query.eq('branch', filterByBranch);
      }

      if (filterByStudentType) {
        query = query.eq('student_type', filterByStudentType);
      }

      if (filterByTrainer) {
        // Check if current user is exclusive handler
        const { data: profile } = await supabase
          .from('profiles')
          .select('handles_exclusive')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();
        
        if (profile?.handles_exclusive) {
          // Show all exclusive member complaints
          query = query.eq('student_type', 'exclusive');
        } else {
          // Show only trainer-related complaints
          query = query.eq('category', 'trainer_related');
        }
      }

      if (filterByAssigned) {
        query = query.eq('assigned_staff_id', filterByAssigned);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Complaint[];
    },
  });

  const handleComplaintClick = (complaint: Complaint) => {
    if (onComplaintClick) {
      onComplaintClick(complaint);
    } else {
      navigate(`/complaint/${complaint.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Complaints ({complaints?.length || 0})
        </h2>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ComplaintStatus | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="logged">Logged</SelectItem>
            <SelectItem value="noted">Noted</SelectItem>
            <SelectItem value="in_process">In Process</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {complaints && complaints.length > 0 ? (
        <div className="grid gap-4">
          {complaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onClick={() => handleComplaintClick(complaint)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No complaints found
        </div>
      )}
    </div>
  );
}
