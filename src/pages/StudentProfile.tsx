import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Award, AlertCircle, User, MapPin, BookOpen, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function StudentProfile() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Fetch staff stats if user is staff
  const { data: staffStats } = useQuery({
    queryKey: ['staff-profile-stats', profile?.id],
    enabled: !!profile?.id && profile?.role === 'staff',
    queryFn: async () => {
      const { data: assignedComplaints } = await supabase
        .from('complaints')
        .select('id, status')
        .eq('assigned_staff_id', profile!.id);

      return {
        assigned: assignedComplaints?.length || 0,
        open: assignedComplaints?.filter(c => c.status === 'logged' || c.status === 'in_process').length || 0,
      };
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="default" onClick={() => {
            if (profile?.role === 'staff') navigate('/staff/dashboard');
            else if (profile?.role === 'trainer') navigate('/trainer/dashboard');
            else navigate('/student/dashboard');
          }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-muted-foreground">Your account information and statistics</p>
        </div>

        <div className="grid gap-6">
          {/* Personal Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Full Name</div>
                <div className="text-lg font-semibold">{profile?.full_name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Email</div>
                <div className="text-lg">{profile?.email}</div>
              </div>
              {profile?.role === 'student' && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Student Type</div>
                  <div className="text-lg font-semibold capitalize">
                    {profile?.student_type === 'brocamp' ? 'BroCamp Student' : 'Exclusive Member'}
                  </div>
                </div>
              )}
              {profile?.student_type === 'brocamp' && profile?.branch && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Branch</div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-lg font-semibold">{profile.branch}</span>
                  </div>
                </div>
              )}
              {profile?.program && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-lg">{profile.program}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          {profile?.role === 'staff' ? (
            // Staff Statistics
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg text-muted-foreground">Total Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">{profile?.credits || 0}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30">
                <CardHeader>
                  <CardTitle className="text-lg text-muted-foreground">Branch</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{profile?.branch || 'N/A'}</div>
                </CardContent>
              </Card>

              <Card className={`bg-gradient-to-br ${profile?.high_alert ? 'from-destructive/10 to-destructive/5 border-destructive/30' : 'from-card to-card/50 border-border'}`}>
                <CardHeader>
                  <CardTitle className="text-lg text-muted-foreground">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile?.high_alert ? (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-destructive" />
                      <span className="text-xl font-bold text-destructive">High Alert</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-status-fixed">Active</div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
                <CardHeader>
                  <CardTitle className="text-lg text-muted-foreground">Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-accent">{staffStats?.open || 0}</div>
                  <p className="text-sm text-muted-foreground mt-2">Open assignments</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Student Statistics
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Total Credits
                  </CardTitle>
                  <CardDescription>Earned through positive behavior</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-primary">{profile?.credits || 0}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    Negative Events
                  </CardTitle>
                  <CardDescription>Lifetime count</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-destructive">{profile?.negative_count_lifetime || 0}</div>
                  {(profile?.negative_count_lifetime || 0) >= 2 && (
                    <p className="text-sm text-destructive/80 mt-2">
                      Warning: Close to ban threshold (3 negatives)
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Account Status */}
          {profile?.banned_from_raise && (
            <Card className="bg-destructive/10 border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Account Restriction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-destructive/90">
                  Your account has been restricted from raising new concerns due to repeated negative events. 
                  This happens when you accumulate 3 or more negative events. Please contact administration 
                  for assistance in resolving this restriction.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}