import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComplaintsList } from '@/components/complaints/ComplaintsList';
import { ComplaintDetails } from '@/components/complaints/ComplaintDetails';
import { FileText, AlertTriangle, BarChart3, LogOut, ChevronLeft, BookOpen } from 'lucide-react';
import { DashboardNav } from '@/components/DashboardNav';

export default function BranchAdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, signOut } = useAuth();
  const [selectedView, setSelectedView] = useState<'dashboard' | 'complaints' | 'detail'>('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined);
  const [filterHighAlertStaff, setFilterHighAlertStaff] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterToday, setFilterToday] = useState<boolean>(false);

  // Redirect if not branch admin
  useEffect(() => {
    if (profile && profile.role !== 'branch_admin') {
      navigate('/');
    }
  }, [profile, navigate]);

  // Read URL parameters and set state
  useEffect(() => {
    const view = searchParams.get('view');
    const id = searchParams.get('id');
    
    if (view === 'detail' && id) {
      setSelectedView('detail');
      setSelectedComplaintId(id);
    } else if (view === 'complaints') {
      setSelectedView('complaints');
    }
  }, [searchParams]);

  const { data: stats } = useQuery({
    queryKey: ['branch-stats', profile?.branch],
    enabled: !!profile?.branch,
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: complaints } = await supabase
        .from('complaints')
        .select('id, status, category, created_at')
        .eq('branch', profile!.branch)
        .gte('created_at', today.toISOString());

      const { data: staff } = await supabase
        .from('profiles')
        .select('id, full_name, role, high_alert, negative_count_lifetime')
        .eq('branch', profile!.branch)
        .in('role', ['staff', 'trainer']);

      const { data: students } = await supabase
        .from('profiles')
        .select('id, full_name, email, student_type, banned_from_raise')
        .eq('branch', profile!.branch)
        .eq('role', 'student');

      // Calculate category breakdown
      const categoryBreakdown = complaints?.reduce((acc, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        total: complaints?.length || 0,
        open: complaints?.filter(c => c.status === 'logged' || c.status === 'noted' || c.status === 'in_process').length || 0,
        fixed: complaints?.filter(c => c.status === 'fixed').length || 0,
        highAlert: staff?.filter(s => s.high_alert).length || 0,
        allStaff: staff || [],
        allStudents: students || [],
        categoryBreakdown,
      };
    },
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const renderContent = () => {
    if (selectedView === 'detail' && selectedComplaintId) {
      return (
        <ComplaintDetails 
          complaintId={selectedComplaintId}
          onBack={() => setSelectedView('complaints')}
        />
      );
    }

    if (selectedView === 'complaints') {
      return (
        <div>
          <Button 
            variant="default" 
            onClick={() => {
              setSelectedView('dashboard');
              setFilterCategory(undefined);
              setFilterHighAlertStaff(false);
              setFilterStatus(undefined);
              setFilterToday(false);
            }}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <ComplaintsList
            filterByBranch={profile?.branch || ''}
            filterByCategory={filterCategory}
            filterByHighAlertStaff={filterHighAlertStaff}
            filterByStatus={filterStatus}
            filterByToday={filterToday}
            onComplaintClick={(complaint) => {
              setSelectedComplaintId(complaint.id);
              setSelectedView('detail');
            }}
          />
        </div>
      );
    }

    return (
      <>
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {profile?.full_name}</h2>
          <p className="text-muted-foreground">Manage your branch operations and team performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card 
            className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 cursor-pointer hover:border-primary/50 transition-all"
            onClick={() => {
              setFilterCategory(undefined);
              setFilterHighAlertStaff(false);
              setFilterStatus(undefined);
              setFilterToday(true);
              setSelectedView('complaints');
            }}
          >
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Concerns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Today</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30 cursor-pointer hover:border-secondary/50 transition-all"
            onClick={() => {
              setFilterCategory(undefined);
              setFilterHighAlertStaff(false);
              setFilterStatus('open');
              setFilterToday(true);
              setSelectedView('complaints');
            }}
          >
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Open Concerns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats?.open || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Today</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-status-fixed/10 to-status-fixed/5 border-status-fixed/30 cursor-pointer hover:border-status-fixed/50 transition-all"
            onClick={() => {
              setFilterCategory(undefined);
              setFilterHighAlertStaff(false);
              setFilterStatus('fixed');
              setFilterToday(true);
              setSelectedView('complaints');
            }}
          >
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-fixed">{stats?.fixed || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Today</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30 cursor-pointer hover:border-destructive/50 transition-all"
            onClick={() => {
              setFilterCategory(undefined);
              setFilterHighAlertStaff(true);
              setFilterStatus(undefined);
              setFilterToday(true);
              setSelectedView('complaints');
            }}
          >
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">High Alert Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats?.highAlert || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => setSelectedView('complaints')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">All Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View, assign and track all concerns for {profile?.branch}
              </p>
            </CardContent>
          </Card>

          <Card 
            className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">All Staff and Trainers</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.allStaff && stats.allStaff.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {stats.allStaff.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{member.full_name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{member.role}</span>
                      </div>
                      {member.high_alert && (
                        <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">High Alert</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No staff or trainers found</p>
              )}
              <p className="text-xs text-muted-foreground mt-4">All staff and trainers in {profile?.branch}</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-card border-border hover:border-secondary/50 transition-all cursor-pointer group"
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <BarChart3 className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle className="text-xl">All Students</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.allStudents && stats.allStudents.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {stats.allStudents.slice(0, 10).map((student: any) => (
                    <div key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{student.full_name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{student.student_type}</span>
                      </div>
                      {student.banned_from_raise && (
                        <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">Banned</span>
                      )}
                    </div>
                  ))}
                  {stats.allStudents.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{stats.allStudents.length - 10} more students
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No students found</p>
              )}
              <p className="text-xs text-muted-foreground mt-4">All students in {profile?.branch}</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
              Branch Admin Dashboard
            </h1>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/admin/docs')}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Documentation
            </Button>
          </div>
          <DashboardNav showNotifications showChat />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
