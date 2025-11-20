import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Complaint, ComplaintStatus, Profile } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowLeft, User, MapPin, Calendar, Tag, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewsList } from '@/components/complaints/ReviewsList';

interface ComplaintDetailsProps {
  complaintId: string;
  onBack?: () => void;
}

export function ComplaintDetails({ complaintId, onBack }: ComplaintDetailsProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState<ComplaintStatus | null>(null);
  const [assignedStaffId, setAssignedStaffId] = useState<string | null>(null);

  const { data: complaint, isLoading } = useQuery({
    queryKey: ['complaint', complaintId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', complaintId)
        .single();
      
      if (error) throw error;
      return data as Complaint;
    },
  });

  const { data: staff } = useQuery({
    queryKey: ['staff', complaint?.branch],
    enabled: !!complaint?.branch && (profile?.role === 'branch_admin' || profile?.role === 'main_admin'),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'staff')
        .eq('branch', complaint!.branch);
      
      if (error) throw error;
      return data as Profile[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: ComplaintStatus) => {
      const { error } = await supabase
        .from('complaints')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', complaintId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Status updated successfully');
      setNewStatus(null);
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const assignStaffMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const { error } = await supabase
        .from('complaints')
        .update({ 
          assigned_staff_id: staffId,
          status: 'in_process',
          updated_at: new Date().toISOString()
        })
        .eq('id', complaintId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Staff assigned successfully');
      setAssignedStaffId(null);
    },
    onError: () => {
      toast.error('Failed to assign staff');
    },
  });

  const revealIdentityMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('complaints')
        .update({ 
          identity_revealed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', complaintId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
      toast.success('Identity revealed successfully');
    },
    onError: () => {
      toast.error('Failed to reveal identity');
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  if (!complaint) {
    return <div className="text-center py-12">Complaint not found</div>;
  }

  const canManage = profile?.role === 'staff' || profile?.role === 'branch_admin' || profile?.role === 'main_admin';

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{complaint.title}</CardTitle>
              <div className="flex items-center gap-2">
                <StatusBadge status={complaint.status} />
                <span className="text-sm text-muted-foreground">
                  {complaint.anonymous ? 'Anonymous' : 'Public'}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{complaint.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium">{complaint.category.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Branch:</span>
              <span className="font-medium">{complaint.branch}</span>
            </div>
            {complaint.program && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Program:</span>
                <span className="font-medium">{complaint.program}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">{format(new Date(complaint.created_at), 'PPP')}</span>
            </div>
          </div>

          {canManage && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Management Actions</h3>
              
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Update Status</label>
                  <div className="flex gap-2">
                    <Select value={newStatus || complaint.status} onValueChange={(value) => setNewStatus(value as ComplaintStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="logged">Logged</SelectItem>
                        <SelectItem value="in_process">In Process</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    {newStatus && newStatus !== complaint.status && (
                      <Button 
                        onClick={() => updateStatusMutation.mutate(newStatus)}
                        disabled={updateStatusMutation.isPending}
                      >
                        Update
                      </Button>
                    )}
                  </div>
                </div>

                {(profile?.role === 'branch_admin' || profile?.role === 'main_admin') && staff && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Assign to Staff</label>
                    <div className="flex gap-2">
                      <Select value={assignedStaffId || complaint.assigned_staff_id || ''} onValueChange={setAssignedStaffId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          {staff.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {assignedStaffId && assignedStaffId !== complaint.assigned_staff_id && (
                        <Button 
                          onClick={() => assignStaffMutation.mutate(assignedStaffId)}
                          disabled={assignStaffMutation.isPending}
                        >
                          Assign
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {profile?.role === 'main_admin' && complaint.anonymous && !complaint.identity_revealed && (
                  <div>
                    <Button 
                      variant="destructive"
                      onClick={() => revealIdentityMutation.mutate()}
                      disabled={revealIdentityMutation.isPending}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Reveal Student Identity
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      This action will make the student's identity visible to all staff handling this concern
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <ReviewsList complaintId={complaintId} />

      {/* Review Form for Students */}
      {profile?.role === 'student' && 
       complaint.student_id === profile.id && 
       (complaint.status === 'fixed' || complaint.status === 'rejected') && (
        <ReviewForm 
          complaintId={complaintId}
          onReviewSubmitted={() => queryClient.invalidateQueries({ queryKey: ['reviews', complaintId] })}
        />
      )}
    </div>
  );
}
