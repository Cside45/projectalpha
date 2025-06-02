import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { kv } from '@vercel/kv';
import { UserReputation } from '@/types/trends';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to continue' },
        { status: 401 }
      );
    }

    const userReputationKey = `users:${session.user.email}:reputation`;
    const reputation = await kv.get<UserReputation>(userReputationKey) || {
      points: 0,
      trendsSpotted: 0,
      successfulPosts: 0,
      badges: [],
      lastContribution: 0,
    };

    // Get user's trends and success stories counts
    const userTrendsKey = `users:${session.user.email}:trends`;
    const userStoriesKey = `users:${session.user.email}:stories`;

    const [trendsCount, storiesCount] = await Promise.all([
      kv.scard(userTrendsKey),
      kv.scard(userStoriesKey),
    ]);

    return NextResponse.json({
      reputation,
      stats: {
        trendsCount,
        storiesCount,
      },
    });
  } catch (error) {
    console.error('Error fetching user reputation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user reputation' },
      { status: 500 }
    );
  }
} 