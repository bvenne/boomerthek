
'use client';

import { useState, useEffect } from 'react';
import { Star, MessageCircle, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserRating } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { t } from '@/lib/i18n';

interface RatingSystemProps {
  videoId: string;
  language?: 'de' | 'en';
  userId?: string;
}

export default function RatingSystem({ videoId, language = 'de', userId = 'anonymous' }: RatingSystemProps) {
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [userRating, setUserRating] = useState<UserRating | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRatings();
  }, [videoId]);

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/ratings?videoId=${videoId}&userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setRatings(data.ratings || []);
        setUserRating(data.userRating || null);
        if (data.userRating) {
          setNewRating(data.userRating.rating);
          setNewComment(data.userRating.comment || '');
        }
      }
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async () => {
    if (newRating === 0) {
      toast({
        title: 'Error',
        description: 'Please select a rating',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoId,
          userId,
          rating: newRating,
          comment: newComment.trim() || null
        })
      });

      if (response.ok) {
        await fetchRatings();
        toast({
          title: t('submitRating', language),
          description: 'Your rating has been submitted successfully'
        });
      } else {
        throw new Error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit rating. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => setNewRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            {t('userRating', language)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ratings.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {calculateAverageRating().toFixed(1)}
                </div>
                <div className="flex justify-center mb-1">
                  {renderStars(Math.round(calculateAverageRating()))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = ratings.filter(r => r.rating === stars).length;
                    const percentage = ratings.length > 0 ? (count / ratings.length) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2 text-sm">
                        <span className="w-3">{stars}</span>
                        <Star className="w-3 h-3 text-yellow-500" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No ratings yet. Be the first to rate this video!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Rating */}
      <Card>
        <CardHeader>
          <CardTitle>
            {userRating ? t('yourRating', language) : t('rateThis', language)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t('rating', language)}
            </label>
            {renderStars(hoveredRating || newRating, true)}
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Comment (optional)
            </label>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this video..."
              className="min-h-[100px]"
            />
          </div>
          
          <Button 
            onClick={submitRating} 
            disabled={isSubmitting || newRating === 0}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {userRating ? 'Update Rating' : t('submitRating', language)}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* User Reviews */}
      {ratings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Reviews ({ratings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ratings.slice(0, 5).map((rating) => (
                <div key={rating.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          User {rating.userId.slice(-4)}
                        </span>
                        <div className="flex">
                          {renderStars(rating.rating)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(rating.createdAt)}
                        </span>
                      </div>
                      {rating.comment && (
                        <p className="text-sm text-muted-foreground">
                          {rating.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {ratings.length > 5 && (
                <div className="text-center">
                  <Button variant="outline" size="sm">
                    Show more reviews
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
