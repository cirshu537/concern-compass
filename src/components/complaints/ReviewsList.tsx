import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  reviewer_role: string;
  created_at: string;
}

interface ReviewsListProps {
  complaintId: string;
}

export function ReviewsList({ complaintId }: ReviewsListProps) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', complaintId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaint_reviews')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    }
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 text-center text-muted-foreground">
          No reviews yet
        </CardContent>
      </Card>
    );
  }

  const getRatingIcon = (rating: number) => {
    if (rating === 1) return <ThumbsUp className="w-5 h-5 text-green-500" />;
    if (rating === -1) return <ThumbsDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-yellow-500" />;
  };

  const getRatingLabel = (rating: number) => {
    if (rating === 1) return 'Positive';
    if (rating === -1) return 'Negative';
    return 'Neutral';
  };

  // Sort reviews: staff/trainer/branch_admin first, then students
  const sortedReviews = [...reviews].sort((a, b) => {
    const aIsStaff = a.reviewer_role !== 'student';
    const bIsStaff = b.reviewer_role !== 'student';
    
    if (aIsStaff && !bIsStaff) return -1;
    if (!aIsStaff && bIsStaff) return 1;
    
    // If both are same type, maintain created_at order
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-3">
      {sortedReviews.map((review) => (
        <Card key={review.id} className="bg-card border-border">
          <CardHeader className="pb-2 pt-3 px-3">
            <p className="text-xs text-muted-foreground capitalize">
              {review.reviewer_role.replace('_', ' ')} • {format(new Date(review.created_at), 'MMM d, yyyy h:mm a')}
            </p>
          </CardHeader>
          {review.comment && (
            <CardContent className="px-3 pb-3">
              <p className="text-sm">{review.comment}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
