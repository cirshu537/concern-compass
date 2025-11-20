import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComplaintsList } from '@/components/complaints/ComplaintsList';
import { ComplaintDetails } from '@/components/complaints/ComplaintDetails';
import { FileText, Award, LogOut, AlertTriangle } from 'lucide-react';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [selectedView, setSelectedView] = useState<'dashboard' | 'all' | 'assigned' | 'detail'>('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

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
          onBack={() => setSelectedView('assigned')}
        />
      );
    }

    if (selectedView === 'all') {
      return (
        <div>
          <Button 
            variant="ghost" 
            onClick={() => setSelectedView('dashboard')}
            className="mb-4"
          >
            Back to Dashboard
          </Button>
          <ComplaintsList
            filterByBranch={profile?.branch || ''}
            onComplaintClick={(complaint) => {
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
            variant="ghost" 
            onClick={() => setSelectedView('dashboard')}
            className="mb-4"
          >
            Back to Dashboard
          </Button>
          <ComplaintsList
            filterByAssigned={profile?.id || ''}
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
          <h2 className="text-3xl font-bold mb-2">Staff Dashboard</h2>
          <p className="text-muted-foreground">Manage and resolve student concerns for {profile?.branch}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => setSelectedView('all')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">All Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">{stats?.total || 0}</div>
              <p className="text-sm text-muted-foreground">
                View all concerns for your branch
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

          <Card className="bg-card border-border hover:border-accent/50 transition-all cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-xl">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent mb-2">{stats?.open || 0}</div>
              <p className="text-sm text-muted-foreground">
                Open assignments
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
            Staff Portal
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Hello, <span className="text-primary font-semibold">{profile?.full_name}</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
