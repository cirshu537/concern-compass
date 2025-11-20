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
  allowStatusChange?: boolean;
  currentStatus?: string;
  isTrainerReply?: boolean;
}

export function ReviewForm({ 
  complaintId, 
  onReviewSubmitted, 
  allowStatusChange = false, 
  currentStatus,
  isTrainerReply = false 
}: ReviewFormProps) {
  const { profile } = useAuth();
  const [rating, setRating] = useState<-1 | 0 | 1 | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'fixed' | 'cancelled' | null>(null);

  const handleSubmit = async () => {
    if (!isTrainerReply && rating === null) {
      toast.error('Please select a rating');
      return;
    }

    if (allowStatusChange && !selectedAction) {
      toast.error('Please select an action (Mark as Fixed or Cancel)');
      return;
    }

    if (!profile) {
      toast.error('You must be logged in to submit a review');
      return;
    }

    setSubmitting(true);
    try {
      // Insert review
      const { error: reviewError } = await supabase
        .from('complaint_reviews')
        .insert({
          complaint_id: complaintId,
          reviewer_id: profile.id,
          reviewer_role: profile.role,
          rating: isTrainerReply ? 0 : rating,
          comment: comment.trim() || null
        });

      if (reviewError) {
        if (reviewError.code === '23505') {
          toast.error('You have already submitted a review for this concern');
        } else {
          throw reviewError;
        }
        return;
      }

      // Update complaint status if needed
      if (allowStatusChange && selectedAction) {
        const { error: statusError } = await supabase
          .from('complaints')
          .update({ 
            status: selectedAction,
            resolved_at: selectedAction === 'fixed' ? new Date().toISOString() : null
          })
          .eq('id', complaintId);

        if (statusError) throw statusError;
      }

      toast.success(isTrainerReply ? 'Reply submitted successfully' : 'Review submitted successfully');
      setRating(null);
      setComment('');
      setSelectedAction(null);
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
        <CardTitle>{isTrainerReply ? 'Reply to Student' : 'Rate this Concern'}</CardTitle>
        <CardDescription>
          {isTrainerReply 
            ? 'Provide your response to this concern' 
            : 'Your feedback helps us improve our service quality'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isTrainerReply && (
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
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {isTrainerReply ? 'Your Response' : 'Comment'} {!isTrainerReply && '(Optional)'}
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={isTrainerReply ? 'Write your response to the student...' : 'Share your thoughts...'}
            rows={4}
            className="bg-input border-border"
          />
        </div>

        {allowStatusChange && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Action</label>
            <div className="flex gap-3">
              <Button
                variant={selectedAction === 'fixed' ? 'default' : 'outline'}
                onClick={() => setSelectedAction('fixed')}
                className="flex-1"
              >
                Mark as Fixed
              </Button>
              <Button
                variant={selectedAction === 'cancelled' ? 'default' : 'outline'}
                onClick={() => setSelectedAction('cancelled')}
                className="flex-1"
              >
                Cancel Concern
              </Button>
            </div>
          </div>
        )}

        <Button 
          onClick={handleSubmit} 
          disabled={
            (!isTrainerReply && rating === null) || 
            (allowStatusChange && !selectedAction) || 
            submitting
          }
          className="w-full"
        >
          {submitting ? 'Submitting...' : isTrainerReply ? 'Send Reply' : 'Submit Review'}
        </Button>
      </CardContent>
    </Card>
  );
}
