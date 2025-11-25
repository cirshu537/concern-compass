import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, AlertTriangle, Award, FileText, Ban, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ComplaintDetails } from '@/components/complaints/ComplaintDetails';
import { toast } from 'sonner';

interface StudentProfileProps {
  studentId: string;
  onBack: () => void;
}

export function StudentProfile({ studentId, onBack }: StudentProfileProps) {
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  
  const { data: profile } = useQuery({
    queryKey: ['student-profile', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: complaints } = useQuery({
    queryKey: ['student-complaints', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: negativeEvents } = useQuery({
    queryKey: ['student-negatives', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('negative_events')
        .select('*, complaints(*)')
        .eq('user_id', studentId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (!profile) return null;

  const resolvedComplaints = complaints?.filter(c => c.status === 'fixed').length || 0;
  const openComplaints = complaints?.filter(c => 
    c.status === 'logged' || c.status === 'noted' || c.status === 'in_process'
  ).length || 0;

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', studentId);

      if (error) throw error;

      toast.success('Profile deleted successfully');
      onBack();
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete profile');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/30 rounded-lg p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{profile.full_name}</h3>
              <p className="text-sm text-muted-foreground mt-1 capitalize">
                {profile.student_type} Student
              </p>
            </div>
            <div className="flex items-center gap-2">
              {profile.banned_from_raise && (
                <Badge variant="destructive" className="gap-1">
                  <Ban className="w-3 h-3" />
                  Banned from Raising
                </Badge>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Profile</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {profile.full_name}'s profile? This action cannot be undone and will remove all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{profile.email}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Branch</span>
              <span className="text-sm font-medium">{profile.branch}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Program</span>
              <span className="text-sm font-medium">{profile.program || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Credits</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <Award className="w-3 h-3 text-primary" />
                {profile.credits}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Student Type</span>
              <span className="text-sm font-medium capitalize">{profile.student_type}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Lifetime Negatives</span>
              <span className="text-sm font-medium">{profile.negative_count_lifetime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Raised</p>
          <p className="text-2xl font-bold text-primary">{complaints?.length || 0}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Resolved</p>
          <p className="text-2xl font-bold text-status-fixed">{resolvedComplaints}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Open</p>
          <p className="text-2xl font-bold text-secondary">{openComplaints}</p>
        </div>
      </div>

      {negativeEvents && negativeEvents.length > 0 && (
        <div className="border border-destructive/50 rounded-lg p-4 bg-destructive/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <h4 className="font-semibold text-sm">Negative Reviews ({negativeEvents.length})</h4>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {negativeEvents.map((event: any) => (
              <div 
                key={event.id} 
                className="p-2 rounded-lg bg-background/50 border border-destructive/20 hover:bg-background/80 cursor-pointer transition-colors"
                onClick={() => setSelectedComplaintId(event.complaints?.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium">{event.complaints?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-xs h-5">Negative</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {complaints && complaints.length > 0 && (
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4" />
            <h4 className="font-semibold text-sm">Raised Complaints ({complaints.length})</h4>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {complaints.map((complaint: any) => (
              <div 
                key={complaint.id} 
                className="p-2 rounded-lg bg-muted/50 border border-border hover:bg-muted cursor-pointer transition-colors"
                onClick={() => setSelectedComplaintId(complaint.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium">{complaint.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {complaint.category.replace(/_/g, ' ')} • {new Date(complaint.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="text-xs h-5" variant={
                    complaint.status === 'fixed' ? 'default' : 
                    complaint.status === 'in_process' ? 'secondary' : 'outline'
                  }>
                    {complaint.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!selectedComplaintId} onOpenChange={(open) => !open && setSelectedComplaintId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
          </DialogHeader>
          {selectedComplaintId && (
            <ComplaintDetails 
              complaintId={selectedComplaintId}
              onBack={() => setSelectedComplaintId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
