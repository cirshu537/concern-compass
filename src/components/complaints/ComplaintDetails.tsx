import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Complaint, ComplaintStatus, Profile } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowLeft, User, MapPin, Calendar, Tag, Eye, MessageSquare, Users, Paperclip } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewsList } from '@/components/complaints/ReviewsList';

interface ComplaintDetailsProps {
  complaintId: string;
  onBack?: () => void;
}

export function ComplaintDetails({ complaintId, onBack }: ComplaintDetailsProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState<ComplaintStatus | null>(null);
  const [assignedStaffId, setAssignedStaffId] = useState<string | null>(null);
  const [showAttachment, setShowAttachment] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);

  // Subscribe to real-time updates for this complaint and its reviews
  useEffect(() => {
    const channel = supabase
      .channel(`complaint-${complaintId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
          filter: `id=eq.${complaintId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaint_reviews',
          filter: `complaint_id=eq.${complaintId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['reviews', complaintId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [complaintId, queryClient]);

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

  // Fetch student profile for admins
  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', complaint?.student_id],
    enabled: !!complaint?.student_id && (profile?.role === 'main_admin' || profile?.role === 'branch_admin'),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, branch, program, credits, negative_count_lifetime, banned_from_raise')
        .eq('id', complaint!.student_id)
        .single();
      
      if (error) throw error;
      return data as Profile;
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

  const { data: reviews } = useQuery({
    queryKey: ['reviews', complaintId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaint_reviews')
        .select('*')
        .eq('complaint_id', complaintId);
      
      if (error) throw error;
      return data;
    },
  });

  // Check for existing conversations
  const { data: existingConversations } = useQuery({
    queryKey: ['conversations', complaintId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('complaint_id', complaintId)
        .eq('is_closed', false);
      
      if (error) throw error;
      return data;
    },
  });

  const startMainToBranchConversation = useMutation({
    mutationFn: async () => {
      // Check if conversation already exists
      const existing = existingConversations?.find(c => c.type === 'main_to_branch');
      if (existing) {
        navigate(`/chat?conversation=${existing.id}`);
        return;
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          complaint_id: complaintId,
          type: 'main_to_branch',
          branch: complaint!.branch,
          started_by_id: profile!.id
        })
        .select()
        .single();
      
      if (error) throw error;
      navigate(`/chat?conversation=${data.id}`);
    },
    onError: () => {
      toast.error('Failed to start conversation');
    },
  });

  const startBranchToStaffConversation = useMutation({
    mutationFn: async (type: 'group' | 'direct') => {
      const conversationType = type === 'group' ? 'branch_to_staff_group' : 'branch_to_staff_direct';
      
      // Check if group conversation already exists
      if (type === 'group') {
        const existing = existingConversations?.find(c => c.type === 'branch_to_staff_group');
        if (existing) {
          navigate(`/chat?conversation=${existing.id}`);
          return;
        }
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          complaint_id: complaintId,
          type: conversationType,
          branch: complaint!.branch,
          started_by_id: profile!.id
        })
        .select()
        .single();
      
      if (error) throw error;
      navigate(`/chat?conversation=${data.id}`);
    },
    onError: () => {
      toast.error('Failed to start conversation');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: ComplaintStatus) => {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };
      
      // If moving to in_process, assign to current staff or trainer
      if (status === 'in_process' && profile?.role === 'staff') {
        updateData.assigned_staff_id = profile.id;
      } else if (status === 'in_process' && profile?.role === 'trainer' && profile?.handles_exclusive) {
        updateData.assigned_trainer_id = profile.id;
      }
      
      // Set resolved_at timestamp when marking as fixed
      if (status === 'fixed') {
        updateData.resolved_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', complaintId)
        .select()
        .single();
      
      if (error) {
        console.error('Status update error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['exclusive-handler-stats'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-stats'] });
      queryClient.invalidateQueries({ queryKey: ['staff-stats'] });
      toast.success('Status updated successfully');
      setNewStatus(null);
    },
    onError: (error: any) => {
      console.error('Failed to update status:', error);
      toast.error(error?.message || 'Failed to update status');
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

  const assignTrainerMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('complaints')
        .update({ 
          assigned_trainer_id: profile!.id,
          status: 'in_process',
          updated_at: new Date().toISOString()
        })
        .eq('id', complaintId)
        .select()
        .single();
      
      if (error) {
        console.error('Assignment error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['exclusive-handler-stats'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-stats'] });
      toast.success('You are now working on this concern');
    },
    onError: (error: any) => {
      console.error('Failed to assign concern:', error);
      toast.error(error?.message || 'Failed to assign concern');
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
  const isExclusiveHandler = profile?.role === 'trainer' && profile?.handles_exclusive;

  const handleViewAttachment = async () => {
    if (!complaint.attachment_url) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('complaint-attachments')
        .createSignedUrl(complaint.attachment_url, 60);

      if (error) throw error;
      if (data) {
        setAttachmentUrl(data.signedUrl);
        setShowAttachment(true);
      }
    } catch (error) {
      toast.error('Failed to load attachment');
    }
  };

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="outline" onClick={onBack} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      )}

      {/* Main Header Card */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold mb-3">{complaint.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={complaint.status} />
                {complaint.anonymous && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/50">
                    Anonymous
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description Section */}
          <div className="bg-muted/30 rounded-lg p-5 border border-border/30">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Description</h3>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
          </div>

          {/* Attachment Section */}
          {complaint.attachment_url && (
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAttachment}
                className="hover:bg-accent"
              >
                <Paperclip className="w-4 h-4 mr-2" />
                View Attachment
              </Button>
              
              {showAttachment && attachmentUrl && (
                <div className="mt-4 border border-border/50 rounded-lg p-4 bg-card">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold">Attachment Preview</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAttachment(false)}
                    >
                      Close
                    </Button>
                  </div>
                  <img 
                    src={attachmentUrl} 
                    alt="Complaint attachment" 
                    className="max-w-full rounded-lg border border-border/30"
                  />
                </div>
              )}
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg border border-border/30">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">Category</p>
                <p className="font-semibold text-sm capitalize">{complaint.category.replace(/_/g, ' ')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg border border-border/30">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">Branch</p>
                <p className="font-semibold text-sm">{complaint.branch}</p>
              </div>
            </div>

            {complaint.program && (
              <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg border border-border/30">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Program</p>
                  <p className="font-semibold text-sm">{complaint.program}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg border border-border/30">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">Created</p>
                <p className="font-semibold text-sm">{format(new Date(complaint.created_at), 'MMMM d, yyyy')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Information Card for Admins */}
      {(profile?.role === 'main_admin' || profile?.role === 'branch_admin') && studentProfile && (
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-base">{studentProfile.full_name}</p>
                  <p className="text-sm text-muted-foreground">{studentProfile.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/student-profile/${studentProfile.id}`);
                }}
                className="hover:bg-accent"
              >
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Cards */}
      {/* Exclusive Handler Actions - Working on Concern Button when Logged or Noted */}
      {isExclusiveHandler && complaint.student_type === 'exclusive' && (complaint.status === 'logged' || complaint.status === 'noted') && !complaint.assigned_trainer_id && (
        <Card className="border-border/50 shadow-lg bg-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Take Action</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => assignTrainerMutation.mutate()}
              disabled={assignTrainerMutation.isPending}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              Working on Concern
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Staff Actions - Process Button when Logged or Noted */}
      {(profile?.role === 'staff' || profile?.role === 'branch_admin') && (complaint.status === 'logged' || complaint.status === 'noted') && (
        <Card className="border-border/50 shadow-lg bg-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Take Action</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => updateStatusMutation.mutate('in_process')}
              disabled={updateStatusMutation.isPending}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              Process Concern
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Exclusive Handler Actions - Review & Complete when In Process */}
      {isExclusiveHandler && 
       complaint.student_type === 'exclusive' && 
       complaint.status === 'in_process' && 
       complaint.assigned_trainer_id === profile.id && (
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Review & Complete</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Please provide your rating and review before marking as fixed or cancelled</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ReviewForm 
              complaintId={complaintId} 
              allowStatusChange={true}
              currentStatus={complaint.status}
            />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                onClick={() => updateStatusMutation.mutate('fixed')}
                disabled={updateStatusMutation.isPending}
                className="h-12 font-semibold"
                variant="default"
              >
                Mark as Fixed
              </Button>
              <Button 
                onClick={() => updateStatusMutation.mutate('cancelled')}
                disabled={updateStatusMutation.isPending}
                className="h-12 font-semibold"
                variant="outline"
              >
                Cancel Concern
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Actions - Review & Complete when In Process */}
      {(profile?.role === 'staff' || profile?.role === 'branch_admin') && 
       complaint.status === 'in_process' && (
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Review & Complete</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Please provide your rating and review before marking as fixed or cancelled</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ReviewForm 
              complaintId={complaintId} 
              allowStatusChange={true}
              currentStatus={complaint.status}
            />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                onClick={() => updateStatusMutation.mutate('fixed')}
                disabled={updateStatusMutation.isPending}
                className="h-12 font-semibold"
                variant="default"
              >
                Mark as Fixed
              </Button>
              <Button 
                onClick={() => updateStatusMutation.mutate('cancelled')}
                disabled={updateStatusMutation.isPending}
                className="h-12 font-semibold"
                variant="outline"
              >
                Cancel Concern
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Actions Card */}
      {(profile?.role === 'main_admin' || profile?.role === 'branch_admin') && (
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Admin Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {complaint.anonymous && !complaint.identity_revealed && (
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                <Button
                  variant="destructive"
                  onClick={() => revealIdentityMutation.mutate()}
                  disabled={revealIdentityMutation.isPending}
                  className="w-full h-11 font-semibold"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Reveal Student Identity
                </Button>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  This action will make the student's identity visible to all staff handling this concern
                </p>
              </div>
            )}

            {profile?.role === 'main_admin' && (
              <Button
                variant="outline"
                onClick={() => startMainToBranchConversation.mutate()}
                disabled={startMainToBranchConversation.isPending}
                className="w-full h-12 font-semibold bg-primary/5 hover:bg-primary/10"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Start Conversation with Branch Admin
              </Button>
            )}

            {profile?.role === 'branch_admin' && (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => startBranchToStaffConversation.mutate('group')}
                  disabled={startBranchToStaffConversation.isPending}
                  className="w-full h-12 font-semibold bg-primary/5 hover:bg-primary/10"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Start Group Conversation with Staff
                </Button>
                {staff && staff.length > 0 && (
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/30">
                    <label className="text-sm font-semibold text-foreground">Assign to Staff Member</label>
                    <Select value={assignedStaffId || undefined} onValueChange={setAssignedStaffId}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {assignedStaffId && (
                      <Button
                        onClick={() => assignStaffMutation.mutate(assignedStaffId)}
                        disabled={assignStaffMutation.isPending}
                        className="w-full h-11 font-semibold"
                      >
                        Assign Selected Staff
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews Section - Always visible to students and trainers after resolution */}
      {(profile?.role === 'student' || (profile?.role === 'trainer' && profile?.handles_exclusive)) && 
       complaint.status === 'fixed' && (
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Leave Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewForm complaintId={complaintId} />
          </CardContent>
        </Card>
      )}

      {/* Show reviews if any exist */}
      {reviews && reviews.length > 0 && (
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewsList complaintId={complaintId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
