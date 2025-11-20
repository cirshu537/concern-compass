import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      // Redirect based on role
      switch (profile.role) {
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'trainer':
          navigate('/trainer/dashboard');
          break;
        case 'staff':
          navigate('/staff/dashboard');
          break;
        case 'branch_admin':
          navigate('/branch-admin/dashboard');
          break;
        case 'main_admin':
          navigate('/main-admin/dashboard');
          break;
      }
    }
  }, [loading, user, profile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo placeholder */}
          <div className="w-32 h-32 mx-auto bg-gradient-cyber rounded-2xl flex items-center justify-center shadow-glow-cyan-lg">
            <span className="text-4xl font-bold text-background">BC</span>
          </div>

          {/* Main heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-cyber bg-clip-text text-transparent">
                Bro Camp
              </span>
            </h1>
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
              Student Concern System
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              We value your comfort more than anything
            </p>
          </div>

          {/* CTA section */}
          <div className="pt-8 space-y-4">
            {!user ? (
              <Button
                size="lg"
                onClick={() => setAuthModalOpen(true)}
                className="bg-gradient-cyber text-background hover:opacity-90 text-lg px-8 py-6 shadow-glow-cyan"
              >
                Login to Continue
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="text-lg text-foreground">
                  Hello, <span className="text-primary font-semibold">{profile?.full_name}</span>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={() => {
                      if (profile?.role === 'student') navigate('/student/dashboard');
                      else if (profile?.role === 'trainer') navigate('/trainer/dashboard');
                      else if (profile?.role === 'staff') navigate('/staff/dashboard');
                      else if (profile?.role === 'branch_admin') navigate('/branch-admin/dashboard');
                      else if (profile?.role === 'main_admin') navigate('/main-admin/dashboard');
                    }}
                    className="bg-gradient-cyber text-background hover:opacity-90"
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={signOut}
                    className="border-primary/50 text-primary hover:bg-primary/10"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
            <div className="p-6 rounded-xl bg-card/50 border border-border backdrop-blur-sm">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Anonymous Reporting</h3>
              <p className="text-sm text-muted-foreground">
                Raise concerns safely and anonymously without fear
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card/50 border border-border backdrop-blur-sm">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Quick Resolution</h3>
              <p className="text-sm text-muted-foreground">
                Track your concerns and get timely updates on progress
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card/50 border border-border backdrop-blur-sm">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Credit System</h3>
              <p className="text-sm text-muted-foreground">
                Earn credits for positive behavior and helpful reporting
              </p>
            </div>
          </div>
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default Index;