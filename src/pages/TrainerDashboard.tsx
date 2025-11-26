import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ComplaintsList } from '@/components/complaints/ComplaintsList';
import { ComplaintDetails } from '@/components/complaints/ComplaintDetails';
import { FileText, BookOpen, LogOut, Users, ChevronLeft } from 'lucide-react';
import { DashboardNav } from '@/components/DashboardNav';

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, signOut } = useAuth();
  const [selectedView, setSelectedView] = useState<'dashboard' | 'all' | 'assigned' | 'complaints' | 'detail'>('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [previousView, setPreviousView] = useState<'all' | 'assigned' | 'complaints'>('all');

  // Read URL parameters and set state
  useEffect(() => {
    const view = searchParams.get('view');
    const id = searchParams.get('id');
    
    if (view === 'detail' && id) {
      setSelectedView('detail');
      setSelectedComplaintId(id);
    } else if (view === 'complaints') {
      setSelectedView('complaints');
    } else if (view === 'all') {
      setSelectedView('all');
    } else if (view === 'assigned') {
      setSelectedView('assigned');
    }
  }, [searchParams]);

  // Stats query for Exclusive Handlers
  const { data: stats } = useQuery({
    queryKey: ['exclusive-handler-stats', profile?.id, profile?.handles_exclusive],
    enabled: !!profile?.handles_exclusive && !!profile?.id,
    queryFn: async () => {
      const { data: allComplaints } = await supabase
        .from('complaints')
        .select('id, status, assigned_trainer_id')
        .eq('student_type', 'exclusive');

      const { data: assignedComplaints } = await supabase
        .from('complaints')
        .select('id, status')
        .eq('assigned_trainer_id', profile!.id);

      const assignedOpen = assignedComplaints?.filter(
        c => c.status === 'logged' || c.status === 'noted' || c.status === 'in_process'
      ).length || 0;

      const assignedResolved = assignedComplaints?.filter(
        c => c.status === 'fixed'
      ).length || 0;

      return {
        total: allComplaints?.length || 0,
        assigned: assignedComplaints?.length || 0,
        open: allComplaints?.filter(c => c.status === 'logged' || c.status === 'noted' || c.status === 'in_process').length || 0,
        resolved: allComplaints?.filter(c => c.status === 'fixed').length || 0,
        newComplaints: allComplaints?.filter(c => c.status === 'logged' && !c.assigned_trainer_id).length || 0,
        assignedOpen,
        assignedResolved
      };
    },
  });

  const { data: trainerComplaints } = useQuery({
    queryKey: ['trainer-complaints', profile?.branch, profile?.handles_exclusive],
    enabled: !!profile?.branch && !profile?.handles_exclusive,
    queryFn: async () => {
      // Fetch trainer-related complaints for this branch
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('category', 'trainer_related')
        .eq('branch', profile!.branch)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: notedComplaints } = useQuery({
    queryKey: ['noted-complaints', profile?.branch],
    enabled: !!profile?.branch && !profile?.handles_exclusive,
    queryFn: async () => {
      // Fetch trainer-related complaints that have been noted (replied to)
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('category', 'trainer_related')
        .eq('branch', profile!.branch)
        .eq('status', 'noted')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
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
          onBack={() => {
            const from = searchParams.get('from');
            const returnView = searchParams.get('returnView');
            
            if (from === 'chat') {
              navigate('/chat');
            } else if (returnView) {
              setSelectedView(returnView as any);
            } else {
              setSelectedView(previousView);
            }
          }}
        />
      );
    }

    // Exclusive Handler Views (Staff-like functionality)
    if (profile?.handles_exclusive) {
      if (selectedView === 'all') {
        return (
          <div>
            <Button 
              variant="default" 
              onClick={() => setSelectedView('dashboard')}
              className="mb-4"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <ComplaintsList
              filterByStudentType="exclusive"
              onComplaintClick={(complaint) => {
                setPreviousView('all');
                setSelectedComplaintId(complaint.id);
                setSelectedView('detail');
              }}
            />
          </div>
        );
      }

      if (selectedView === 'assigned') {
        return (
          <div>
            <Button 
              variant="default" 
              onClick={() => setSelectedView('dashboard')}
              className="mb-4"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <ComplaintsList
              filterByAssigned={profile?.id || ''}
              onComplaintClick={(complaint) => {
                setPreviousView('assigned');
                setSelectedComplaintId(complaint.id);
                setSelectedView('detail');
              }}
            />
          </div>
        );
      }
    }

    // Regular Trainer View (Simple list)
    if (selectedView === 'complaints') {
      const filteredComplaints = statusFilter === 'all' 
        ? trainerComplaints 
        : statusFilter === 'open'
        ? trainerComplaints?.filter(c => c.status === 'logged' || c.status === 'noted' || c.status === 'in_process')
        : trainerComplaints?.filter(c => c.status === 'fixed');

      return (
        <div>
          <Button 
            variant="default" 
            onClick={() => {
              setSelectedView('dashboard');
              setStatusFilter('all');
            }}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {statusFilter === 'all' ? 'All Concerns' : statusFilter === 'open' ? 'Open Concerns' : 'Resolved Concerns'}
            </h2>
            <p className="text-muted-foreground">
              {statusFilter === 'all' 
                ? 'Viewing all trainer-related concerns' 
                : statusFilter === 'open'
                ? 'Concerns requiring attention'
                : 'Successfully handled concerns'}
            </p>
          </div>
          {filteredComplaints && filteredComplaints.length > 0 ? (
            <div className="space-y-4">
              {filteredComplaints.map((complaint) => (
                <Card 
                  key={complaint.id}
                  className="cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => {
                    setPreviousView('complaints');
                    setSelectedComplaintId(complaint.id);
                    setSelectedView('detail');
                  }}
                >
                  <CardHeader>
                    <CardTitle>{complaint.title}</CardTitle>
                    <CardDescription>
                      {new Date(complaint.created_at).toLocaleDateString()} • Status: {complaint.status}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {complaint.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No concerns found</p>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    // Regular Trainer Handling View (Noted concerns)
    if (selectedView === 'assigned') {
      return (
        <div>
          <Button 
            variant="default" 
            onClick={() => setSelectedView('dashboard')}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Handling Concerns</h2>
            <p className="text-muted-foreground">
              Concerns you have replied to and are handling
            </p>
          </div>
          {notedComplaints && notedComplaints.length > 0 ? (
            <div className="space-y-4">
              {notedComplaints.map((complaint) => (
                <Card 
                  key={complaint.id}
                  className="cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => {
                    setPreviousView('assigned');
                    setSelectedComplaintId(complaint.id);
                    setSelectedView('detail');
                  }}
                >
                  <CardHeader>
                    <CardTitle>{complaint.title}</CardTitle>
                    <CardDescription>
                      {new Date(complaint.created_at).toLocaleDateString()} • Status: {complaint.status}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {complaint.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No handled concerns yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    // Dashboard view
    if (profile?.handles_exclusive) {
      // Exclusive Handler Dashboard (Staff-like)
      return (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Welcome, {profile?.full_name}
            </h2>
            <p className="text-muted-foreground">
              Manage all Exclusive Member concerns and provide premium support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer relative"
              onClick={() => setSelectedView('all')}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">All Exclusive Concerns</CardTitle>
                  {stats?.newComplaints ? (
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                      </span>
                    </div>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">{stats?.total || 0}</div>
                <p className="text-sm text-muted-foreground">
                  View all exclusive member concerns
                  {stats?.newComplaints ? ` (${stats.newComplaints} new)` : ''}
                </p>
              </CardContent>
            </Card>

            <Card 
              className="bg-card border-border hover:border-secondary/50 transition-all cursor-pointer"
              onClick={() => setSelectedView('assigned')}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">Assigned to Me</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary mb-2">{stats?.assigned || 0}</div>
                <p className="text-sm text-muted-foreground">
                  Concerns you're handling
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="bg-gradient-to-br from-card to-card/50 border-accent/30">
              <CardHeader>
                <CardTitle className="text-lg text-muted-foreground">Open Concerns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{stats?.open || 0}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Concerns requiring attention
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg text-muted-foreground">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats?.resolved || 0}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Successfully handled concerns
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      );
    } else {
      // Regular Trainer Dashboard
      return (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Welcome, {profile?.full_name}
            </h2>
            <p className="text-muted-foreground">
              Manage student concerns and track feedback
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group relative"
              onClick={() => setSelectedView('complaints')}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Student Concerns</CardTitle>
                    <CardDescription>Trainer-related issues</CardDescription>
                  </div>
                  {trainerComplaints?.filter(c => c.status === 'logged').length ? (
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                      </span>
                    </div>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">
                  {trainerComplaints?.length || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  View and respond to concerns about training quality
                  {trainerComplaints?.filter(c => c.status === 'logged').length ? ` (${trainerComplaints.filter(c => c.status === 'logged').length} new)` : ''}
                </p>
              </CardContent>
            </Card>

            <Card 
              className="bg-card border-border hover:border-secondary/50 transition-all cursor-pointer group relative"
              onClick={() => setSelectedView('assigned')}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <FileText className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Handling Concerns</CardTitle>
                  <CardDescription>Concerns you've replied to</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary mb-2">
                  {notedComplaints?.length || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  View concerns you are actively handling
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card className="bg-gradient-to-br from-card to-card/50 border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg text-muted-foreground">Branch</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {profile?.branch || 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className={`text-2xl font-bold ${profile?.handles_exclusive ? 'text-yellow-500' : 'bg-gradient-cyber bg-clip-text text-transparent'}`}>
              {profile?.handles_exclusive ? '⭐ Exclusive Members Handler' : 'Trainer Dashboard'}
            </h1>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/trainer/docs')}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Documentation
            </Button>
          </div>
          <DashboardNav showNotifications showChat showProfile />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
