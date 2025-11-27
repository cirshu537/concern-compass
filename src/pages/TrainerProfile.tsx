import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardNav } from '@/components/DashboardNav';
import { ArrowLeft, User, Mail, MapPin, Award, AlertTriangle } from 'lucide-react';

export default function TrainerProfile() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['trainer-profile-stats', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      // Get total concerns handled by this trainer
      const { data: handledComplaints } = await supabase
        .from('complaints')
        .select('id, status')
        .or(`assigned_trainer_id.eq.${profile!.id},category.eq.trainer_related`)
        .eq('branch', profile!.branch || '');

      // Get negative events for this trainer
      const { data: negativeEvents } = await supabase
        .from('negative_events')
        .select('id, created_at')
        .eq('user_id', profile!.id);

      // Get weekly negative events
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weeklyNegatives = negativeEvents?.filter(
        event => new Date(event.created_at) >= oneWeekAgo
      ).length || 0;

      return {
        totalHandled: handledComplaints?.length || 0,
        lifetimeNegatives: negativeEvents?.length || 0,
        weeklyNegatives,
      };
    },
  });

  const handleBack = () => {
    if (profile?.role === 'trainer') {
      navigate('/trainer/dashboard');
    } else {
      navigate(-1);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <DashboardNav showNotifications showChat />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="text-base font-medium">{profile.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Email
                  </p>
                  <p className="text-base">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Branch
                  </p>
                  <p className="text-base font-medium">{profile.branch || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Role</p>
                  <p className="text-base font-medium capitalize">{profile.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">Total Credits</p>
                  <p className="text-3xl font-bold text-primary">{profile.credits}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                  <p className="text-sm text-muted-foreground mb-2">Concerns Handled</p>
                  <p className="text-3xl font-bold text-secondary">{stats?.totalHandled || 0}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Lifetime Negatives</p>
                  <p className="text-3xl font-bold">{stats?.lifetimeNegatives || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm text-muted-foreground">Negative Reviews This Week</p>
                    <p className="text-2xl font-bold mt-1">{stats?.weeklyNegatives || 0}</p>
                  </div>
                  {(stats?.weeklyNegatives || 0) >= 3 && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">High Alert</span>
                    </div>
                  )}
                </div>
                {(stats?.weeklyNegatives || 0) >= 3 && (
                  <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                    <p className="text-sm text-destructive font-medium mb-1">⚠️ High Alert Status</p>
                    <p className="text-sm text-muted-foreground">
                      You have received 3 or more negative reviews this week. Please report to your admin for guidance and support.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
