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
      {/* Enhanced animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        <div className="text-center space-y-16 max-w-6xl mx-auto">
          {/* Logo with enhanced effects */}
          <div className="w-full max-w-4xl mx-auto px-4 animate-fade-in">
            <div className="relative">
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-3xl scale-110 opacity-50"></div>
              <img 
                src={brototypeLogo} 
                alt="Brototype Logo" 
                className="relative w-full h-auto object-contain drop-shadow-[0_0_50px_rgba(0,255,255,0.3)]"
              />
            </div>
          </div>

          {/* Main heading with refined typography */}
          <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative inline-block">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
                Student Concern System
              </h1>
              {/* Subtle underline accent */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-full"></div>
            </div>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground/90 max-w-3xl mx-auto font-light leading-relaxed">
              We value your comfort more than anything
            </p>
          </div>

          {/* Enhanced CTA section */}
          <div className="pt-4 space-y-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {!user ? (
              <div className="relative inline-block group">
                {/* Button glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <Button
                  size="lg"
                  onClick={() => setAuthModalOpen(true)}
                  className="relative bg-primary text-primary-foreground hover:bg-primary/90 text-lg md:text-xl px-14 py-7 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]"
                >
                  Login to Continue
                </Button>
              </div>
            ) : (
              <div className="relative inline-block group">
                {/* Button glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <Button
                  size="lg"
                  onClick={() => {
                    if (profile?.role === 'student') navigate('/student/dashboard');
                    else if (profile?.role === 'trainer') navigate('/trainer/dashboard');
                    else if (profile?.role === 'staff') navigate('/staff/dashboard');
                    else if (profile?.role === 'branch_admin') navigate('/branch-admin/dashboard');
                    else if (profile?.role === 'main_admin') navigate('/main-admin/dashboard');
                  }}
                  className="relative bg-primary text-primary-foreground hover:bg-primary/90 text-lg md:text-xl px-14 py-7 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default Index;