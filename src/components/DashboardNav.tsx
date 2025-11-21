import { MessageSquare, User, LogOut, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '@/components/NotificationBell';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

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
  const { unreadCount, markAsRead } = useUnreadMessages();

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
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => navigate('/student/docs')}
        title="Documentation"
      >
        <BookOpen className="h-5 w-5" />
      </Button>
      
      {showChat && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={() => {
            markAsRead();
            navigate(getChatPath());
          }}
        >
          <MessageSquare className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </span>
          )}
        </Button>
      )}
      
  {showProfile && (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={() => {
        // Navigate based on role
        switch (profile?.role) {
          case 'student':
            navigate('/student/profile');
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
          default:
            navigate('/student/profile');
        }
      }}
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
