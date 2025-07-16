
'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface VideoPlayerProps {
  src: string;
  title: string;
  poster?: string;
  autoplay?: boolean;
  onError?: (error: string) => void;
}

export default function VideoPlayer({ 
  src, 
  title, 
  poster, 
  autoplay = false, 
  onError 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<any>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [hlsSupported, setHlsSupported] = useState(false);

  useEffect(() => {
    const loadHLS = async () => {
      try {
        const Hls = (await import('hls.js')).default;
        setHlsSupported(Hls.isSupported());
        
        if (!videoRef.current) return;
        
        const video = videoRef.current;
        
        if (src.includes('.m3u8')) {
          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            
            hlsRef.current = hls;
            hls.loadSource(src);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setIsLoading(false);
              if (autoplay) {
                video.play().catch(e => {
                  console.log('Autoplay prevented:', e);
                });
              }
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
              console.error('HLS Error:', data);
              if (data.fatal) {
                const errorMsg = `Video loading failed: ${data.type}`;
                setError(errorMsg);
                onError?.(errorMsg);
                
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    hls.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    hls.recoverMediaError();
                    break;
                  default:
                    hls.destroy();
                    break;
                }
              }
            });
            
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = src;
            video.addEventListener('loadedmetadata', () => {
              setIsLoading(false);
              if (autoplay) {
                video.play().catch(e => {
                  console.log('Autoplay prevented:', e);
                });
              }
            });
          } else {
            setError('HLS not supported in this browser');
            onError?.('HLS not supported in this browser');
          }
        } else {
          // Regular video file
          video.src = src;
          setIsLoading(false);
        }
        
      } catch (err) {
        console.error('Error loading HLS:', err);
        setError('Failed to load video player');
        onError?.('Failed to load video player');
      }
    };

    loadHLS();
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src, autoplay, onError]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleLoadedData = () => setIsLoading(false);
    const handleError = () => {
      setError('Video playback error');
      setIsLoading(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
  };

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    videoRef.current.volume = value[0];
  };

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = value[0];
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <Card className="aspect-video bg-muted flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video bg-black group overflow-hidden rounded-lg"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={poster}
        playsInline
        preload="metadata"
      />
      
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Play Button Overlay */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Button
            size="lg"
            onClick={togglePlay}
            className="rounded-full w-16 h-16 bg-white/20 backdrop-blur-sm hover:bg-white/30"
          >
            <Play className="w-8 h-8 text-white" />
          </Button>
        </div>
      )}
      
      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleSeek}
              className="w-full"
            />
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-full"
                />
              </div>
              
              <span className="text-white text-sm ml-4">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
      
      {/* Title Overlay */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
          <h3 className="text-white text-lg font-semibold truncate">{title}</h3>
        </div>
      )}
    </div>
  );
}
