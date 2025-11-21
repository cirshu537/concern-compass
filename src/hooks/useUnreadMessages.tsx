import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useUnreadMessages = () => {
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profile) return;

    const fetchUnreadCount = async () => {
      try {
        // Get all conversations for the user
        let conversationsQuery = supabase
          .from('conversations')
          .select('id, created_at');

        // Filter based on role
        if (profile.role === 'main_admin') {
          conversationsQuery = conversationsQuery.eq('type', 'main_to_branch');
        } else if (profile.role === 'branch_admin') {
          conversationsQuery = conversationsQuery.or(`type.eq.main_to_branch,type.eq.branch_to_staff_group,type.eq.branch_to_staff_direct`);
          conversationsQuery = conversationsQuery.eq('branch', profile.branch);
        } else if (profile.role === 'staff') {
          conversationsQuery = conversationsQuery.or(`type.eq.branch_to_staff_group,assigned_staff_id.eq.${profile.id}`);
          conversationsQuery = conversationsQuery.eq('branch', profile.branch);
        }

        const { data: conversations } = await conversationsQuery;
        if (!conversations) return;

        // Get user's last visit timestamp from localStorage
        const lastVisit = localStorage.getItem(`chat_last_visit_${profile.id}`);
        const lastVisitTime = lastVisit ? new Date(lastVisit) : new Date(0);

        // Count messages in these conversations that are newer than last visit and not from this user
        let totalUnread = 0;
        for (const conv of conversations) {
          const { count } = await supabase
            .from('conversation_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', profile.id)
            .gt('created_at', lastVisitTime.toISOString());
          
          if (count) totalUnread += count;
        }

        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel('unread_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages'
        },
        (payload) => {
          // Only increment if message is not from current user
          if (payload.new.sender_id !== profile.id) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  const markAsRead = () => {
    if (!profile) return;
    localStorage.setItem(`chat_last_visit_${profile.id}`, new Date().toISOString());
    setUnreadCount(0);
  };

  return { unreadCount, markAsRead };
};
