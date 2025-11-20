import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Complaint } from '@/types/database';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { ReviewsList } from '@/components/complaints/ReviewsList';

export default function StudentStatus() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComplaints, setExpandedComplaints] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchComplaints();
  }, [profile]);

  const fetchComplaints = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const toggleExpanded = (id: string) => {
    setExpandedComplaints(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="default" onClick={() => navigate('/student/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-2">
            My Concerns
          </h1>
          <p className="text-muted-foreground">Track the status of all your submitted concerns</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          </div>
        ) : complaints.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No concerns yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't submitted any concerns. Click below to raise your first concern.
              </p>
              <Button onClick={() => navigate('/student/raise')} className="bg-gradient-cyber text-background">
                Raise a Concern
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => {
              const isExpanded = expandedComplaints.has(complaint.id);
              const showReviews = complaint.status === 'fixed' || complaint.status === 'cancelled' || complaint.status === 'rejected';
              
              return (
                <Card key={complaint.id} className="bg-card border-border hover:border-primary/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{complaint.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{complaint.description}</CardDescription>
                      </div>
                      <StatusBadge status={complaint.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {getCategoryLabel(complaint.category)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(complaint.created_at), 'MMM dd, yyyy')}
                      </div>
                      {complaint.branch && (
                        <div className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                          {complaint.branch}
                        </div>
                      )}
                      {complaint.anonymous && (
                        <div className="px-2 py-1 rounded bg-secondary/10 text-secondary text-xs font-medium">
                          Anonymous
                        </div>
                      )}
                    </div>
                    {complaint.resolved_at && (
                      <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                        Resolved on {format(new Date(complaint.resolved_at), 'MMM dd, yyyy')}
                      </div>
                    )}
                    
                    {showReviews && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <Button
                          variant="ghost"
                          onClick={() => toggleExpanded(complaint.id)}
                          className="w-full justify-between"
                        >
                          <span className="font-medium">
                            {isExpanded ? 'Hide Reviews' : 'View Reviews'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                        
                        {isExpanded && (
                          <div className="mt-4">
                            <ReviewsList complaintId={complaint.id} />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}