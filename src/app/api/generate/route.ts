import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { kv } from '@vercel/kv';
import { checkRateLimit } from '@/lib/rate-limiter';
import { generateTitles } from '@/lib/openai';

const USAGE_LIMITS = {
  free: 2,
  pay_per_use: 3,
  subscriber: 30,
};

// Helper function to check if usage should be reset (new month)
async function checkAndResetMonthlyUsage(userKey: string) {
  const lastResetDate = await kv.get(`${userKey}:last_reset`);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  if (!lastResetDate) {
    await kv.set(`${userKey}:last_reset`, now.toISOString());
    return;
  }

  const lastReset = new Date(lastResetDate as string);
  if (lastReset.getMonth() !== currentMonth || lastReset.getFullYear() !== currentYear) {
    await Promise.all([
      kv.set(`${userKey}:usage`, 0),
      kv.set(`${userKey}:last_reset`, now.toISOString())
    ]);
  }
}

const platformPrompts = {
  youtube: `Create titles that:
- Use numbers and specific data (e.g., "I Made $10,000 in One Day")
- Include emotional triggers (e.g., "I NEVER Expected This to Happen...")
- Use caps for emphasis on key words
- Add curiosity gaps (e.g., "The Truth About X That Nobody Tells You")
- Keep under 60 characters for optimal display
- Use brackets for context [SHOCKING] or [TUTORIAL]
- Start with action words or "How I/We" for personal touch
- Focus on evergreen appeal rather than temporal references`,

  instagram: `Create Reels titles that:
- Use 3-5 relevant emojis strategically placed
- Include top trending hashtags naturally
- Create curiosity ("Wait for it..." "Plot twist...")
- Use line breaks for readability
- Include calls to action ("Save this!" "Follow for more")
- Keep text concise for mobile viewing
- Use relevant trending audio references
- Add "POV:" or other viral formats when appropriate`,

  tiktok: `Create TikTok captions that:
- Use trending phrases ("Real reason why..." "They didn't tell you...")
- Include 3-5 relevant emojis
- Use popular hashtags like #fyp #viral naturally
- Create suspense ("Watch till the end" "Part 1/3")
- Keep under 150 characters
- Use current trends and audio references
- Include relatable hooks ("What I wish I knew..." "Things they don't tell you...")
- Add POV scenarios when relevant`
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to continue' },
        { status: 401 }
      );
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(session.user.email, 'generate');
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult;
    }

    const { description, platform, targetAudience } = await req.json();

    if (!description) {
      return NextResponse.json(
        { error: 'Please provide a description for your video' },
        { status: 400 }
      );
    }

    if (!platform || !['youtube', 'instagram', 'tiktok'].includes(platform)) {
      return NextResponse.json(
        { error: 'Please select a valid platform' },
        { status: 400 }
      );
    }

    const userKey = `user:${session.user.email}`;
    await checkAndResetMonthlyUsage(userKey);
    
    let subscription, usage;
    try {
      [subscription, usage] = await Promise.all([
        kv.get(`${userKey}:subscription`),
        kv.get(`${userKey}:usage`),
      ]);
    } catch (error) {
      return NextResponse.json(
        { error: 'Unable to check usage. Please try again.' },
        { status: 500 }
      );
    }

    const currentUsage = (usage as number) || 0;
    const userTier = (subscription as string) || 'free';
    const limit = USAGE_LIMITS[userTier as keyof typeof USAGE_LIMITS];

    if (currentUsage >= limit) {
      const isSubscriber = userTier === 'subscriber';
      return NextResponse.json(
        { 
          error: isSubscriber ? 'Monthly generation limit reached' : 'Usage limit reached',
          currentUsage,
          limit,
          needsPayment: !isSubscriber,
          isMonthlyLimit: isSubscriber
        },
        { status: 402 }
      );
    }

    try {
      const { titles, usage: openaiUsage } = await generateTitles({
        description,
        platform,
        targetAudience,
      });

      // Update usage and history
      await Promise.all([
        kv.set(`${userKey}:usage`, currentUsage + 1),
        kv.incr(`${userKey}:total_generations`),
        kv.lpush(`${userKey}:history`, JSON.stringify({
          timestamp: Date.now(),
          platform,
          description,
          titles,
        })),
        // Keep only last 50 generations
        kv.ltrim(`${userKey}:history`, 0, 49)
      ]);

      return NextResponse.json({ 
        titles,
        usage: {
          current: currentUsage + 1,
          limit,
          remaining: Math.max(0, limit - (currentUsage + 1))
        }
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Unable to generate titles. Please try again later.' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
} 