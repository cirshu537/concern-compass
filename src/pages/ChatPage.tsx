import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { DashboardNav } from '@/components/DashboardNav';

interface Conversation {
  id: string;
  complaint_id: string;
  type: string;
  branch: string | null;
  is_closed: boolean;
  created_at: string;
  complaint_title?: string;
}

interface Message {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender_name?: string;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const conversationIdParam = searchParams.get('conversation');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversationIdParam);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) {
      fetchConversations();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      subscribeToMessages(selectedConversation);
    }
  }, [selectedConversation]);

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
          complaints!inner(title)
        `)
        .eq('is_closed', false)
        .order('created_at', { ascending: false });

      // Filter based on role
      if (profile.role === 'main_admin') {
        query = query.eq('type', 'main_to_branch');
      } else if (profile.role === 'branch_admin') {
        query = query.or(`type.eq.main_to_branch,type.eq.branch_to_staff_group,type.eq.branch_to_staff_direct`);
        query = query.eq('branch', profile.branch);
      } else if (profile.role === 'staff') {
        query = query.or(`type.eq.branch_to_staff_group,assigned_staff_id.eq.${profile.id}`);
        query = query.eq('branch', profile.branch);
      }

      const { data, error } = await query;
      if (error) throw error;

      const conversationsWithTitle = data.map(conv => ({
        ...conv,
        complaint_title: (conv as any).complaints?.title || 'Untitled'
      }));

      setConversations(conversationsWithTitle);
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
          profiles!inner(full_name)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const messagesWithSender = data.map(msg => ({
        ...msg,
        sender_name: (msg as any).profiles?.full_name || 'Unknown'
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
        () => {
          fetchMessages(conversationId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !profile) return;

    try {
      const { error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: profile.id,
          body: messageInput.trim()
        });

      if (error) throw error;

      setMessageInput('');
    } catch (error: any) {
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
      case 'main_admin': return '/admin/main';
      case 'branch_admin': return '/admin/branch';
      case 'staff': return '/staff/dashboard';
      case 'trainer': return '/trainer/dashboard';
      default: return '/student/dashboard';
    }
  };

  const selectedConvData = conversations.find(c => c.id === selectedConversation);
  const canCloseConversation = selectedConvData && !selectedConvData.is_closed && 
    (profile?.role === 'main_admin' || profile?.role === 'branch_admin');

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
                    No active conversations
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          selectedConversation === conv.id
                            ? 'bg-primary/20 border border-primary/50'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="font-medium truncate">{conv.complaint_title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(new Date(conv.created_at), 'MMM d, yyyy')}
                        </div>
                      </button>
                    ))}
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
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.sender_id === profile?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="text-xs opacity-70 mb-1">{msg.sender_name}</div>
                            <div className="break-words">{msg.body}</div>
                            <div className="text-xs opacity-70 mt-1">
                              {format(new Date(msg.created_at), 'h:mm a')}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  {!selectedConvData?.is_closed && (
                    <div className="flex-shrink-0 border-t border-border p-4">
                      <div className="flex gap-2">
                        <Input
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Type a message..."
                          className="flex-1"
                        />
                        <Button onClick={sendMessage} disabled={!messageInput.trim()}>
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
    </div>
  );
}
