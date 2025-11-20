import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MessageSquare, Users, Building, AlertTriangle, LogOut, TrendingUp, Download } from 'lucide-react';

export default function MainAdminDashboard() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
            Main Admin Portal
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, <span className="text-primary font-semibold">{profile?.full_name}</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Global Overview</h2>
          <p className="text-muted-foreground">Monitor all branches and manage the entire system</p>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Concerns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">0</div>
              <p className="text-xs text-muted-foreground mt-1">All branches</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Open</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">0</div>
              <p className="text-xs text-muted-foreground mt-1">Pending</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-status-fixed/10 to-status-fixed/5 border-status-fixed/30">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Fixed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-fixed">0</div>
              <p className="text-xs text-muted-foreground mt-1">Resolved</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">BroCamp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">0</div>
              <p className="text-xs text-muted-foreground mt-1">Students</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">High Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">0</div>
              <p className="text-xs text-muted-foreground mt-1">Staff members</p>
            </CardContent>
          </Card>
        </div>

        {/* Branch Overview */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Branch Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Kochi', 'Calicut', 'Online'].map((branch) => (
              <Card key={branch} className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    {branch}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Open Concerns:</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg. Resolution:</span>
                    <span className="font-semibold">N/A</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">High Alert Staff:</span>
                    <span className="font-semibold text-destructive">0</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">All Concerns</CardTitle>
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
              <CardTitle className="text-xl">Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Start and manage chats with branch admins
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-accent/50 transition-all cursor-pointer group">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-xl">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage roles and branch assignments
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Global insights and performance metrics
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-secondary/50 transition-all cursor-pointer group">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <AlertTriangle className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle className="text-xl">High Alert Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View all staff requiring attention
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-accent/50 transition-all cursor-pointer group">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <MessageSquare className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-xl">Chat History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View all conversations across branches
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Export Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Download reports and concern data
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-secondary/50 transition-all cursor-pointer group">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle className="text-xl">Identity Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Reveal student identities when needed
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}