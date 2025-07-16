
import { MediathekSearchQuery, MediathekSearchResult, MediathekVideo } from './types';

export class MediathekViewClient {
  private baseUrl = 'https://mediathekviewweb.de/api/query';

  async search(query: string, options: Partial<MediathekSearchQuery> = {}): Promise<MediathekVideo[]> {
    const searchQuery: MediathekSearchQuery = {
      queries: [{ 
        fields: options.queries?.[0]?.fields || ['title', 'topic', 'channel'], 
        query: query 
      }],
      sortBy: options.sortBy || 'timestamp',
      sortOrder: options.sortOrder || 'desc',
      future: options.future || false,
      offset: options.offset || 0,
      size: options.size || 50,
      duration_min: options.duration_min || 0,
      duration_max: options.duration_max || 7200
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(searchQuery)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MediathekSearchResult = await response.json();
      return data.result?.results || [];
    } catch (error) {
      console.error('MediathekView API Error:', error);
      return [];
    }
  }

  async getByChannel(channel: string, limit: number = 50): Promise<MediathekVideo[]> {
    return this.search('', {
      queries: [{ fields: ['channel'], query: channel }],
      size: limit,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    });
  }

  async getRecentVideos(limit: number = 50): Promise<MediathekVideo[]> {
    return this.search('', {
      size: limit,
      sortBy: 'timestamp',
      sortOrder: 'desc',
      duration_min: 300 // Mindestens 5 Minuten
    });
  }

  async getPopularVideos(limit: number = 50): Promise<MediathekVideo[]> {
    const popularTopics = ['Tatort', 'Polizeiruf', 'heute', 'Tagesschau', 'Panorama'];
    const results: MediathekVideo[] = [];
    
    for (const topic of popularTopics) {
      const videos = await this.search(topic, {
        size: Math.ceil(limit / popularTopics.length),
        duration_min: 1800 // Mindestens 30 Minuten
      });
      results.push(...videos);
    }
    
    return results.slice(0, limit);
  }

  getStreamUrl(videoItem: MediathekVideo): string {
    // Priorisierung: HD > Normal > Low
    if (videoItem.url_video_hd) {
      return videoItem.url_video_hd;
    } else if (videoItem.url_video) {
      return videoItem.url_video;
    } else if (videoItem.url_video_low) {
      return videoItem.url_video_low;
    }
    
    throw new Error('Keine Stream-URL verfügbar');
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }

  generateVideoId(video: MediathekVideo): string {
    return Buffer.from(`${video.channel}-${video.title}-${video.timestamp}`).toString('base64');
  }
}

export const mediathekClient = new MediathekViewClient();
