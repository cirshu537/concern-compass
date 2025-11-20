import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Bell, BookOpen, MessageSquarePlus, ArrowLeft } from 'lucide-react';
import { DashboardNav } from '@/components/DashboardNav';

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
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
              Student Portal
            </h1>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/student/docs')}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Documentation
            </Button>
          </div>
          <DashboardNav showProfile />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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