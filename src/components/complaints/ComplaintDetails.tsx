import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Complaint, ComplaintStatus, Profile } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  User, MapPin, Calendar, FileText, MessageSquare, Tag, GraduationCap, 
  EyeOff, Users, Info, Shield, UserPlus, CheckCircle, Clock, Eye, ArrowLeft
} from 'lucide-react';
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
  const [assignedStaffId, setAssignedStaffId] = useState<string | null>(null);
  const [showAttachment, setShowAttachment] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`complaint-${complaintId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'complaints',
        filter: `id=eq.${complaintId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'complaint_reviews',
        filter: `complaint_id=eq.${complaintId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['reviews', complaintId] });
      })
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
    onError: () => toast.error('Failed to start conversation'),
  });

  const startBranchToStaffConversation = useMutation({
    mutationFn: async () => {
      const existing = existingConversations?.find(c => c.type === 'branch_to_staff_group');
      if (existing) {
        navigate(`/chat?conversation=${existing.id}`);
        return;
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          complaint_id: complaintId,
          type: 'branch_to_staff_group',
          branch: complaint!.branch,
          started_by_id: profile!.id
        })
        .select()
        .single();
      
      if (error) throw error;
      navigate(`/chat?conversation=${data.id}`);
    },
    onError: () => toast.error('Failed to start conversation'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: ComplaintStatus) => {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };
      
      if (status === 'in_process' && profile?.role === 'staff') {
        updateData.assigned_staff_id = profile.id;
      } else if (status === 'in_process' && profile?.role === 'trainer' && profile?.handles_exclusive) {
        updateData.assigned_trainer_id = profile.id;
      }
      
      if (status === 'fixed') {
        updateData.resolved_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', complaintId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Status updated successfully');
    },
    onError: () => toast.error('Failed to update status'),
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
      toast.success('Staff assigned successfully');
      setAssignedStaffId(null);
    },
    onError: () => toast.error('Failed to assign staff'),
  });

  const assignTrainerMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('complaints')
        .update({ 
          assigned_trainer_id: profile!.id,
          status: 'in_process',
          updated_at: new Date().toISOString()
        })
        .eq('id', complaintId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
      toast.success('You are now working on this concern');
    },
    onError: () => toast.error('Failed to assign concern'),
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
    onError: () => toast.error('Failed to reveal identity'),
  });

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

  const handleGoToConversation = () => {
    const convo = existingConversations?.find(c => !c.is_closed);
    if (convo) {
      navigate(`/chat?conversation=${convo.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">Concern not found</p>
      </div>
    );
  }

  const isExclusiveHandler = profile?.role === 'trainer' && profile?.handles_exclusive;
  const canReview = (
    (profile?.role === 'student' && complaint.status === 'fixed') ||
    (profile?.role === 'trainer' && profile?.handles_exclusive && complaint.status === 'fixed')
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={onBack || (() => navigate(-1))} 
        size="sm" 
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content (66%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Description Card */}
          <Card className="border shadow-lg">
            <CardHeader className="pb-4">
              <div className="space-y-4">
                <CardTitle className="text-3xl font-bold tracking-tight">{complaint.title}</CardTitle>
                
                <p className="text-lg leading-relaxed text-muted-foreground/90 whitespace-pre-wrap">
                  {complaint.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <StatusBadge status={complaint.status} />
                  {complaint.anonymous && (
                    <Badge variant="outline" className="text-xs">
                      <EyeOff className="w-3 h-3 mr-1" />
                      Anonymous
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs capitalize">
                    {complaint.student_type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            {complaint.attachment_url && (
              <CardContent className="pt-0 pb-4">
                <Button
                  variant="outline"
                  onClick={handleViewAttachment}
                  className="w-full sm:w-auto"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Attachment
                </Button>

                {showAttachment && attachmentUrl && (
                  <div className="border rounded-lg p-4 bg-muted/20 mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold">Attachment</span>
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
                      className="max-w-full rounded border"
                    />
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Reviews Timeline */}
          <Card className="border shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Reviews & Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {canReview && (
                <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
                  <ReviewForm complaintId={complaint.id} />
                </div>
              )}
              <ReviewsList complaintId={complaintId} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Metadata & Actions (33%) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Metadata Card */}
          <Card className="border shadow-lg">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Info className="w-4 h-4" />
                Concern Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Tag className="w-4 h-4 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="text-sm font-medium">
                      {complaint.category.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Branch</p>
                    <p className="text-sm font-medium">{complaint.branch}</p>
                  </div>
                </div>
                {complaint.program && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-4 h-4 mt-0.5 text-primary" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Program</p>
                      <p className="text-sm font-medium">{complaint.program}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">{format(new Date(complaint.created_at), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reporter Card */}
          {(profile?.role === 'main_admin' || profile?.role === 'branch_admin') && studentProfile && (
            <Card className="border shadow-lg">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Reporter Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Name</p>
                    <p className="text-sm font-medium">{studentProfile.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-sm">{studentProfile.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Credits</p>
                    <p className="text-sm font-medium">{studentProfile.credits}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/admin/student-profile/${complaint.student_id}`)}
                >
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Admin Actions Card */}
          {(profile?.role === 'main_admin' || profile?.role === 'branch_admin') && (
            <Card className="border shadow-lg">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {complaint.anonymous && !complaint.identity_revealed && (
                  <Button
                    variant="destructive"
                    onClick={() => revealIdentityMutation.mutate()}
                    disabled={revealIdentityMutation.isPending}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {revealIdentityMutation.isPending ? "Revealing..." : "Reveal Identity"}
                  </Button>
                )}
                
                {profile?.role === 'main_admin' && (
                  <Button
                    variant="outline"
                    onClick={() => startMainToBranchConversation.mutate()}
                    disabled={startMainToBranchConversation.isPending}
                    className="w-full"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {startMainToBranchConversation.isPending ? "Starting..." : "Contact Branch Admin"}
                  </Button>
                )}

                {profile?.role === 'branch_admin' && (
                  <>
                    <Button
                      variant="default"
                      onClick={() => startBranchToStaffConversation.mutate()}
                      disabled={startBranchToStaffConversation.isPending}
                      className="w-full bg-foreground text-background hover:bg-foreground/90"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {startBranchToStaffConversation.isPending ? "Starting..." : "Group Chat with Staff"}
                    </Button>

                    {staff && staff.length > 0 && (
                      <div className="space-y-2 pt-3 border-t">
                        <p className="text-xs font-semibold text-muted-foreground">Assign Staff Member</p>
                        <Select value={assignedStaffId || undefined} onValueChange={setAssignedStaffId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select staff member" />
                          </SelectTrigger>
                          <SelectContent>
                            {staff.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => assignedStaffId && assignStaffMutation.mutate(assignedStaffId)}
                          disabled={!assignedStaffId || assignStaffMutation.isPending}
                          className="w-full"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          {assignStaffMutation.isPending ? "Assigning..." : "Assign Staff"}
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {existingConversations && existingConversations.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleGoToConversation}
                    className="w-full"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Go to Conversation
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Staff/Trainer Actions */}
          {(profile?.role === 'staff' || isExclusiveHandler) && (
            <>
              {(complaint.status === 'logged' || complaint.status === 'noted') && (
                <Card className="border shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isExclusiveHandler && complaint.student_type === 'exclusive' && !complaint.assigned_trainer_id && (
                      <Button
                        onClick={() => assignTrainerMutation.mutate()}
                        disabled={assignTrainerMutation.isPending}
                        className="w-full"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        {assignTrainerMutation.isPending ? "Assigning..." : "Work on Concern"}
                      </Button>
                    )}
                    {profile?.role === 'staff' && (
                      <Button
                        onClick={() => updateStatusMutation.mutate('in_process')}
                        disabled={updateStatusMutation.isPending}
                        className="w-full"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        {updateStatusMutation.isPending ? "Processing..." : "Process Concern"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {complaint.status === 'in_process' && (
                <Card className="border shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Complete Concern
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ReviewForm complaintId={complaintId} allowStatusChange={true} currentStatus={complaint.status} />
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        onClick={() => updateStatusMutation.mutate('fixed')}
                        disabled={updateStatusMutation.isPending}
                        variant="default"
                      >
                        Mark Fixed
                      </Button>
                      <Button
                        onClick={() => updateStatusMutation.mutate('cancelled')}
                        disabled={updateStatusMutation.isPending}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
