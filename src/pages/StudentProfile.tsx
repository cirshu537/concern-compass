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

      // Get negative events from the past week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: weeklyNegatives } = await supabase
        .from('negative_events')
        .select('id, created_at')
        .eq('user_id', profile!.id)
        .gte('created_at', oneWeekAgo.toISOString());

      return {
        assigned: assignedComplaints?.length || 0,
        open: assignedComplaints?.filter(c => c.status === 'logged' || c.status === 'noted' || c.status === 'in_process').length || 0,
        weeklyNegatives: weeklyNegatives?.length || 0,
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
              <div className="grid md:grid-cols-2 gap-4">
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
                {profile?.branch && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Branch</div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-lg font-semibold">{profile.branch}</span>
                    </div>
                  </div>
                )}
                {profile?.program && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Program</div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-lg">{profile.program}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          {profile?.role === 'staff' ? (
            <>
              {/* Performance Metrics */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Performance Metrics</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground">Total Credits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        <div className="text-3xl font-bold text-primary">{profile?.credits || 0}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground">Branch</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-secondary" />
                        <div className="text-2xl font-bold text-secondary">{profile?.branch || 'N/A'}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground">Open Assignments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-accent">{staffStats?.open || 0}</div>
                      <p className="text-xs text-muted-foreground mt-1">Active complaints</p>
                    </CardContent>
                  </Card>

                  <Card className={`bg-gradient-to-br ${profile?.high_alert ? 'from-destructive/10 to-destructive/5 border-destructive' : 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/30'}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground">Account Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile?.high_alert ? (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          <span className="text-lg font-bold text-destructive">High Alert</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Active</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Weekly Performance & Alerts */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Weekly Performance & Alerts</h3>
                <Card className={`${(staffStats?.weeklyNegatives || 0) >= 3 ? 'border-destructive bg-destructive/5' : (staffStats?.weeklyNegatives || 0) >= 2 ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-border'}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className={`w-5 h-5 ${(staffStats?.weeklyNegatives || 0) >= 3 ? 'text-destructive' : (staffStats?.weeklyNegatives || 0) >= 2 ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                        Negative Reviews (Last 7 Days)
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        Lifetime Total: <span className="font-semibold text-foreground">{profile?.negative_count_lifetime || 0}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-5xl font-bold text-destructive">{staffStats?.weeklyNegatives || 0}</div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">Threshold</div>
                        <div className="text-2xl font-semibold">3</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            (staffStats?.weeklyNegatives || 0) >= 3 ? 'bg-destructive' : 
                            (staffStats?.weeklyNegatives || 0) >= 2 ? 'bg-yellow-500' : 
                            'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(((staffStats?.weeklyNegatives || 0) / 3) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Alert Messages */}
                    {(staffStats?.weeklyNegatives || 0) >= 3 ? (
                      <div className="bg-destructive/20 border-2 border-destructive rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-destructive font-bold mb-2 text-lg">URGENT ACTION REQUIRED</p>
                            <p className="text-destructive/90 mb-3">
                              You have received 3 or more negative reviews within the last 7 days.
                            </p>
                            <div className="bg-destructive text-destructive-foreground rounded-md p-3">
                              <p className="font-semibold">⚠️ You must report to your Branch Admin physically immediately.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (staffStats?.weeklyNegatives || 0) >= 2 ? (
                      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-yellow-700 dark:text-yellow-600 font-semibold mb-1">Warning</p>
                            <p className="text-yellow-700/90 dark:text-yellow-600/90 text-sm">
                              You are close to the threshold. One more negative review this week will require immediate reporting to Branch Admin.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          </div>
                          <div>
                            <p className="text-emerald-700 dark:text-emerald-400 font-semibold mb-1">Good Standing</p>
                            <p className="text-emerald-700/80 dark:text-emerald-400/80 text-sm">
                              Keep maintaining professional service quality to stay in good standing.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : profile?.role === 'trainer' ? (
            // Trainer Profile - No Credits or Negative Events
            <div>
              <h3 className="text-xl font-semibold mb-4">Profile Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-secondary" />
                      Branch
                    </CardTitle>
                    <CardDescription>Your assigned branch</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-secondary">{profile?.branch || 'N/A'}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Role
                    </CardTitle>
                    <CardDescription>Your position</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-primary capitalize">{profile?.role || 'Trainer'}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            // Student Statistics
            <div>
              <h3 className="text-xl font-semibold mb-4">Statistics</h3>
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