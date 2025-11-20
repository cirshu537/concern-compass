import { MessageSquare, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '@/components/NotificationBell';

interface DashboardNavProps {
  showNotifications?: boolean;
  showChat?: boolean;
  showProfile?: boolean;
}

export const DashboardNav = ({ 
  showNotifications = false, 
  showChat = false, 
  showProfile = false 
}: DashboardNavProps) => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getChatPath = () => {
    return '/chat';
  };

  return (
    <div className="flex items-center gap-2">
      {showNotifications && <NotificationBell />}
      
      {showChat && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={() => navigate(getChatPath())}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      )}
      
  {showProfile && (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={() => navigate('/student/profile')}
    >
      <User className="h-5 w-5" />
    </Button>
  )}
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={handleLogout}
        className="text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
};
