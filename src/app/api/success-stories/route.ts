import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';
import { SuccessStory, UserReputation } from '@/types/trends';
import { uploadImage } from '@/lib/cloudinary';

const SUCCESS_STORIES_KEY = 'success:list';
const getSuccessStoryKey = (id: string) => `success:${id}`;
const getUserStoriesKey = (userId: string) => `users:${userId}:stories`;

export async function GET() {
  try {
    // Get all story IDs from the sorted set
    const storyIds = await kv.zrange<string[]>(SUCCESS_STORIES_KEY, 0, -1);
    
    if (!storyIds.length) {
      return NextResponse.json({ stories: [] });
    }

    // Get all stories data using pipeline
    const storyKeys = storyIds.map(id => getSuccessStoryKey(id));
    const stories = await kv.mget<SuccessStory[]>(...storyKeys);
    
    return NextResponse.json({ 
      stories: stories.filter(Boolean).sort((a, b) => b.timestamp - a.timestamp)
    });
  } catch (error) {
    console.error('Error fetching success stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch success stories' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to continue' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const originalTitle = formData.get('originalTitle') as string;
    const category = formData.get('category') as string;
    const tags = JSON.parse(formData.get('tags') as string) as string[];
    const metrics = JSON.parse(formData.get('metrics') as string);
    const imageFile = formData.get('image') as File | null;

    if (!title || !originalTitle || !category || !metrics) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let imageUrl: string | undefined;
    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      imageUrl = await uploadImage(buffer, 'success-stories');
    }

    const storyId = nanoid();
    const story: SuccessStory = {
      id: storyId,
      title,
      originalTitle,
      metrics,
      category,
      userId: session.user.email,
      userEmail: session.user.email,
      imageUrl,
      timestamp: Date.now(),
      tags: tags || [],
    };

    // Store story data
    await kv.set(getSuccessStoryKey(storyId), story);
    
    // Add to sorted set for chronological listing
    await kv.zadd(SUCCESS_STORIES_KEY, {
      score: Date.now(),
      member: storyId,
    });

    // Add to user's stories list
    await kv.sadd(getUserStoriesKey(session.user.email), storyId);

    // Update user reputation
    const userReputationKey = `users:${session.user.email}:reputation`;
    const existingReputation = await kv.get<UserReputation>(userReputationKey);
    
    const reputation: UserReputation = {
      points: (existingReputation?.points || 0) + 10,
      trendsSpotted: existingReputation?.trendsSpotted || 0,
      successfulPosts: (existingReputation?.successfulPosts || 0) + 1,
      badges: existingReputation?.badges || [],
      lastContribution: Date.now(),
    };

    // Add badges based on success metrics
    if (metrics.views7d && metrics.views7d > 10000 && !reputation.badges.includes('Viral Success')) {
      reputation.badges.push('Viral Success');
    }
    if (metrics.ctr && metrics.ctr > 15 && !reputation.badges.includes('CTR Master')) {
      reputation.badges.push('CTR Master');
    }

    await kv.set(userReputationKey, reputation);

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Error creating success story:', error);
    return NextResponse.json(
      { error: 'Failed to create success story' },
      { status: 500 }
    );
  }
} 