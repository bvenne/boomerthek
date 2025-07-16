
import { NextRequest, NextResponse } from 'next/server';
import { mediathekClient } from '@/lib/mediathek-api';
import { omdbClient } from '@/lib/omdb-api';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const channel = searchParams.get('channel') || '';
    const limit = parseInt(searchParams.get('limit') || '24');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'timestamp';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';
    const minDuration = parseInt(searchParams.get('minDuration') || '0');
    const maxDuration = parseInt(searchParams.get('maxDuration') || '7200');
    const type = searchParams.get('type') || 'search';

    let videos;

    if (type === 'recent') {
      videos = await mediathekClient.getRecentVideos(limit);
    } else if (type === 'popular') {
      videos = await mediathekClient.getPopularVideos(limit);
    } else if (channel) {
      videos = await mediathekClient.getByChannel(channel, limit);
    } else {
      videos = await mediathekClient.search(query, {
        size: limit,
        offset,
        sortBy,
        sortOrder,
        duration_min: minDuration,
        duration_max: maxDuration
      });
    }

    // Enrich with IMDB ratings and user ratings
    const enrichedVideos = await Promise.all(
      videos.map(async (video) => {
        const videoId = mediathekClient.generateVideoId(video);
        
        // Get or create video metadata
        let metadata = await prisma.videoMetadata.findUnique({
          where: { videoId }
        });

        if (!metadata) {
          // Try to get IMDB rating
          const omdbData = await omdbClient.searchByTitle(video.title);
          const imdbRating = omdbData ? omdbClient.extractImdbRating(omdbData) : null;
          
          metadata = await prisma.videoMetadata.create({
            data: {
              videoId,
              title: video.title,
              channel: video.channel,
              topic: video.topic,
              description: video.description,
              duration: video.duration,
              imdbRating,
              imdbId: omdbData?.imdbID || null,
              viewCount: 0,
              ratingCount: 0
            }
          });
        }

        return {
          ...video,
          id: videoId,
          metadata
        };
      })
    );

    return NextResponse.json({
      videos: enrichedVideos,
      total: enrichedVideos.length
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
