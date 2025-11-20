import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Bell, BookOpen, User, LogOut, MessageSquarePlus } from 'lucide-react';

export default function StudentDashboard() {
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
            Student Portal
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group" onClick={() => navigate('/student/raise')}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <MessageSquarePlus className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Raise</CardTitle>
              <CardDescription>Submit a new concern</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Let us know about any issues or concerns you're facing
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-secondary/50 transition-all cursor-pointer group" onClick={() => navigate('/student/status')}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <Bell className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle className="text-xl">Status</CardTitle>
              <CardDescription>Track your concerns</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View the status and updates on all your submitted concerns
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-accent/50 transition-all cursor-pointer group" onClick={() => navigate('/student/docs')}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-xl">App Documentation</CardTitle>
              <CardDescription>Learn how it works</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Understand the system, rules, credits, and how to use the app
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group" onClick={() => navigate('/student/profile')}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <User className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Profile</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View your credits, stats, and personal information
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gradient-to-br from-card to-card/50 border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg text-muted-foreground">Total Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{profile?.credits || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-destructive/30">
            <CardHeader>
              <CardTitle className="text-lg text-muted-foreground">Negative Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-destructive">{profile?.negative_count_lifetime || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-secondary/30">
            <CardHeader>
              <CardTitle className="text-lg text-muted-foreground">Student Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary capitalize">
                {profile?.student_type === 'brocamp' ? 'BroCamp' : profile?.student_type === 'exclusive' ? 'Exclusive' : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {profile?.banned_from_raise && (
          <Card className="mt-8 bg-destructive/10 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Account Restriction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive/90">
                You have been temporarily restricted from raising new concerns due to repeated negative events. 
                Please contact administration for more information.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}