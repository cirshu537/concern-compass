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
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#312e81] relative overflow-hidden">
      {/* Sophisticated background with subtle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle animated gradient orbs */}
        <div className="absolute -top-48 -left-48 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 -right-32 w-[400px] h-[400px] bg-purple-600/6 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-48 left-1/3 w-[550px] h-[550px] bg-blue-600/7 rounded-full blur-[120px]"></div>
        
        {/* Professional spotlight effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(6,182,212,0.06),transparent_50%)]"></div>
        
        {/* Enhanced radial gradient overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,41,59,0.3),transparent_70%)]"></div>
        
        {/* Minimal grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px] opacity-40"></div>
        
        {/* Faint dot pattern for texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <div className="text-center w-full max-w-7xl mx-auto">
          {/* Professional Logo Section */}
          <div className="mt-16 mb-24 animate-fade-in">
            <div className="w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl mx-auto px-4">
              <img 
                src={brototypeLogo} 
                alt="Brototype - Brother You Never Had" 
                className="w-full h-auto object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.12)]"
              />
            </div>
          </div>

          {/* Refined Hero Headline */}
          <div className="mb-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-white leading-tight max-w-4xl mx-auto">
              Student Concerns
            </h1>
          </div>

          {/* Elegant Subheadline */}
          <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p className="text-base sm:text-lg md:text-xl text-gray-300/70 max-w-2xl mx-auto font-normal leading-relaxed">
              We value your comfort more than anything
            </p>
          </div>

          {/* Professional CTA Button */}
          <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {!user ? (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white transition-all duration-300 ease-out rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Sophisticated gradient */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 transition-all duration-300 group-hover:brightness-110"></span>
                
                {/* Subtle glow */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></span>
                
                {/* Button text */}
                <span className="relative z-10 flex items-center gap-2">
                  Login to Continue
                  <svg 
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
                className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white transition-all duration-300 ease-out rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Sophisticated gradient */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 transition-all duration-300 group-hover:brightness-110"></span>
                
                {/* Subtle glow */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></span>
                
                {/* Button text */}
                <span className="relative z-10 flex items-center gap-2">
                  Go to Dashboard
                  <svg 
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            )}
          </div>

          {/* Demo Accounts Section - Removed from here */}
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default Index;