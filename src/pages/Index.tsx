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
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#1e3a8a] relative overflow-hidden">
      {/* Modern gradient background with subtle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-40 left-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Radial spotlight effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.08),transparent_60%)]"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center w-full max-w-6xl mx-auto">
          {/* Logo Section - Critical: Full visibility */}
          <div 
            className="mb-12 sm:mb-16 animate-fade-in opacity-0" 
            style={{ 
              animation: 'fade-in 1s ease-out 0.2s forwards' 
            }}
          >
            <div className="w-full max-w-5xl mx-auto px-4">
              <img 
                src={brototypeLogo} 
                alt="Brototype - Brother You Never Had" 
                className="w-full h-auto object-contain drop-shadow-[0_0_50px_rgba(6,182,212,0.15)]"
              />
            </div>
          </div>

          {/* Hero Headline */}
          <div 
            className="mb-6 animate-fade-in opacity-0" 
            style={{ 
              animation: 'fade-in 0.8s ease-out 0.5s forwards, slide-up 0.8s ease-out 0.5s forwards' 
            }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
              Student Concern System
            </h1>
          </div>

          {/* Subheadline */}
          <div 
            className="mb-10 sm:mb-12 animate-fade-in opacity-0" 
            style={{ 
              animation: 'fade-in 1s ease-out 0.8s forwards' 
            }}
          >
            <p className="text-lg sm:text-xl md:text-2xl text-blue-200/60 max-w-2xl mx-auto font-light leading-relaxed">
              We value your comfort more than anything
            </p>
          </div>

          {/* CTA Button */}
          <div 
            className="animate-fade-in opacity-0" 
            style={{ 
              animation: 'fade-in 1s ease-out 1.1s forwards' 
            }}
          >
            {!user ? (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="group relative inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold text-white transition-all duration-300 ease-out rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                {/* Gradient background */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 transition-all duration-300 group-hover:brightness-110"></span>
                
                {/* Glow effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300"></span>
                
                {/* Button content */}
                <span className="relative z-10 flex items-center gap-2">
                  Login to Continue
                  <svg 
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (profile?.role === 'student') navigate('/student/dashboard');
                  else if (profile?.role === 'trainer') navigate('/trainer/dashboard');
                  else if (profile?.role === 'staff') navigate('/staff/dashboard');
                  else if (profile?.role === 'branch_admin') navigate('/branch-admin/dashboard');
                  else if (profile?.role === 'main_admin') navigate('/main-admin/dashboard');
                }}
                className="group relative inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold text-white transition-all duration-300 ease-out rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                {/* Gradient background */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 transition-all duration-300 group-hover:brightness-110"></span>
                
                {/* Glow effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300"></span>
                
                {/* Button content */}
                <span className="relative z-10 flex items-center gap-2">
                  Go to Dashboard
                  <svg 
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default Index;