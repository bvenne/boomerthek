
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { videoId, userId, rating, comment } = await request.json();

    if (!videoId || !userId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating data' },
        { status: 400 }
      );
    }

    // Create or update rating
    const userRating = await prisma.userRating.upsert({
      where: {
        videoId_userId: { videoId, userId }
      },
      update: {
        rating,
        comment,
        updatedAt: new Date()
      },
      create: {
        videoId,
        userId,
        rating,
        comment
      }
    });

    // Update video metadata with new average rating
    const ratings = await prisma.userRating.findMany({
      where: { videoId },
      select: { rating: true }
    });

    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    
    await prisma.videoMetadata.update({
      where: { videoId },
      data: {
        avgRating,
        ratingCount: ratings.length
      }
    });

    return NextResponse.json({ success: true, rating: userRating });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const userId = searchParams.get('userId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID required' },
        { status: 400 }
      );
    }

    const ratings = await prisma.userRating.findMany({
      where: { videoId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const userRating = userId ? await prisma.userRating.findUnique({
      where: {
        videoId_userId: { videoId, userId }
      }
    }) : null;

    return NextResponse.json({
      ratings,
      userRating
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}
