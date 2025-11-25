import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Complaint, ComplaintStatus, Profile } from '@/types/database';
import { ComplaintCard } from './ComplaintCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Users, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

interface ComplaintsListProps {
  filterByBranch?: string;
  filterByTrainer?: boolean;
  filterByAssigned?: string;
  filterByStudentType?: 'brocamp' | 'exclusive' | 'none';
  filterByCategory?: string;
  filterByHighAlertStaff?: boolean;
  filterByStatus?: string;
  filterByToday?: boolean;
  filterByTimeRange?: 'today' | 'weekly' | 'monthly' | 'yearly' | 'lifetime';
  onComplaintClick?: (complaint: Complaint) => void;
}

export function ComplaintsList({
  filterByBranch,
  filterByTrainer,
  filterByAssigned,
  filterByStudentType,
  filterByCategory,
  filterByHighAlertStaff,
  filterByStatus,
  filterByToday,
  filterByTimeRange,
  onComplaintClick 
}: ComplaintsListProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'main_admin' || profile?.role === 'branch_admin';
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'trainer_related' | 'staff_handled'>('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState<'today' | 'weekly' | 'monthly' | 'yearly' | 'lifetime'>('today');

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('complaints-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['complaints'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['complaints', filterByBranch, filterByTrainer, filterByAssigned, filterByStudentType, filterByCategory, filterByHighAlertStaff, filterByStatus, filterByToday, filterByTimeRange, statusFilter, categoryFilter, timeRangeFilter],
    queryFn: async () => {
      let query = supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterByBranch) {
        query = query.eq('branch', filterByBranch);
      }

      // Apply time range filter (prioritize local filter over props)
      const activeTimeRange = filterByTimeRange || timeRangeFilter;
      if (activeTimeRange !== 'lifetime') {
        const now = new Date();
        let rangeStart: Date;
        
        switch (activeTimeRange) {
          case 'today':
            rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'weekly':
            rangeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'monthly':
            rangeStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'yearly':
            rangeStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
        
        query = query.gte('created_at', rangeStart.toISOString());
      } else if (filterByToday) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('created_at', today.toISOString());
      }

      if (filterByStudentType) {
        query = query.eq('student_type', filterByStudentType);
      }

      if (filterByCategory) {
        query = query.eq('category', filterByCategory as any);
      }
      
      // Apply local category filter
      if (categoryFilter === 'trainer_related') {
        query = query.eq('category', 'trainer_related');
      } else if (categoryFilter === 'staff_handled') {
        // Staff handle all non-trainer-related categories
        query = query.neq('category', 'trainer_related');
      }
      
      if (filterByStatus) {
        if (filterByStatus === 'open') {
          query = query.in('status', ['logged', 'noted', 'in_process']);
        } else {
          query = query.eq('status', filterByStatus as ComplaintStatus);
        }
      }

      if (filterByHighAlertStaff) {
        // Get complaints with negative reviews from students to staff
        const { data: negativeReviews } = await supabase
          .from('complaint_reviews')
          .select('complaint_id')
          .eq('reviewer_role', 'student')
          .eq('rating', -1);
        
        if (negativeReviews && negativeReviews.length > 0) {
          const complaintIds = negativeReviews.map(r => r.complaint_id);
          query = query.in('id', complaintIds);
        } else {
          // Return empty if no negative reviews exist
          return [];
        }
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

  // Fetch student profiles for admins
  const studentIds = complaints?.map(c => c.student_id) || [];
  const { data: studentProfiles } = useQuery({
    queryKey: ['student-profiles', studentIds],
    enabled: isAdmin && studentIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', studentIds);
      
      if (error) throw error;
      return data as Profile[];
    },
  });

  const getStudentName = (studentId: string) => {
    return studentProfiles?.find(p => p.id === studentId)?.full_name;
  };

  const handleComplaintClick = (complaint: Complaint) => {
    if (onComplaintClick) {
      onComplaintClick(complaint);
    } else {
      navigate(`/complaint/${complaint.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 pb-4 border-b border-border/50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Complaints
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {complaints?.length || 0} {complaints?.length === 1 ? 'complaint' : 'complaints'} found
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRangeFilter} onValueChange={(value) => setTimeRangeFilter(value as typeof timeRangeFilter)}>
              <SelectTrigger className="w-[160px] h-11">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="weekly">Last Week</SelectItem>
                <SelectItem value="monthly">Last Month</SelectItem>
                <SelectItem value="yearly">Last Year</SelectItem>
                <SelectItem value="lifetime">Lifetime</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ComplaintStatus | 'all')}>
              <SelectTrigger className="w-[160px] h-11">
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
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Quick Filters:</span>
          <Button
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('all')}
            className="h-9 gap-2"
          >
            All Categories
          </Button>
          <Button
            variant={categoryFilter === 'trainer_related' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('trainer_related')}
            className="h-9 gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            Trainer Related
          </Button>
          <Button
            variant={categoryFilter === 'staff_handled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('staff_handled')}
            className="h-9 gap-2"
          >
            <Users className="w-4 h-4" />
            Staff Handled
          </Button>
        </div>
      </div>

      {complaints && complaints.length > 0 ? (
        <div className="grid gap-5">
          {complaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onClick={() => handleComplaintClick(complaint)}
              studentName={isAdmin ? getStudentName(complaint.student_id) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No complaints found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            There are no complaints matching your current filters. Try adjusting the filters or check back later.
          </p>
        </div>
      )}
    </div>
  );
}
