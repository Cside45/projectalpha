import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Trend, UserReputation } from '@/types/trends';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { value } = await req.json();
    if (typeof value !== 'number' || ![1, -1].includes(value)) {
      return NextResponse.json(
        { error: 'Invalid vote value' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const trendId = params.id;
    const voteKey = `votes:${trendId}:${userId}`;

    // Check if user has already voted
    const existingVote = await kv.get<number>(voteKey);
    if (existingVote === value) {
      return NextResponse.json(
        { error: 'You have already voted' },
        { status: 400 }
      );
    }

    // Get trend data
    const trendData = await kv.get<Trend>(`trend:${trendId}`);
    if (!trendData) {
      return NextResponse.json(
        { error: 'Trend not found' },
        { status: 404 }
      );
    }

    // Calculate new points
    let pointsChange = value;
    if (existingVote) {
      // If changing vote, need to reverse the old vote
      pointsChange = value - existingVote;
    }

    const updatedTrend: Trend = {
      ...trendData,
      points: trendData.points + pointsChange,
      votes: trendData.votes + (existingVote ? 0 : 1),
    };

    // Update trend
    await kv.set(`trend:${trendId}`, updatedTrend);

    // Update trend in sorted set
    await kv.zadd('trends:points', {
      score: updatedTrend.points,
      member: trendId,
    });

    // Store the vote
    await kv.set(voteKey, value);

    // Update user reputation for the trend submitter
    const submitterKey = `user:${trendData.submittedBy}:reputation`;
    const submitterReputation = await kv.get<UserReputation>(submitterKey);

    if (submitterReputation) {
      submitterReputation.points += pointsChange;
      await kv.set(submitterKey, submitterReputation);
    }

    return NextResponse.json({ trend: updatedTrend });
  } catch (error) {
    console.error('Failed to vote on trend:', error);
    return NextResponse.json(
      { error: 'Failed to vote on trend' },
      { status: 500 }
    );
  }
} 