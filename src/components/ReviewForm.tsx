import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ReviewFormProps {
  complaintId: string;
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ complaintId, onReviewSubmitted }: ReviewFormProps) {
  const { profile } = useAuth();
  const [rating, setRating] = useState<-1 | 0 | 1 | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === null) {
      toast.error('Please select a rating');
      return;
    }

    if (!profile) {
      toast.error('You must be logged in to submit a review');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('complaint_reviews')
        .insert({
          complaint_id: complaintId,
          reviewer_id: profile.id,
          reviewer_role: profile.role,
          rating,
          comment: comment.trim() || null
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already submitted a review for this concern');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Review submitted successfully');
      setRating(null);
      setComment('');
      onReviewSubmitted?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Rate this Resolution</CardTitle>
        <CardDescription>
          Your feedback helps us improve our service quality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 justify-center">
          <Button
            variant={rating === 1 ? 'default' : 'outline'}
            size="lg"
            onClick={() => setRating(1)}
            className="flex-1"
          >
            <ThumbsUp className="w-5 h-5 mr-2" />
            Positive
          </Button>
          <Button
            variant={rating === 0 ? 'default' : 'outline'}
            size="lg"
            onClick={() => setRating(0)}
            className="flex-1"
          >
            <Minus className="w-5 h-5 mr-2" />
            Neutral
          </Button>
          <Button
            variant={rating === -1 ? 'default' : 'outline'}
            size="lg"
            onClick={() => setRating(-1)}
            className="flex-1"
          >
            <ThumbsDown className="w-5 h-5 mr-2" />
            Negative
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Comment (Optional)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about the resolution..."
            rows={4}
            className="bg-input border-border"
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={rating === null || submitting}
          className="w-full"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </CardContent>
    </Card>
  );
}
