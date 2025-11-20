import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComplaintsList } from '@/components/complaints/ComplaintsList';
import { ComplaintDetails } from '@/components/complaints/ComplaintDetails';
import { FileText, MessageSquare, Building, LogOut, ChevronLeft } from 'lucide-react';
import { DashboardNav } from '@/components/DashboardNav';

export default function MainAdminDashboard() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [selectedView, setSelectedView] = useState<'dashboard' | 'complaints' | 'detail'>('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['main-admin-stats'],
    queryFn: async () => {
      const { data: complaints } = await supabase
        .from('complaints')
        .select('id, status, student_type');

      const { data: staff } = await supabase
        .from('profiles')
        .select('id, high_alert')
        .eq('role', 'staff');

      return {
        total: complaints?.length || 0,
        open: complaints?.filter(c => c.status === 'logged' || c.status === 'in_process').length || 0,
        fixed: complaints?.filter(c => c.status === 'fixed').length || 0,
        brocamp: complaints?.filter(c => c.student_type === 'brocamp').length || 0,
        highAlert: staff?.filter(s => s.high_alert).length || 0,
      };
    },
  });

  const { data: branchStats } = useQuery({
    queryKey: ['branch-breakdown'],
    queryFn: async () => {
      const { data: complaints } = await supabase
        .from('complaints')
        .select('branch');

      const branches = ['Kochi', 'Calicut - Kakkanchery', 'Trivandrum'];
      return branches.map(branch => ({
        name: branch,
        count: complaints?.filter(c => c.branch === branch).length || 0,
      }));
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
            onClick={() => setSelectedView('dashboard')}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <ComplaintsList
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
          <h2 className="text-3xl font-bold mb-2">Global Overview</h2>
          <p className="text-muted-foreground">Monitor all branches and manage the entire system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Concerns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">All branches</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Open</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats?.open || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Pending</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-status-fixed/10 to-status-fixed/5 border-status-fixed/30">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Fixed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-fixed">{stats?.fixed || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Resolved</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">BroCamp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats?.brocamp || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Students</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">High Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats?.highAlert || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Staff members</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Branch Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branchStats?.map((branch) => (
              <Card key={branch.name} className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{branch.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{branch.count}</div>
                  <p className="text-sm text-muted-foreground">Total complaints</p>
                </CardContent>
              </Card>
            ))}
          </div>
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
                View and manage all concerns across branches
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-secondary/50 transition-all cursor-pointer group">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <MessageSquare className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle className="text-xl">Branch Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Chat with branch administrators
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-accent/50 transition-all cursor-pointer group">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Building className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-xl">System Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure system settings and policies
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
            Main Admin Dashboard
          </h1>
          <DashboardNav showChat showProfile />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
