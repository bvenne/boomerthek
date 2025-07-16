
'use client';

import { useState, useEffect } from 'react';
import { Bookmark, Play, Trash2, Clock, Star, Eye, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import VideoPlayer from '@/components/video-player';
import { WatchlistItem } from '@/lib/types';
import { watchlistManager } from '@/lib/watchlist';
import { mediathekClient } from '@/lib/mediathek-api';
import { t, Language } from '@/lib/i18n';
import { motion } from 'framer-motion';

export default function WatchlistPage() {
  const [language, setLanguage] = useState<Language>('de');
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'channel'>('date');

  useEffect(() => {
    loadWatchlist();
    
    // Listen for watchlist updates
    const handleWatchlistUpdate = () => {
      loadWatchlist();
    };
    
    window.addEventListener('watchlistUpdated', handleWatchlistUpdate);
    window.addEventListener('storage', handleWatchlistUpdate);
    
    return () => {
      window.removeEventListener('watchlistUpdated', handleWatchlistUpdate);
      window.removeEventListener('storage', handleWatchlistUpdate);
    };
  }, []);

  const loadWatchlist = () => {
    const items = watchlistManager.getWatchlist();
    setWatchlist(items);
  };

  const handleRemoveFromWatchlist = (videoId: string) => {
    watchlistManager.removeFromWatchlist(videoId);
    loadWatchlist();
    
    // Dispatch custom event for header update
    window.dispatchEvent(new CustomEvent('watchlistUpdated'));
  };

  const handleClearWatchlist = () => {
    watchlistManager.clearWatchlist();
    loadWatchlist();
    
    // Dispatch custom event for header update
    window.dispatchEvent(new CustomEvent('watchlistUpdated'));
  };

  const handleVideoPlay = (item: WatchlistItem) => {
    // For watchlist items, we need to create a mock video object
    const mockVideo = {
      id: item.videoId,
      title: item.title,
      channel: item.channel,
      topic: item.topic || '',
      description: '',
      timestamp: item.createdAt.toISOString(),
      duration: item.duration || 0,
      size: 0,
      url_website: '',
      url_video: '',
      url_video_low: '',
      url_video_hd: ''
    };
    
    setSelectedVideo(mockVideo);
  };

  const handleVideoError = (error: string) => {
    console.error('Video playback error:', error);
    setSelectedVideo(null);
  };

  const sortedWatchlist = [...watchlist].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'channel':
        return a.channel.localeCompare(b.channel);
      case 'date':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const WatchlistGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sortedWatchlist.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="group overflow-hidden hover:shadow-lg transition-all duration-200">
            <div className="relative aspect-video bg-muted">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
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
                  onClick={() => handleVideoPlay(item)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full w-16 h-16 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                >
                  <Play className="w-8 h-8 text-white" />
                </Button>
              </div>
              
              {/* Duration badge */}
              {item.duration && (
                <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                  <Clock className="w-3 h-3 mr-1" />
                  {Math.floor(item.duration / 60)}m
                </Badge>
              )}
              
              {/* Channel badge */}
              <Badge variant="secondary" className="absolute top-2 left-2">
                {item.channel}
              </Badge>
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm line-clamp-2 flex-1 mr-2">
                  {item.title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFromWatchlist(item.videoId)}
                  className="flex-shrink-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              {item.topic && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                  {item.topic}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Added {formatDate(item.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const WatchlistList = () => (
    <div className="space-y-4">
      {sortedWatchlist.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-32 h-24 bg-muted rounded-lg flex items-center justify-center">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-medium text-sm">
                        {item.channel.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-2 pr-4">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVideoPlay(item)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {t('play', language)}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromWatchlist(item.videoId)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{item.channel}</Badge>
                    {item.topic && (
                      <Badge variant="outline">{item.topic}</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {item.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(item.duration / 60)}m
                      </span>
                    )}
                    <span>Added {formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header language={language} onLanguageChange={setLanguage} />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Bookmark className="w-8 h-8" />
            {t('watchlist', language)}
          </h1>
          <p className="text-muted-foreground">
            Deine gespeicherten Videos zum späteren Ansehen
          </p>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Bookmark className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('emptyWatchlist', language)}</h3>
            <p className="text-muted-foreground mb-4">
              Füge Videos zu deiner Merkliste hinzu, um sie später anzusehen
            </p>
            <Button asChild>
              <a href="/search">{t('search', language)}</a>
            </Button>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  {watchlist.length} {watchlist.length === 1 ? 'Video' : 'Videos'}
                </h2>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="date">Sort by Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="channel">Sort by Channel</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearWatchlist}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>

            {/* Watchlist Content */}
            {viewMode === 'grid' ? <WatchlistGrid /> : <WatchlistList />}
          </>
        )}

        {/* Video Player Modal */}
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <VideoPlayer
                src={mediathekClient.getStreamUrl(selectedVideo)}
                title={selectedVideo.title}
                autoplay
                onError={handleVideoError}
              />
              <div className="mt-4 text-white">
                <h3 className="text-2xl font-bold mb-2">{selectedVideo.title}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="secondary">{selectedVideo.channel}</Badge>
                  <span>{selectedVideo.topic}</span>
                  <span>{Math.floor(selectedVideo.duration / 60)} {t('minutes', language)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
