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
  excludeTrainerRelated?: boolean;
  onComplaintClick?: (complaint: Complaint) => void;
  hideInternalFilters?: boolean;
  hideCategoryFilter?: boolean;
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
  excludeTrainerRelated,
  onComplaintClick,
  hideInternalFilters,
  hideCategoryFilter
}: ComplaintsListProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'main_admin' || profile?.role === 'branch_admin';
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'trainer_related' | 'staff_handled'>('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState<'today' | 'weekly' | 'monthly' | 'yearly' | 'lifetime'>(filterByTimeRange || 'today');

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
    queryKey: ['complaints', filterByBranch, filterByTrainer, filterByAssigned, filterByStudentType, filterByCategory, filterByHighAlertStaff, filterByStatus, filterByToday, filterByTimeRange, excludeTrainerRelated, statusFilter, categoryFilter, timeRangeFilter],
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      let query = supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterByBranch) {
        query = query.eq('branch', filterByBranch);
      }

      // Exclude trainer-related complaints for staff
      if (excludeTrainerRelated) {
        query = query.neq('category', 'trainer_related');
      }

      // Apply time range filter - use prop if provided, otherwise use local state
      if (filterByTimeRange && filterByTimeRange !== 'lifetime') {
        const now = new Date();
        let rangeStart: Date;
        
        switch (filterByTimeRange) {
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
      } else if (timeRangeFilter !== 'lifetime') {
        // Use local time range filter
        const now = new Date();
        let rangeStart: Date;
        
        switch (timeRangeFilter) {
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
    staleTime: 60000, // 1 minute - profiles don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
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
      // Build context URL parameters based on current view
      const params = new URLSearchParams();
      params.set('view', 'detail');
      params.set('id', complaint.id);
      
      // Add return context based on active filters
      if (filterByBranch) params.set('returnView', 'branch');
      else if (filterByStatus) params.set('returnView', 'filtered');
      else params.set('returnView', 'complaints');
      
      if (statusFilter !== 'all') params.set('statusFilter', statusFilter);
      if (categoryFilter !== 'all') params.set('categoryFilter', categoryFilter);
      
      // Navigate to appropriate dashboard with context
      if (profile?.role === 'main_admin') {
        navigate(`/main-admin/dashboard?${params.toString()}`);
      } else if (profile?.role === 'branch_admin') {
        navigate(`/branch-admin/dashboard?${params.toString()}`);
      } else if (profile?.role === 'staff') {
        navigate(`/staff/dashboard?${params.toString()}`);
      } else if (profile?.role === 'trainer') {
        navigate(`/trainer/dashboard?${params.toString()}`);
      }
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
    <div className="space-y-4">
      {!hideInternalFilters && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/30">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Complaints
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {complaints?.length || 0} {complaints?.length === 1 ? 'complaint' : 'complaints'} found
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={timeRangeFilter} onValueChange={(value) => setTimeRangeFilter(value as typeof timeRangeFilter)}>
              <SelectTrigger className="w-[130px] h-9">
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
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="Status" />
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
            {!hideCategoryFilter && (
              <>
                <Button
                  variant={categoryFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter('all')}
                  className="h-9"
                >
                  All
                </Button>
                <Button
                  variant={categoryFilter === 'trainer_related' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter('trainer_related')}
                  className="h-9"
                >
                  Trainer
                </Button>
                <Button
                  variant={categoryFilter === 'staff_handled' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter('staff_handled')}
                  className="h-9"
                >
                  Staff
                </Button>
              </>
            )}
          </div>
        </div>
      )}

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
