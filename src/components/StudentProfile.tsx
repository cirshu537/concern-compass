import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, AlertTriangle, Award, FileText, Ban } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StudentProfileProps {
  studentId: string;
  onBack: () => void;
}

export function StudentProfile({ studentId, onBack }: StudentProfileProps) {
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

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 capitalize">
                {profile.student_type} Student
              </p>
            </div>
            {profile.banned_from_raise && (
              <Badge variant="destructive" className="gap-1">
                <Ban className="w-3 h-3" />
                Banned from Raising
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Raised</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{complaints?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-status-fixed">{resolvedComplaints}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{openComplaints}</div>
          </CardContent>
        </Card>
      </div>

      {negativeEvents && negativeEvents.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Negative Reviews ({negativeEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {negativeEvents.map((event: any) => (
                <div key={event.id} className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{event.complaints?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs">Negative</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {complaints && complaints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Raised Complaints ({complaints.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {complaints.map((complaint: any) => (
                <div key={complaint.id} className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{complaint.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {complaint.category.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={
                      complaint.status === 'fixed' ? 'default' : 
                      complaint.status === 'in_process' ? 'secondary' : 'outline'
                    }>
                      {complaint.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
