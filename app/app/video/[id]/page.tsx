
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Play, Clock, Star, Eye, Bookmark, BookmarkCheck, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/header';
import VideoPlayer from '@/components/video-player';
import VideoCard from '@/components/video-card';
import RatingSystem from '@/components/rating-system';
import { MediathekVideo, VideoMetadata } from '@/lib/types';
import { mediathekClient } from '@/lib/mediathek-api';
import { watchlistManager } from '@/lib/watchlist';
import { t, Language } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function VideoDetailPage() {
  const params = useParams();
  const videoId = params.id as string;
  
  const [language, setLanguage] = useState<Language>('de');
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [similarVideos, setSimilarVideos] = useState<MediathekVideo[]>([]);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedSimilarVideo, setSelectedSimilarVideo] = useState<MediathekVideo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (videoId) {
      fetchVideoDetails();
      checkWatchlistStatus();
    }
  }, [videoId]);

  const fetchVideoDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch video metadata
      const response = await fetch(`/api/videos/${videoId}`);
      if (response.ok) {
        const data = await response.json();
        setMetadata(data.metadata);
        
        // Fetch similar videos based on topic or channel
        if (data.metadata) {
          const similarResponse = await fetch(
            `/api/videos?channel=${data.metadata.channel}&limit=8`
          );
          if (similarResponse.ok) {
            const similarData = await similarResponse.json();
            setSimilarVideos(similarData.videos?.filter((v: any) => v.id !== videoId) || []);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch video details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWatchlistStatus = () => {
    setIsInWatchlist(watchlistManager.isInWatchlist(videoId));
  };

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      watchlistManager.removeFromWatchlist(videoId);
      setIsInWatchlist(false);
      toast({
        title: t('removeFromWatchlist', language),
        description: metadata?.title || '',
      });
    } else if (metadata) {
      watchlistManager.addToWatchlist({
        userId: 'anonymous',
        videoId: videoId,
        title: metadata.title,
        channel: metadata.channel,
        topic: metadata.topic,
        thumbnail: metadata.thumbnail,
        duration: metadata.duration
      });
      setIsInWatchlist(true);
      toast({
        title: t('addToWatchlist', language),
        description: metadata.title,
      });
    }
    
    // Dispatch custom event for header update
    window.dispatchEvent(new CustomEvent('watchlistUpdated'));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: metadata?.title || '',
          text: `Check out this video: ${metadata?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Video link has been copied to clipboard',
      });
    }
  };

  const handleSimilarVideoPlay = (video: MediathekVideo) => {
    setSelectedSimilarVideo(video);
  };

  const handleVideoError = (error: string) => {
    console.error('Video playback error:', error);
    setSelectedSimilarVideo(null);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header language={language} onLanguageChange={setLanguage} />
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="aspect-video bg-muted rounded-lg mb-6" />
            <div className="h-8 bg-muted rounded w-3/4 mb-4" />
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="min-h-screen bg-background">
        <Header language={language} onLanguageChange={setLanguage} />
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-2">Video not found</h1>
            <p className="text-muted-foreground mb-4">
              The video you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button>{t('home', language)}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header language={language} onLanguageChange={setLanguage} />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/search">
              <ArrowLeft className="w-4 h-4" />
              Back to Search
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="mb-6">
              {showPlayer ? (
                <VideoPlayer
                  src={`/api/videos/${videoId}/stream`}
                  title={metadata.title}
                  autoplay
                  onError={(error) => console.error('Video error:', error)}
                />
              ) : (
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <Badge variant="secondary" className="mb-2">
                      {metadata.channel}
                    </Badge>
                    <h1 className="text-2xl font-bold mb-2 line-clamp-2">
                      {metadata.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(metadata.duration || 0)}
                      </div>
                      {metadata.imdbRating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {metadata.imdbRating.toFixed(1)}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {metadata.viewCount}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => setShowPlayer(true)}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full w-20 h-20 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                  >
                    <Play className="w-10 h-10 text-white" />
                  </Button>
                </div>
              )}
            </div>

            {/* Video Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{metadata.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary">{metadata.channel}</Badge>
                      {metadata.topic && (
                        <Badge variant="outline">{metadata.topic}</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleWatchlistToggle}
                      className="gap-2"
                    >
                      {isInWatchlist ? (
                        <BookmarkCheck className="w-4 h-4 text-primary" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                      {isInWatchlist ? t('removeFromWatchlist', language) : t('addToWatchlist', language)}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      {t('share', language)}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {metadata.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">{t('description', language)}</h3>
                    <p className="text-muted-foreground">{metadata.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <div className="font-medium">{formatDuration(metadata.duration || 0)}</div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Views:</span>
                    <div className="font-medium">{metadata.viewCount}</div>
                  </div>
                  
                  {metadata.imdbRating && (
                    <div>
                      <span className="text-muted-foreground">IMDB:</span>
                      <div className="font-medium flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {metadata.imdbRating.toFixed(1)}
                      </div>
                    </div>
                  )}
                  
                  {metadata.avgRating && (
                    <div>
                      <span className="text-muted-foreground">User Rating:</span>
                      <div className="font-medium flex items-center gap-1">
                        <Star className="w-4 h-4 text-blue-500" />
                        {metadata.avgRating.toFixed(1)}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Ratings */}
              <RatingSystem
                videoId={videoId}
                language={language}
                userId="anonymous"
              />

              {/* Similar Videos */}
              {similarVideos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('similar', language)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {similarVideos.slice(0, 4).map((video) => (
                        <motion.div
                          key={video.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex gap-3 group cursor-pointer" onClick={() => handleSimilarVideoPlay(video)}>
                            <div className="flex-shrink-0 w-24 h-16 bg-muted rounded-lg flex items-center justify-center">
                              <Play className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary">
                                {video.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {video.channel} • {Math.floor(video.duration / 60)}m
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* More from this channel */}
        {similarVideos.length > 4 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">More from {metadata.channel}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {similarVideos.slice(4).map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  language={language}
                  onPlay={handleSimilarVideoPlay}
                />
              ))}
            </div>
          </section>
        )}

        {/* Similar Video Player Modal */}
        {selectedSimilarVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedSimilarVideo(null)}
          >
            <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <VideoPlayer
                src={mediathekClient.getStreamUrl(selectedSimilarVideo)}
                title={selectedSimilarVideo.title}
                autoplay
                onError={handleVideoError}
              />
              <div className="mt-4 text-white">
                <h3 className="text-2xl font-bold mb-2">{selectedSimilarVideo.title}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="secondary">{selectedSimilarVideo.channel}</Badge>
                  <span>{selectedSimilarVideo.topic}</span>
                  <span>{Math.floor(selectedSimilarVideo.duration / 60)} {t('minutes', language)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
