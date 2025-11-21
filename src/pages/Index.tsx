import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import brototypeLogo from '@/assets/logo-brototype.png';

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

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="text-center space-y-12 max-w-5xl mx-auto">
          {/* Logo */}
          <div className="w-full max-w-3xl mx-auto px-4 animate-fade-in">
            <img 
              src={brototypeLogo} 
              alt="Brototype Logo" 
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </div>

          {/* Main heading */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
              Student Concern System
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-3xl mx-auto font-light">
              We value your comfort more than anything
            </p>
          </div>

          {/* CTA section */}
          <div className="pt-8 space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {!user ? (
              <Button
                size="lg"
                onClick={() => setAuthModalOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-12 py-6 rounded-xl font-semibold shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105"
              >
                Login to Continue
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => {
                  if (profile?.role === 'student') navigate('/student/dashboard');
                  else if (profile?.role === 'trainer') navigate('/trainer/dashboard');
                  else if (profile?.role === 'staff') navigate('/staff/dashboard');
                  else if (profile?.role === 'branch_admin') navigate('/branch-admin/dashboard');
                  else if (profile?.role === 'main_admin') navigate('/main-admin/dashboard');
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-12 py-6 rounded-xl font-semibold shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105"
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default Index;