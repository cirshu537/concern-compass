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

          {complaint.attachment_url && (
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAttachment}
              >
                <Paperclip className="w-4 h-4 mr-2" />
                View Attachment
              </Button>
              
              {showAttachment && attachmentUrl && (
                <div className="mt-4 border border-border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Attachment</span>
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
                    className="max-w-full rounded"
                  />
                </div>
              )}
            </div>
          )}

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

          {/* Student Info for Admins */}
          {(profile?.role === 'main_admin' || profile?.role === 'branch_admin') && studentProfile && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Student Information</h3>
                  <p className="text-sm text-muted-foreground">
                    {studentProfile.full_name} • {studentProfile.email}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/student-profile/${studentProfile.id}`);
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
              </div>
            </div>
          )}

          {/* Exclusive Handler Actions - Working on Concern Button when Logged or Noted */}
          {isExclusiveHandler && complaint.student_type === 'exclusive' && (complaint.status === 'logged' || complaint.status === 'noted') && !complaint.assigned_trainer_id && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Take Action</h3>
              <Button 
                onClick={() => assignTrainerMutation.mutate()}
                disabled={assignTrainerMutation.isPending}
                className="w-full"
              >
                Working on Concern
              </Button>
            </div>
          )}

          {/* Staff Actions - Process Button when Logged or Noted */}
          {(profile?.role === 'staff' || profile?.role === 'branch_admin') && (complaint.status === 'logged' || complaint.status === 'noted') && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Take Action</h3>
              <Button 
                onClick={() => updateStatusMutation.mutate('in_process')}
                disabled={updateStatusMutation.isPending}
                className="w-full"
              >
                Process Concern
              </Button>
            </div>
          )}

          {/* Exclusive Handler Actions - Review & Complete when In Process */}
          {isExclusiveHandler && 
           complaint.student_type === 'exclusive' && 
           complaint.status === 'in_process' && 
           complaint.assigned_trainer_id === profile.id && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Review & Complete</h3>
              <p className="text-sm text-muted-foreground">Please provide your rating and review before marking as fixed or cancelled</p>
              <ReviewForm 
                complaintId={complaintId} 
                onReviewSubmitted={() => {
                  queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
                  queryClient.invalidateQueries({ queryKey: ['reviews', complaintId] });
                }}
                allowStatusChange={true}
                currentStatus={complaint.status}
              />
            </div>
          )}

          {/* Staff Actions - Review & Complete when In Process */}
          {(profile?.role === 'staff' || profile?.role === 'branch_admin') && 
           complaint.status === 'in_process' && 
           (complaint.assigned_staff_id === profile.id || profile.role === 'branch_admin') && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Review & Complete</h3>
              <p className="text-sm text-muted-foreground">Please provide your rating and review before marking as fixed or cancelled</p>
              <ReviewForm 
                complaintId={complaintId} 
                onReviewSubmitted={() => {
                  queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
                  queryClient.invalidateQueries({ queryKey: ['reviews', complaintId] });
                }}
                allowStatusChange={true}
                currentStatus={complaint.status}
              />
            </div>
          )}

          {/* Admin Actions */}
          {(profile?.role === 'branch_admin' || profile?.role === 'main_admin') && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Admin Actions</h3>
              
              {staff && (complaint.status === 'logged' || complaint.status === 'noted') && (
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

              {/* Conversation Buttons */}
              {profile?.role === 'main_admin' && (
                <div>
                  <Button 
                    className="w-full"
                    onClick={() => startMainToBranchConversation.mutate()}
                    disabled={startMainToBranchConversation.isPending}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Conversation with Branch Admin
                  </Button>
                </div>
              )}

              {profile?.role === 'branch_admin' && (
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => startBranchToStaffConversation.mutate('group')}
                    disabled={startBranchToStaffConversation.isPending}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Start Group Conversation with Staff
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews Section - Only show if there are reviews OR concern is not trainer-related in logged status */}
      {(!profile?.role || 
        profile.role !== 'trainer' || 
        complaint.category !== 'trainer_related' || 
        complaint.status !== 'logged' ||
        (reviews && reviews.length > 0)) && (
        <ReviewsList complaintId={complaintId} />
      )}

      {/* Student Review - Only for Non-Trainer Concerns (After Resolution) */}
      {profile?.role === 'student' && 
       complaint.student_id === profile.id && 
       complaint.category !== 'trainer_related' &&
       (complaint.status === 'fixed' || complaint.status === 'cancelled') &&
       !reviews?.some(r => r.reviewer_role === 'student') && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Provide Your Review (Optional)</CardTitle>
            <p className="text-sm text-muted-foreground">
              You can share your feedback about how this concern was handled
            </p>
          </CardHeader>
          <CardContent>
            <ReviewForm 
              complaintId={complaintId}
              onReviewSubmitted={() => {
                queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
                queryClient.invalidateQueries({ queryKey: ['reviews', complaintId] });
              }}
              allowStatusChange={false}
              currentStatus={complaint.status}
            />
          </CardContent>
        </Card>
      )}

      {/* Trainer Can Review Trainer-Related Concerns */}
      {profile?.role === 'trainer' && 
       complaint.category === 'trainer_related' &&
       !reviews?.some(r => r.reviewer_role === 'trainer' && r.reviewer_id === profile.id) && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Respond to Student Feedback</CardTitle>
            <p className="text-sm text-muted-foreground">
              Share your thoughts on this feedback (student identity is protected)
            </p>
          </CardHeader>
          <CardContent>
            <ReviewForm 
              complaintId={complaintId}
              onReviewSubmitted={() => {
                queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
                queryClient.invalidateQueries({ queryKey: ['reviews', complaintId] });
              }}
              allowStatusChange={false}
              currentStatus={complaint.status}
              isTrainerReply={true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
