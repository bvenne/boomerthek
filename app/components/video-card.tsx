
'use client';

import { useState } from 'react';
import { Play, Clock, Star, Eye, Bookmark, BookmarkCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MediathekVideo } from '@/lib/types';
import { watchlistManager } from '@/lib/watchlist';
import { useToast } from '@/hooks/use-toast';
import { t } from '@/lib/i18n';
import Image from 'next/image';

interface VideoCardProps {
  video: MediathekVideo & { metadata?: any };
  language?: 'de' | 'en';
  onPlay?: (video: MediathekVideo) => void;
}

export default function VideoCard({ video, language = 'de', onPlay }: VideoCardProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(
    watchlistManager.isInWatchlist(video.id)
  );
  const { toast } = useToast();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ${t('ago', language)}`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ${t('ago', language)}`;
    }
    
    return date.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US');
  };

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      watchlistManager.removeFromWatchlist(video.id);
      setIsInWatchlist(false);
      toast({
        title: t('removeFromWatchlist', language),
        description: video.title,
      });
    } else {
      watchlistManager.addToWatchlist({
        userId: 'anonymous', // In a real app, this would be the authenticated user's ID
        videoId: video.id,
        title: video.title,
        channel: video.channel,
        topic: video.topic,
        thumbnail: video.metadata?.thumbnail,
        duration: video.duration
      });
      setIsInWatchlist(true);
      toast({
        title: t('addToWatchlist', language),
        description: video.title,
      });
    }
  };

  const handlePlay = () => {
    if (onPlay) {
      onPlay(video);
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <div className="relative aspect-video bg-muted">
        {video.metadata?.thumbnail ? (
          <Image
            src={video.metadata.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
            <Play className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Overlay with play button */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <Button
            size="lg"
            onClick={handlePlay}
            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full w-16 h-16 bg-white/20 backdrop-blur-sm hover:bg-white/30"
          >
            <Play className="w-8 h-8 text-white" />
          </Button>
        </div>
        
        {/* Duration badge */}
        <Badge className="absolute top-2 right-2 bg-black/70 text-white">
          <Clock className="w-3 h-3 mr-1" />
          {formatDuration(video.duration)}
        </Badge>
        
        {/* Channel badge */}
        <Badge variant="secondary" className="absolute top-2 left-2">
          {video.channel}
        </Badge>
        
        {/* New badge */}
        {video.new && (
          <Badge variant="destructive" className="absolute bottom-2 left-2">
            Neu
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm line-clamp-2 flex-1 mr-2">
            {video.title}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWatchlistToggle}
            className="flex-shrink-0"
          >
            {isInWatchlist ? (
              <BookmarkCheck className="w-4 h-4 text-primary" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {video.topic && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
            {video.topic}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {video.metadata?.imdbRating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span>{video.metadata.imdbRating.toFixed(1)}</span>
              </div>
            )}
            
            {video.metadata?.avgRating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-blue-500" />
                <span>{video.metadata.avgRating.toFixed(1)}</span>
              </div>
            )}
            
            {video.metadata?.viewCount > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{video.metadata.viewCount}</span>
              </div>
            )}
          </div>
          
          <span>{formatTimestamp(video.timestamp)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
