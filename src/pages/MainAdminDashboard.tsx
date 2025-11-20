import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComplaintsList } from '@/components/complaints/ComplaintsList';
import { ComplaintDetails } from '@/components/complaints/ComplaintDetails';
import { FileText, MessageSquare, Building, LogOut, ChevronLeft, Calendar } from 'lucide-react';
import { DashboardNav } from '@/components/DashboardNav';

export default function MainAdminDashboard() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [selectedView, setSelectedView] = useState<'dashboard' | 'complaints' | 'detail' | 'branch'>('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'weekly' | 'monthly' | 'yearly' | 'lifetime'>('today');

  // Redirect if not main admin
  useEffect(() => {
    if (profile && profile.role !== 'main_admin') {
      navigate('/');
    }
  }, [profile, navigate]);


  // Get date ranges
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return today.toISOString();
  };

  const getTimeRangeDate = () => {
    const now = new Date();
    switch (timeRange) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'monthly':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case 'yearly':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return '1970-01-01';
    }
  };

  // Today's stats
  const { data: stats } = useQuery({
    queryKey: ['main-admin-stats-today'],
    queryFn: async () => {
      const todayStart = getDateRange();
      
      const { data: complaints } = await supabase
        .from('complaints')
        .select('id, status, student_type, branch')
        .gte('created_at', todayStart);

      return {
        total: complaints?.length || 0,
        open: complaints?.filter(c => c.status === 'logged' || c.status === 'in_process').length || 0,
        fixed: complaints?.filter(c => c.status === 'fixed').length || 0,
        brocamp: complaints?.filter(c => c.student_type === 'brocamp').length || 0,
        online: complaints?.filter(c => c.branch === 'Online').length || 0,
      };
    },
  });

  // Branch-specific stats for selected branch
  const { data: branchRangeStats } = useQuery({
    queryKey: ['branch-range-stats', selectedBranch, timeRange],
    queryFn: async () => {
      if (!selectedBranch) return null;
      
      const rangeStart = getTimeRangeDate();
      
      const query = supabase
        .from('complaints')
        .select('id, status, created_at, title, category, branch, student_type')
        .eq('branch', selectedBranch);
      
      if (timeRange !== 'lifetime') {
        query.gte('created_at', rangeStart);
      }

      const { data: complaints } = await query.order('created_at', { ascending: false });

      return {
        total: complaints?.length || 0,
        logged: complaints?.filter(c => c.status === 'logged').length || 0,
        in_process: complaints?.filter(c => c.status === 'in_process').length || 0,
        fixed: complaints?.filter(c => c.status === 'fixed').length || 0,
        cancelled: complaints?.filter(c => c.status === 'cancelled').length || 0,
        rejected: complaints?.filter(c => c.status === 'rejected').length || 0,
        brocamp: complaints?.filter(c => c.student_type === 'brocamp').length || 0,
        online: selectedBranch === 'Online' ? complaints?.length || 0 : 0,
        exclusive: complaints?.filter(c => c.student_type === 'exclusive').length || 0,
        complaints: complaints || [],
      };
    },
    enabled: !!selectedBranch,
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
          onBack={() => {
            if (selectedBranch) {
              setSelectedView('branch');
            } else {
              setSelectedView('complaints');
            }
          }}
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

    if (selectedView === 'branch' && selectedBranch) {
      return (
        <div>
          <Button 
            variant="default" 
            onClick={() => {
              setSelectedView('dashboard');
              setSelectedBranch(null);
            }}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">{selectedBranch} Branch</h2>
            <p className="text-muted-foreground">Detailed tracking and analytics</p>
          </div>

          {/* Branch Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">All Complaints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{branchRangeStats?.total || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">BroCamp</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{branchRangeStats?.brocamp || 0}</div>
              </CardContent>
            </Card>

            {selectedBranch === 'Online' && (
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Online</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-500">{branchRangeStats?.online || 0}</div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Exclusive Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{branchRangeStats?.exclusive || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* All Concerns Tracking Section for Branch */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">All Concerns Tracking</h3>
              </div>
            </div>
            
            <Card className="bg-card border-border">
              <CardHeader>
                <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="yearly">Yearly</TabsTrigger>
                    <TabsTrigger value="lifetime">Lifetime</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                  <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="text-2xl font-bold text-primary">{branchRangeStats?.total || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total</p>
                  </div>
                  <div className="text-center p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-500">{branchRangeStats?.logged || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Logged</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                    <div className="text-2xl font-bold text-yellow-500">{branchRangeStats?.in_process || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">In Process</p>
                  </div>
                  <div className="text-center p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                    <div className="text-2xl font-bold text-green-500">{branchRangeStats?.fixed || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Fixed</p>
                  </div>
                  <div className="text-center p-4 bg-orange-500/5 rounded-lg border border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-500">{branchRangeStats?.cancelled || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Cancelled</p>
                  </div>
                  <div className="text-center p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                    <div className="text-2xl font-bold text-red-500">{branchRangeStats?.rejected || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Rejected</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {branchRangeStats?.complaints?.map((complaint: any) => (
                    <Card 
                      key={complaint.id} 
                      className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => {
                        setSelectedComplaintId(complaint.id);
                        setSelectedView('detail');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{complaint.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {complaint.category.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {(!branchRangeStats?.complaints || branchRangeStats.complaints.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No concerns found for this time range
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
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
              <p className="text-xs text-muted-foreground mt-1">Today</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Open</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats?.open || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Today</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-status-fixed/10 to-status-fixed/5 border-status-fixed/30">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Fixed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-fixed">{stats?.fixed || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Today</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">BroCamp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats?.brocamp || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Today</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Online</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{stats?.online || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Today</p>
            </CardContent>
          </Card>
        </div>


        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Branch Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branchStats?.map((branch) => (
              <Card 
                key={branch.name} 
                className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => {
                  setSelectedBranch(branch.name);
                  setSelectedView('branch');
                }}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
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
          <DashboardNav showNotifications showChat showProfile />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
