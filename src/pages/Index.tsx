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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#16213e] to-[#1a1a2e] relative overflow-hidden">
      {/* Sophisticated animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient orbs */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.05),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        <div className="text-center space-y-12 max-w-5xl mx-auto w-full">
          {/* Logo */}
          <div className="animate-fade-in">
            <div className="w-full max-w-3xl mx-auto mb-16">
              <img 
                src={brototypeLogo} 
                alt="Brototype Logo" 
                className="w-full h-auto object-contain filter drop-shadow-[0_0_40px_rgba(0,255,255,0.2)]"
              />
            </div>
          </div>

          {/* Main content */}
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-white leading-[1.1]">
              Student Concern System
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
              We value your comfort more than anything
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-8 animate-fade-in">
            {!user ? (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="group relative inline-flex items-center justify-center px-12 py-5 text-lg font-semibold text-white transition-all duration-300 ease-out rounded-2xl overflow-hidden"
              >
                {/* Animated gradient background */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-transform duration-300 group-hover:scale-105"></span>
                
                {/* Glow effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></span>
                
                {/* Button text */}
                <span className="relative z-10 flex items-center gap-2">
                  Login to Continue
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
                className="group relative inline-flex items-center justify-center px-12 py-5 text-lg font-semibold text-white transition-all duration-300 ease-out rounded-2xl overflow-hidden"
              >
                {/* Animated gradient background */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-transform duration-300 group-hover:scale-105"></span>
                
                {/* Glow effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></span>
                
                {/* Button text */}
                <span className="relative z-10 flex items-center gap-2">
                  Go to Dashboard
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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