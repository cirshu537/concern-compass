import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComplaintsList } from '@/components/complaints/ComplaintsList';
import { ComplaintDetails } from '@/components/complaints/ComplaintDetails';
import { FileText, Award, LogOut, AlertTriangle, ChevronLeft } from 'lucide-react';
import { DashboardNav } from '@/components/DashboardNav';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, signOut } = useAuth();
  const [selectedView, setSelectedView] = useState<'dashboard' | 'all' | 'assigned' | 'detail'>('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [previousView, setPreviousView] = useState<'all' | 'assigned'>('assigned');

  // Check for URL parameters on mount
  useEffect(() => {
    const view = searchParams.get('view');
    const id = searchParams.get('id');
    
    if (view === 'detail' && id) {
      setSelectedView('detail');
      setSelectedComplaintId(id);
    } else if (view === 'all') {
      setSelectedView('all');
    } else if (view === 'assigned') {
      setSelectedView('assigned');
    }
  }, [searchParams]);

  const { data: stats } = useQuery({
    queryKey: ['staff-stats', profile?.branch, profile?.id],
    enabled: !!profile?.branch && !!profile?.id,
    queryFn: async () => {
      const { data: allComplaints } = await supabase
        .from('complaints')
        .select('id, status')
        .eq('branch', profile!.branch);

      const { data: assignedComplaints } = await supabase
        .from('complaints')
        .select('id, status')
        .eq('assigned_staff_id', profile!.id);

      return {
        total: allComplaints?.length || 0,
        assigned: assignedComplaints?.length || 0,
        open: assignedComplaints?.filter(c => c.status === 'logged' || c.status === 'in_process').length || 0,
        newComplaints: allComplaints?.filter(c => c.status === 'logged').length || 0,
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
          onBack={() => setSelectedView(previousView)}
        />
      );
    }

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
            filterByBranch={profile?.branch || ''}
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

    return (
      <>
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Staff Dashboard</h2>
          <p className="text-muted-foreground">Manage and resolve student concerns for {profile?.branch}</p>
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
                <CardTitle className="text-xl">All Complaints</CardTitle>
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
                View all concerns for your branch
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
                Complaints you're handling
              </p>
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
          <h1 className="text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
            Staff Dashboard
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
