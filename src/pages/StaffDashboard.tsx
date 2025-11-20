import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Award, LogOut, AlertTriangle } from 'lucide-react';

export default function StaffDashboard() {
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
          <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and process student concerns for your branch
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-secondary/50 transition-all cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle className="text-xl">Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View feedback and ratings from students
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-accent/50 transition-all cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-xl">Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View staff rankings and performance metrics
              </p>
            </CardContent>
          </Card>
        </div>

        {profile?.high_alert && (
          <Card className="mt-8 bg-destructive/10 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                High Alert Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive/90">
                You have received 3 or more negative events this week. Please review your performance 
                and speak with your branch admin for guidance on improvement.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}