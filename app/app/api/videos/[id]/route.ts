
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { mediathekClient } from '@/lib/mediathek-api';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    
    // Get video metadata
    const metadata = await prisma.videoMetadata.findUnique({
      where: { videoId }
    });

    if (!metadata) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Get user ratings
    const userRatings = await prisma.userRating.findMany({
      where: { videoId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Update view count
    await prisma.videoMetadata.update({
      where: { videoId },
      data: { viewCount: { increment: 1 } }
    });

    return NextResponse.json({
      metadata,
      userRatings
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video details' },
      { status: 500 }
    );
  }
}
