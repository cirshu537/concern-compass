import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { DashboardNav } from '@/components/DashboardNav';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { ComplaintDetails } from '@/components/complaints/ComplaintDetails';

interface Conversation {
  id: string;
  complaint_id: string;
  type: string;
  branch: string | null;
  is_closed: boolean;
  created_at: string;
  complaint_title?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender_name?: string;
  sender_role?: string;
  pending?: boolean;
  failed?: boolean;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const conversationIdParam = searchParams.get('conversation');
  const { markAsRead } = useUnreadMessages();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversationIdParam);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentComplaint, setCurrentComplaint] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Removed global markAsRead on page load - now tracked per conversation

  // Fetch unread counts for all conversations
  const fetchUnreadCounts = async (convs: Conversation[]) => {
    if (!profile) return convs;

    // Use the same storage format as useUnreadMessages
    const conversationReads = JSON.parse(
      localStorage.getItem(`chat_reads_${profile.id}`) || '{}'
    );

    const conversationsWithUnread = await Promise.all(
      convs.map(async (conv) => {
        // Use per-conversation last read time, or conversation creation time if never read
        const lastReadTime = conversationReads[conv.id] || conv.created_at;

        const { count } = await supabase
          .from('conversation_messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', profile.id)
          .gt('created_at', lastReadTime);

        return { ...conv, unread_count: count || 0 };
      })
    );

    return conversationsWithUnread;
  };

  useEffect(() => {
    if (profile) {
      fetchConversations();
    }
  }, [profile]);

  // Subscribe to new messages across all conversations for unread counts
  useEffect(() => {
    if (!profile || conversations.length === 0) return;

    const channels = conversations.map(conv => {
      return supabase
        .channel(`unread_updates:${conv.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'conversation_messages',
            filter: `conversation_id=eq.${conv.id}`
          },
          (payload) => {
            // Only increment unread if message is not from current user and conversation is not selected
            if (payload.new.sender_id !== profile.id && conv.id !== selectedConversation) {
              setConversations(prev =>
                prev.map(c =>
                  c.id === conv.id
                    ? { ...c, unread_count: (c.unread_count || 0) + 1 }
                    : c
                )
              );
            }
          }
        )
        .subscribe();
    });

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [profile, conversations.length, selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      subscribeToMessages(selectedConversation);
      markConversationAsRead(selectedConversation);
      markAsRead(selectedConversation); // Also update global unread count
      fetchComplaintDetails(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchComplaintDetails = async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation?.complaint_id) {
      const { data: complaint } = await supabase
        .from('complaints')
        .select('*, profiles!complaints_student_id_fkey(full_name)')
        .eq('id', conversation.complaint_id)
        .single();
      
      setCurrentComplaint(complaint);
    }
  };

  const markConversationAsRead = (conversationId: string) => {
    if (!profile) return;
    
    // Use the same storage format as useUnreadMessages
    const conversationReads = JSON.parse(
      localStorage.getItem(`chat_reads_${profile.id}`) || '{}'
    );
    conversationReads[conversationId] = new Date().toISOString();
    localStorage.setItem(`chat_reads_${profile.id}`, JSON.stringify(conversationReads));
    
    // Update unread count for this conversation
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      )
    );
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!profile) return;

    try {
      let query = supabase
        .from('conversations')
        .select(`
          *,
          complaints!inner(title, assigned_staff_id)
        `)
        .order('created_at', { ascending: false });

      // Filter based on role
      if (profile.role === 'main_admin') {
        query = query.eq('type', 'main_to_branch');
      } else if (profile.role === 'branch_admin') {
        query = query.or(`type.eq.main_to_branch,type.eq.branch_to_staff_group,type.eq.branch_to_staff_direct`);
        query = query.eq('branch', profile.branch);
      } else if (profile.role === 'staff') {
        query = query.eq('branch', profile.branch);
        query = query.or(`type.eq.branch_to_staff_group,type.eq.branch_to_staff_direct`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const conversationsWithTitle = data.map(conv => ({
        ...conv,
        complaint_title: (conv as any).complaints?.title || 'Untitled'
      }));

      const conversationsWithUnread = await fetchUnreadCounts(conversationsWithTitle);
      setConversations(conversationsWithUnread);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .select(`
          *,
          profiles!inner(full_name, role)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const messagesWithSender = data.map(msg => ({
        ...msg,
        sender_name: (msg as any).profiles?.full_name || 'Unknown',
        sender_role: (msg as any).profiles?.role || 'student'
      }));

      setMessages(messagesWithSender);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          // Skip if message is from current user (already added optimistically)
          if (payload.new.sender_id === profile?.id) {
            return;
          }
          
          // Fetch sender name and role and add message from other users
          const { data: senderData } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', payload.new.sender_id)
            .single();
          
          const newMessage: Message = {
            id: payload.new.id,
            sender_id: payload.new.sender_id,
            body: payload.new.body,
            created_at: payload.new.created_at,
            sender_name: senderData?.full_name || 'Unknown',
            sender_role: senderData?.role || 'student'
          };
          
          setMessages(prev => {
            // Check if message already exists
            if (prev.some(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });

          // Update unread count for the conversation if it's not the selected one
          if (conversationId !== selectedConversation) {
            setConversations(prev =>
              prev.map(conv =>
                conv.id === conversationId
                  ? { ...conv, unread_count: (conv.unread_count || 0) + 1 }
                  : conv
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !profile) return;

    const tempId = `temp-${Date.now()}`;
    const messageText = messageInput.trim();
    
    // Optimistically add message to UI
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: profile.id,
      body: messageText,
      created_at: new Date().toISOString(),
      sender_name: profile.full_name,
      sender_role: profile.role,
      pending: true
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setMessageInput('');

    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: profile.id,
          body: messageText
        })
        .select('id')
        .single();

      if (error) throw error;

      // Replace temp message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, id: data.id, pending: false }
            : msg
        )
      );
    } catch (error: any) {
      // Mark message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, pending: false, failed: true }
            : msg
        )
      );
      toast.error(error.message || 'Failed to send message');
    }
  };

  const closeConversation = async (conversationId: string) => {
    if (!profile || (profile.role !== 'main_admin' && profile.role !== 'branch_admin')) {
      toast.error('Only admins can close conversations');
      return;
    }

    try {
      const { error } = await supabase
        .from('conversations')
        .update({
          is_closed: true,
          closed_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) throw error;

      toast.success('Conversation closed');
      setSelectedConversation(null);
      fetchConversations();
    } catch (error) {
      toast.error('Failed to close conversation');
    }
  };

  const getDashboardPath = () => {
    switch (profile?.role) {
      case 'main_admin': return '/main-admin/dashboard';
      case 'branch_admin': return '/branch-admin/dashboard';
      case 'staff': return '/staff/dashboard';
      case 'trainer': return '/trainer/dashboard';
      default: return '/student/dashboard';
    }
  };

  const openDetailsDialog = () => {
    if (!currentComplaint) return;
    setShowDetailsDialog(true);
  };

  const selectedConvData = conversations.find(c => c.id === selectedConversation);
  
  // Determine if current user can close the conversation based on type
  const canCloseConversation = selectedConvData && !selectedConvData.is_closed && (
    (selectedConvData.type === 'main_to_branch' && profile?.role === 'main_admin') ||
    ((selectedConvData.type === 'branch_to_staff_group' || selectedConvData.type === 'branch_to_staff_direct') && profile?.role === 'branch_admin')
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="default" onClick={() => navigate(getDashboardPath())}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
              Conversations
            </h1>
          </div>
          <DashboardNav showNotifications showProfile />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Conversation List */}
          <Card className="lg:col-span-1 bg-card border-border">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-18rem)]">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No conversations yet
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {conversations.map((conv) => {
                      const isMainAdminConv = conv.type === 'main_to_branch';
                      return (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv.id)}
                          className={`w-full p-3 rounded-lg text-left transition-colors relative ${
                            selectedConversation === conv.id
                              ? isMainAdminConv 
                                ? 'bg-[hsl(var(--conversation-main-admin))]/20 border border-[hsl(var(--conversation-main-admin))]/50'
                                : 'bg-primary/20 border border-primary/50'
                              : isMainAdminConv
                                ? 'bg-[hsl(var(--conversation-main-admin))]/10 hover:bg-[hsl(var(--conversation-main-admin))]/15 border border-[hsl(var(--conversation-main-admin))]/30'
                                : 'hover:bg-muted'
                          }`}
                        >
                        {conv.unread_count && conv.unread_count > 0 && (
                          <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">
                              {conv.unread_count > 9 ? '9+' : conv.unread_count}
                            </span>
                          </span>
                        )}
                          <div className={`font-medium truncate pr-8 ${isMainAdminConv ? 'text-[hsl(var(--conversation-main-admin))]' : ''}`}>
                            {conv.complaint_title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                            <span>{format(new Date(conv.created_at), 'MMM d, yyyy')}</span>
                            {conv.is_closed && (
                              <span className="text-red-500 font-medium">Closed</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Panel */}
          <Card className="lg:col-span-2 bg-card border-border flex flex-col">
          {selectedConversation ? (
              <>
                <CardHeader className="flex-shrink-0 border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedConvData?.complaint_title}</CardTitle>
                    {canCloseConversation && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => closeConversation(selectedConversation)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Close Chat
                      </Button>
                    )}
                  </div>
                  {currentComplaint && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Discussing Concern:</p>
                      <button
                        onClick={openDetailsDialog}
                        className="text-left hover:underline focus:outline-none w-full group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold group-hover:text-primary transition-colors truncate">
                              {currentComplaint.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              By: {currentComplaint.profiles?.full_name} • {currentComplaint.category?.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetailsDialog();
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isAdmin = msg.sender_role === 'main_admin' || msg.sender_role === 'branch_admin';
                        const isOwnMessage = msg.sender_id === profile?.id;
                        
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${
                              isOwnMessage ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isOwnMessage
                                  ? 'bg-primary text-primary-foreground'
                                  : isAdmin
                                  ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50'
                                  : 'bg-muted'
                              } ${msg.pending ? 'opacity-60' : ''} ${msg.failed ? 'opacity-40 border-2 border-red-500' : ''}`}
                            >
                              <div className="text-xs opacity-70 mb-1 flex items-center gap-2">
                                <span className={isAdmin && !isOwnMessage ? 'font-semibold text-amber-600 dark:text-amber-400' : ''}>
                                  {msg.sender_name}
                                  {isAdmin && !isOwnMessage && ' (Admin)'}
                                </span>
                                {msg.pending && <span className="text-[10px]">(Sending...)</span>}
                                {msg.failed && <span className="text-[10px] text-red-500">(Failed)</span>}
                              </div>
                              <div className="break-words">{msg.body}</div>
                              <div className="text-xs opacity-70 mt-1">
                                {format(new Date(msg.created_at), 'h:mm a')}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  {!selectedConvData?.is_closed && (
                    <div className="flex-shrink-0 border-t border-border p-4">
                      <div className="flex gap-2">
                        <Input
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                          placeholder="Type a message..."
                          className="flex-1"
                        />
                        <Button 
                          onClick={sendMessage} 
                          disabled={!messageInput.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {selectedConvData?.is_closed && (
                    <div className="flex-shrink-0 border-t border-border p-4 text-center text-muted-foreground">
                      This conversation has been closed
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  Select a conversation to view messages
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>

      {/* Complaint Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Concern Details</DialogTitle>
            <DialogDescription>
              View complete details, reviews, and take actions on this concern.
            </DialogDescription>
          </DialogHeader>
          {currentComplaint && (
            <ComplaintDetails 
              complaintId={currentComplaint.id}
              onBack={() => setShowDetailsDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
