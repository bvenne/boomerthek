
'use client';

import { useState, useEffect } from 'react';
import { Play, TrendingUp, Clock, Star, Eye, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/header';
import VideoCard from '@/components/video-card';
import VideoPlayer from '@/components/video-player';
import { MediathekVideo } from '@/lib/types';
import { mediathekClient } from '@/lib/mediathek-api';
import { t, Language } from '@/lib/i18n';
import { CHANNELS } from '@/lib/types';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [language, setLanguage] = useState<Language>('de');
  const [recentVideos, setRecentVideos] = useState<MediathekVideo[]>([]);
  const [popularVideos, setPopularVideos] = useState<MediathekVideo[]>([]);
  const [channelVideos, setChannelVideos] = useState<Record<string, MediathekVideo[]>>({});
  const [selectedVideo, setSelectedVideo] = useState<MediathekVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      // Fetch recent videos
      const recentResponse = await fetch('/api/videos?type=recent&limit=12');
      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        setRecentVideos(recentData.videos || []);
      }

      // Fetch popular videos
      const popularResponse = await fetch('/api/videos?type=popular&limit=12');
      if (popularResponse.ok) {
        const popularData = await popularResponse.json();
        setPopularVideos(popularData.videos || []);
      }

      // Fetch videos by channel
      const channelPromises = CHANNELS.slice(0, 6).map(async (channel) => {
        const response = await fetch(`/api/videos?channel=${channel}&limit=6`);
        if (response.ok) {
          const data = await response.json();
          return { channel, videos: data.videos || [] };
        }
        return { channel, videos: [] };
      });

      const channelResults = await Promise.all(channelPromises);
      const channelVideoMap = channelResults.reduce((acc, { channel, videos }) => {
        acc[channel] = videos;
        return acc;
      }, {} as Record<string, MediathekVideo[]>);

      setChannelVideos(channelVideoMap);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoPlay = (video: MediathekVideo) => {
    setSelectedVideo(video);
  };

  const handleVideoError = (error: string) => {
    console.error('Video playback error:', error);
    setSelectedVideo(null);
  };

  const heroVideos = recentVideos.slice(0, 3);
  const featuredVideo = heroVideos[0];

  return (
    <div className="min-h-screen bg-background">
      <Header language={language} onLanguageChange={setLanguage} />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-4">
                {t('newest', language)}
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold mb-4">
                Deutsche Mediatheken
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Entdecke die besten Filme, Serien und Dokumentationen von ARD, ZDF, ARTE und weiteren öffentlich-rechtlichen Sendern
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/search">
                  <Button size="lg" className="gap-2">
                    <Play className="w-5 h-5" />
                    {t('search', language)}
                  </Button>
                </Link>
                <Link href="/watchlist">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Eye className="w-5 h-5" />
                    {t('watchlist', language)}
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {featuredVideo && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                  <div className="absolute bottom-4 left-4 right-4 z-20 text-white">
                    <Badge variant="secondary" className="mb-2">
                      {featuredVideo.channel}
                    </Badge>
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">
                      {featuredVideo.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {Math.floor(featuredVideo.duration / 60)}m
                      </div>
                      {featuredVideo.metadata?.imdbRating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {featuredVideo.metadata.imdbRating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => handleVideoPlay(featuredVideo)}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 rounded-full w-16 h-16 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                  >
                    <Play className="w-8 h-8 text-white" />
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

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

        {/* Content Sections */}
        <section className="py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="recent" className="gap-2">
                <Clock className="w-4 h-4" />
                {t('newest', language)}
              </TabsTrigger>
              <TabsTrigger value="popular" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Popular
              </TabsTrigger>
              <TabsTrigger value="channels" className="gap-2">
                <Play className="w-4 h-4" />
                {t('channel', language)}
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2">
                <Star className="w-4 h-4" />
                Categories
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{t('newest', language)}</h2>
                <Link href="/search?sort=newest">
                  <Button variant="outline" size="sm" className="gap-2">
                    Alle anzeigen
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="aspect-video bg-muted" />
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted rounded mb-2" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recentVideos.map((video) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <VideoCard
                        video={video}
                        language={language}
                        onPlay={handleVideoPlay}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="popular" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Popular Content</h2>
                <Link href="/search?sort=popular">
                  <Button variant="outline" size="sm" className="gap-2">
                    Alle anzeigen
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {popularVideos.map((video) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <VideoCard
                      video={video}
                      language={language}
                      onPlay={handleVideoPlay}
                    />
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="channels" className="mt-6">
              <div className="space-y-8">
                {Object.entries(channelVideos).map(([channel, videos]) => (
                  <motion.div
                    key={channel}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">{channel}</h3>
                      <Link href={`/search?channel=${channel}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          Alle anzeigen
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                      {videos.map((video) => (
                        <VideoCard
                          key={video.id}
                          video={video}
                          language={language}
                          onPlay={handleVideoPlay}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="categories" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: t('movies', language), count: 1234, icon: Play },
                  { name: t('series', language), count: 567, icon: TrendingUp },
                  { name: t('documentaries', language), count: 890, icon: Eye },
                  { name: t('news', language), count: 456, icon: Clock },
                  { name: t('sport', language), count: 234, icon: Star },
                  { name: t('culture', language), count: 345, icon: Play }
                ].map((category) => {
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link href={`/search?category=${category.name}`}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{category.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {category.count} videos
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}
