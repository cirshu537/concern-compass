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
  const [selectedView, setSelectedView] = useState<'dashboard' | 'complaints' | 'detail'>('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');

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

  const { data: trainerComplaints } = useQuery({
    queryKey: ['trainer-complaints', profile?.branch, profile?.handles_exclusive],
    enabled: !!profile?.branch,
    queryFn: async () => {
      if (profile?.handles_exclusive) {
        // Fetch all exclusive member complaints
        const { data, error } = await supabase
          .from('complaints')
          .select('*')
          .eq('student_type', 'exclusive')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      } else {
        // Fetch trainer-related complaints for this branch
        const { data, error } = await supabase
          .from('complaints')
          .select('*')
          .eq('category', 'trainer_related')
          .eq('branch', profile!.branch)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      }
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
      const filteredComplaints = statusFilter === 'all' 
        ? trainerComplaints 
        : statusFilter === 'open'
        ? trainerComplaints?.filter(c => c.status === 'logged' || c.status === 'in_process')
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
                ? `Viewing all ${profile?.handles_exclusive ? 'exclusive member' : 'trainer-related'} concerns` 
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

    return (
      <>
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome, {profile?.full_name}
          </h2>
          <p className="text-muted-foreground">
            {profile?.handles_exclusive 
              ? 'Manage all Exclusive Member concerns and provide premium support'
              : 'Manage student concerns and track feedback'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => setSelectedView('complaints')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">
                {profile?.handles_exclusive ? 'Exclusive Member Concerns' : 'Student Concerns'}
              </CardTitle>
              <CardDescription>
                {profile?.handles_exclusive ? 'All exclusive member issues' : 'Trainer-related issues'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">
                {trainerComplaints?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                {profile?.handles_exclusive 
                  ? 'View and respond to all exclusive member concerns'
                  : 'View and respond to concerns about training quality'}
              </p>
            </CardContent>
          </Card>

          {profile?.handles_exclusive && (
            <Card 
              className="bg-card border-border hover:border-accent/50 transition-all cursor-pointer group"
              onClick={() => {
                setStatusFilter('open');
                setSelectedView('complaints');
              }}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Open Concerns</CardTitle>
                <CardDescription>Pending resolution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent mb-2">
                  {trainerComplaints?.filter(c => c.status === 'logged' || c.status === 'in_process').length || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Concerns requiring attention
                </p>
              </CardContent>
            </Card>
          )}

          {profile?.handles_exclusive && (
            <Card 
              className="bg-card border-border hover:border-secondary/50 transition-all cursor-pointer group"
              onClick={() => {
                setStatusFilter('resolved');
                setSelectedView('complaints');
              }}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <FileText className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">Resolved</CardTitle>
                <CardDescription>Successfully handled</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary mb-2">
                  {trainerComplaints?.filter(c => c.status === 'fixed').length || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Fixed exclusive member concerns
                </p>
              </CardContent>
            </Card>
          )}

          {!profile?.handles_exclusive && (
            <Card 
              className="bg-card border-border hover:border-secondary/50 transition-all cursor-pointer group"
              onClick={() => navigate('/chat')}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <FileText className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">My Concerns</CardTitle>
                <CardDescription>Concerns you've raised</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track concerns you've submitted to administration
                </p>
              </CardContent>
            </Card>
          )}

          {!profile?.handles_exclusive && (
            <Card 
              className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => navigate('/student/docs')}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Documentation</CardTitle>
                <CardDescription>System guide</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Learn about the concern system and your role
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8">
          <Card className="bg-gradient-to-br from-card to-card/50 border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg text-muted-foreground">
                {profile?.handles_exclusive ? 'Handler Type' : 'Branch'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {profile?.handles_exclusive ? '⭐ Exclusive Members Handler' : profile?.branch || 'N/A'}
              </div>
              {profile?.handles_exclusive && (
                <p className="text-sm text-muted-foreground mt-2">
                  Premium support for all exclusive member concerns
                </p>
              )}
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
          <h1 className={`text-2xl font-bold ${profile?.handles_exclusive ? 'text-yellow-500' : 'bg-gradient-cyber bg-clip-text text-transparent'}`}>
            {profile?.handles_exclusive ? '⭐ Exclusive Members Handler' : 'Trainer Dashboard'}
          </h1>
          <DashboardNav showNotifications showChat showProfile />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
