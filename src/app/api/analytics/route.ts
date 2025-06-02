import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { kv } from '@vercel/kv';
import { checkRateLimit } from '@/lib/rate-limiter';

interface GenerationRecord {
  timestamp: number;
  platform: string;
  description: string;
  titles: string[];
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to continue' },
        { status: 401 }
      );
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(session.user.email, 'settings');
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult;
    }

    const userKey = `user:${session.user.email}`;
    
    // Parse date range from query parameters
    const url = new URL(req.url);
    const fromDate = url.searchParams.get('from');
    const toDate = url.searchParams.get('to');

    // Fetch user's analytics data
    const [
      historyRaw,
      subscription,
      usage,
      totalGenerations
    ] = await Promise.all([
      kv.lrange(`${userKey}:history`, 0, 49), // Get last 50 generations
      kv.get(`${userKey}:subscription`),
      kv.get(`${userKey}:usage`),
      kv.get(`${userKey}:total_generations`)
    ]);

    // Process history to get platform distribution and patterns
    const platformStats: Record<string, number> = {};
    const commonPatterns: Record<string, number> = {};
    const recentHistory = (historyRaw || [])
      .map(item => JSON.parse(item as string) as GenerationRecord)
      .filter(record => {
        if (!fromDate && !toDate) return true;
        const recordDate = new Date(record.timestamp);
        if (fromDate && new Date(fromDate) > recordDate) return false;
        if (toDate && new Date(toDate) < recordDate) return false;
        return true;
      });

    recentHistory.forEach((record: GenerationRecord) => {
      // Update platform stats
      platformStats[record.platform] = (platformStats[record.platform] || 0) + 1;

      // Analyze titles for common patterns
      record.titles.forEach(title => {
        if (title.includes('[')) {
          const pattern = title.match(/\[(.*?)\]/)?.[0] || '';
          if (pattern) {
            commonPatterns[pattern] = (commonPatterns[pattern] || 0) + 1;
          }
        }
        if (title.includes('How')) {
          commonPatterns['How-to'] = (commonPatterns['How-to'] || 0) + 1;
        }
        if (title.includes('!')) {
          commonPatterns['Exclamation'] = (commonPatterns['Exclamation'] || 0) + 1;
        }
        if (title.includes('?')) {
          commonPatterns['Question'] = (commonPatterns['Question'] || 0) + 1;
        }
      });
    });

    // Get the top patterns
    const topPatterns = Object.entries(commonPatterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    return NextResponse.json({
      history: recentHistory,
      stats: {
        subscription: subscription || 'free',
        currentUsage: usage || 0,
        totalGenerations: totalGenerations || 0,
        platformDistribution: platformStats,
        topPatterns
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to fetch analytics data. Please try again.' },
      { status: 500 }
    );
  }
} 