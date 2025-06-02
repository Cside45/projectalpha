import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import { Trend, UserReputation } from '@/types/trends';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const trendIds = await kv.zrange('trends:score', 0, -1, { rev: true });
    const trends: Trend[] = [];

    for (const id of trendIds) {
      const trend = await kv.get<Trend>(`trend:${id}`);
      if (trend) {
        trends.push(trend);
      }
    }

    return NextResponse.json({ trends });
  } catch (error) {
    console.error('Failed to fetch trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const tags = JSON.parse(formData.get('tags') as string) as string[];
    const image = formData.get('image') as File;

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let imageUrl: string | undefined;
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'trends',
              moderation: 'aws_rek', // Enable AWS Rekognition moderation
              notification_url: '/api/cloudinary-moderation-webhook', // Optional: webhook for async moderation results
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(buffer);
        });

        const uploadResult = result as any;

        // Check moderation status
        if (uploadResult.moderation && uploadResult.moderation.status === 'rejected') {
          // Delete the rejected image
          await cloudinary.uploader.destroy(uploadResult.public_id);
          
          return NextResponse.json(
            { error: 'Image rejected due to inappropriate content' },
            { status: 400 }
          );
        }

        imageUrl = uploadResult.secure_url;
      } catch (error) {
        console.error('Image upload/moderation failed:', error);
        return NextResponse.json(
          { error: 'Failed to process image. Please try again or use a different image.' },
          { status: 400 }
        );
      }
    }

    const trendId = nanoid();
    const trend: Trend = {
      id: trendId,
      title,
      description,
      category,
      tags,
      imageUrl,
      score: 0,
      votes: 0,
      submittedBy: session.user.name || 'Anonymous',
      timestamp: Date.now(),
    };

    // Store trend data
    await kv.set(`trend:${trendId}`, trend);

    // Add to sorted set for ranking
    await kv.zadd('trends:score', {
      score: trend.score,
      member: trendId,
    });

    // Update user reputation
    const userId = session.user.id;
    const userKey = `user:${userId}:reputation`;
    const userReputation = await kv.get<UserReputation>(userKey) || {
      userId,
      score: 0,
      badges: [],
      trendsSubmitted: 0,
      successStories: 0,
      timestamp: Date.now(),
    };

    userReputation.trendsSubmitted += 1;
    userReputation.score += 5;
    await kv.set(userKey, userReputation);

    return NextResponse.json({ trend });
  } catch (error) {
    console.error('Failed to create trend:', error);
    return NextResponse.json(
      { error: 'Failed to create trend' },
      { status: 500 }
    );
  }
} 