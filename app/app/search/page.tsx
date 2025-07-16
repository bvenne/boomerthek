
'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import VideoCard from '@/components/video-card';
import SearchFilter from '@/components/search-filter';
import VideoPlayer from '@/components/video-player';
import { MediathekVideo, FilterOptions } from '@/lib/types';
import { mediathekClient } from '@/lib/mediathek-api';
import { t, Language } from '@/lib/i18n';
import { motion } from 'framer-motion';

export default function SearchPage() {
  const [language, setLanguage] = useState<Language>('de');
  const [videos, setVideos] = useState<MediathekVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedVideo, setSelectedVideo] = useState<MediathekVideo | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, filters]);

  const handleSearch = async (append = false) => {
    if (!append) {
      setLoading(true);
      setCurrentPage(1);
    }

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: '24',
        offset: append ? (currentPage * 24).toString() : '0',
        sortBy: filters.sortBy || 'timestamp',
        sortOrder: filters.sortOrder || 'desc'
      });

      if (filters.channel) params.append('channel', filters.channel);
      if (filters.minDuration) params.append('minDuration', filters.minDuration.toString());
      if (filters.maxDuration) params.append('maxDuration', filters.maxDuration.toString());

      const response = await fetch(`/api/videos?${params}`);
      if (response.ok) {
        const data = await response.json();
        const newVideos = data.videos || [];
        
        if (append) {
          setVideos(prev => [...prev, ...newVideos]);
        } else {
          setVideos(newVideos);
        }
        
        setTotalResults(data.total || 0);
        setHasMore(newVideos.length === 24);
      }
    } catch (error) {
      console.error('Failed to search videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
    handleSearch(true);
  };

  const handleVideoPlay = (video: MediathekVideo) => {
    setSelectedVideo(video);
  };

  const handleVideoError = (error: string) => {
    console.error('Video playback error:', error);
    setSelectedVideo(null);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const VideoGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video, index) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <VideoCard
            video={video}
            language={language}
            onPlay={handleVideoPlay}
          />
        </motion.div>
      ))}
    </div>
  );

  const VideoList = () => (
    <div className="space-y-4">
      {videos.map((video, index) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-32 h-24 bg-muted rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-medium text-sm">
                      {video.channel.charAt(0)}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-2 pr-4">
                      {video.title}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVideoPlay(video)}
                      className="flex-shrink-0"
                    >
                      {t('play', language)}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{video.channel}</Badge>
                    {video.topic && (
                      <Badge variant="outline">{video.topic}</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {video.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{Math.floor(video.duration / 60)}m</span>
                    {video.metadata?.imdbRating && (
                      <span className="flex items-center gap-1">
                        ⭐ {video.metadata.imdbRating.toFixed(1)}
                      </span>
                    )}
                    <span>{new Date(video.timestamp).toLocaleDateString()}</span>
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
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('search', language)}</h1>
          <p className="text-muted-foreground">
            Durchsuche deutsche Mediatheken nach Filmen, Serien und Dokumentationen
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <SearchFilter
            language={language}
            onSearch={setSearchQuery}
            onFilter={handleFilterChange}
            initialQuery={searchQuery}
          />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {loading ? t('loading', language) : `${totalResults} ${t('noResults', language)}`}
            </h2>
            {searchQuery && (
              <Badge variant="outline">
                "{searchQuery}"
              </Badge>
            )}
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
          </div>
        </div>

        {/* Results */}
        {loading && videos.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : videos.length > 0 ? (
          <div className="space-y-8">
            {viewMode === 'grid' ? <VideoGrid /> : <VideoList />}
            
            {hasMore && (
              <div className="flex justify-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('noResults', language)}</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </div>
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
