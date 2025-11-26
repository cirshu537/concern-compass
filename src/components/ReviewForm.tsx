import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  
  // Determine appropriate description based on user role
  const getCardDescription = () => {
    if (isTrainerReply) return 'Provide your response to this concern';
    if (profile?.role === 'staff' || profile?.role === 'branch_admin') {
      return 'Provide your assessment of how this concern was handled';
    }
    return 'Your feedback helps us improve our service quality';
  };
  const [rating, setRating] = useState<-1 | 0 | 1 | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleSubmit = async (action: 'fixed' | 'cancelled' | 'submit') => {
    if (!isTrainerReply && rating === null) {
      toast.error('Please select a rating');
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
      if (allowStatusChange && (action === 'fixed' || action === 'cancelled')) {
        const { error: statusError } = await supabase
          .from('complaints')
          .update({ 
            status: action,
            resolved_at: action === 'fixed' ? new Date().toISOString() : null
          })
          .eq('id', complaintId);

        if (statusError) throw statusError;
      }

      // Auto-mark trainer-related concerns as noted when trainer replies
      if (isTrainerReply && currentStatus === 'logged') {
        const { error: statusError } = await supabase
          .from('complaints')
          .update({ 
            status: 'noted',
            updated_at: new Date().toISOString()
          })
          .eq('id', complaintId);

        if (statusError) throw statusError;
      }

      toast.success(
        action === 'cancelled' 
          ? 'Concern cancelled successfully' 
          : isTrainerReply 
            ? 'Reply submitted successfully' 
            : action === 'fixed'
              ? 'Concern marked as fixed'
              : 'Review submitted successfully'
      );
      setRating(null);
      setComment('');
      onReviewSubmitted?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleCancelConfirm = async () => {
    setShowCancelConfirm(false);
    await handleSubmit('cancelled');
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-sm font-semibold">{isTrainerReply ? 'Reply to Student' : 'Complete Concern'}</CardTitle>
            <CardDescription className="text-xs">{getCardDescription()}</CardDescription>
          </div>
          {allowStatusChange && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancelClick}
              disabled={submitting}
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 -mt-1"
              title="Cancel concern"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-3 pb-3">
        {!isTrainerReply && (
          <div className="flex gap-2 justify-center items-center">
            <Button
              variant={rating === -1 ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setRating(-1)}
              className={`flex-1 h-8 text-xs ${rating !== -1 ? 'border-destructive/50 text-destructive hover:bg-destructive/10' : ''}`}
            >
              <ThumbsDown className="w-3 h-3 mr-1" />
              Negative
            </Button>
            <Button
              variant={rating === 0 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRating(0)}
              className="flex-1 h-8 text-xs"
            >
              Neutral
            </Button>
            <Button
              variant={rating === 1 ? 'success' : 'outline'}
              size="sm"
              onClick={() => setRating(1)}
              className={`flex-1 h-8 text-xs ${rating !== 1 ? 'border-success/50 text-success hover:bg-success/10' : ''}`}
            >
              <ThumbsUp className="w-3 h-3 mr-1" />
              Positive
            </Button>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium">
            {isTrainerReply ? 'Your Response' : 'Comment'} {!isTrainerReply && '(Optional)'}
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={isTrainerReply ? 'Write your response...' : 'Share your thoughts...'}
            rows={3}
            className="bg-input border-border text-sm"
          />
        </div>

        <Button 
          onClick={() => handleSubmit(allowStatusChange ? 'fixed' : 'submit')} 
          disabled={(!isTrainerReply && rating === null) || submitting}
          size="sm"
          variant={allowStatusChange ? 'success' : 'default'}
          className="w-full h-9 text-sm font-medium"
        >
          {submitting 
            ? 'Processing...' 
            : allowStatusChange 
              ? 'Mark as Fixed' 
              : isTrainerReply 
                ? 'Send Reply' 
                : 'Submit Review'}
        </Button>
      </CardContent>

      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Cancel This Concern?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this concern? This action will mark the concern as cancelled and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel Concern
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
