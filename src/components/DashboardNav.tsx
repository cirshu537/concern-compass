import { Bell, MessageSquare, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="flex items-center gap-2">
      {showNotifications && (
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {/* Uncomment when notifications are implemented */}
          {/* <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span> */}
        </Button>
      )}
      
      {showChat && (
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare className="h-5 w-5" />
          {/* Red dot for unread messages */}
          {/* <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span> */}
        </Button>
      )}
      
      {showProfile && (
        <Button variant="ghost" size="icon">
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
