import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useUnreadMessages = () => {
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profile) return;

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

  const markAsRead = (conversationId?: string) => {
    if (!profile) return;
    
    if (conversationId) {
      // Mark specific conversation as read
      const conversationReads = JSON.parse(
        localStorage.getItem(`chat_reads_${profile.id}`) || '{}'
      );
      conversationReads[conversationId] = new Date().toISOString();
      localStorage.setItem(`chat_reads_${profile.id}`, JSON.stringify(conversationReads));
      
      // Re-fetch unread count to update the badge
      fetchUnreadCount();
    } else {
      // Mark all conversations as read (when clicking chat button)
      setUnreadCount(0);
    }
  };

  // Extract fetchUnreadCount to be reusable
  const fetchUnreadCount = async () => {
    if (!profile) return;

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
        conversationsQuery = conversationsQuery.eq('branch', profile.branch);
        conversationsQuery = conversationsQuery.or(`type.eq.branch_to_staff_group,type.eq.branch_to_staff_direct`);
      }

      const { data: conversations } = await conversationsQuery;
      if (!conversations) return;

      // Get per-conversation last read times
      const conversationReads = JSON.parse(
        localStorage.getItem(`chat_reads_${profile.id}`) || '{}'
      );

      // Count messages in these conversations that are newer than last read and not from this user
      let totalUnread = 0;
      for (const conv of conversations) {
        // Use per-conversation last read time, or conversation creation time if never read
        const lastReadTime = conversationReads[conv.id] || conv.created_at;
        
        const { count } = await supabase
          .from('conversation_messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', profile.id)
          .gt('created_at', lastReadTime);
        
        if (count) totalUnread += count;
      }

      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return { unreadCount, markAsRead };
};
