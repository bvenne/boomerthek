
import { PrismaClient } from '@prisma/client';
import { MediathekViewClient } from '../lib/mediathek-api';
import { OMDBClient } from '../lib/omdb-api';

const prisma = new PrismaClient();
const mediathekClient = new MediathekViewClient();
const omdbClient = new OMDBClient();

async function main() {
  console.log('Starting database seed...');

  try {
    // Clear existing data
    await prisma.userRating.deleteMany({});
    await prisma.watchlist.deleteMany({});
    await prisma.videoMetadata.deleteMany({});
    
    console.log('Cleared existing data');

    // Fetch sample videos from MediathekViewWeb
    const sampleVideos = await mediathekClient.search('', {
      size: 100,
      sortBy: 'timestamp',
      sortOrder: 'desc',
      duration_min: 1800 // At least 30 minutes
    });

    console.log(`Found ${sampleVideos.length} videos to seed`);

    // Process videos in batches
    const batchSize = 10;
    for (let i = 0; i < sampleVideos.length; i += batchSize) {
      const batch = sampleVideos.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (video) => {
        try {
          const videoId = mediathekClient.generateVideoId(video);
          
          // Try to get IMDB rating
          let imdbRating = null;
          let imdbId = null;
          
          try {
            const omdbData = await omdbClient.searchByTitle(video.title);
            if (omdbData) {
              imdbRating = omdbClient.extractImdbRating(omdbData);
              imdbId = omdbData.imdbID;
            }
          } catch (error) {
            console.log(`Failed to get IMDB data for ${video.title}: ${error}`);
          }
          
          // Create video metadata
          await prisma.videoMetadata.create({
            data: {
              videoId,
              title: video.title,
              channel: video.channel,
              topic: video.topic,
              description: video.description,
              duration: video.duration,
              imdbRating,
              imdbId,
              viewCount: Math.floor(Math.random() * 1000) + 10,
              avgRating: Math.random() * 5,
              ratingCount: Math.floor(Math.random() * 100) + 1
            }
          });
          
          console.log(`Seeded video: ${video.title} (${video.channel})`);
        } catch (error) {
          console.error(`Error seeding video ${video.title}:`, error);
        }
      }));
      
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(sampleVideos.length / batchSize)}`);
    }

    // Create sample user ratings
    const videoMetadata = await prisma.videoMetadata.findMany({
      take: 50
    });

    const userIds = ['user1', 'user2', 'user3', 'user4', 'user5'];
    
    for (const video of videoMetadata) {
      const numRatings = Math.floor(Math.random() * 3) + 1;
      const selectedUsers = userIds.slice(0, numRatings);
      
      for (const userId of selectedUsers) {
        await prisma.userRating.create({
          data: {
            videoId: video.videoId,
            userId,
            rating: Math.floor(Math.random() * 5) + 1,
            comment: Math.random() > 0.5 ? `Great video from ${video.channel}!` : null
          }
        });
      }
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
