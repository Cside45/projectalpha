import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { kv } from '@vercel/kv';
import { checkRateLimit } from '@/lib/rate-limiter';

interface UserSettings {
  defaultPlatform: 'youtube' | 'instagram' | 'tiktok';
  emailNotifications: boolean;
  customPromptPreferences: {
    includeEmojis: boolean;
    includeBrackets: boolean;
    useHashtags: boolean;
  };
  language: string;
}

const defaultSettings: UserSettings = {
  defaultPlatform: 'youtube',
  emailNotifications: true,
  customPromptPreferences: {
    includeEmojis: true,
    includeBrackets: true,
    useHashtags: true,
  },
  language: 'en',
};

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to continue' },
        { status: 401 }
      );
    }

    const userKey = `user:${session.user.email}`;
    const settings = await kv.get(`${userKey}:settings`);

    return NextResponse.json(settings || defaultSettings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to fetch settings. Please try again.' },
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

    // Check rate limit
    const rateLimitResult = await checkRateLimit(session.user.email, 'settings');
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult;
    }

    const settings = await req.json();
    const userKey = `user:${session.user.email}`;

    // Validate settings
    if (!settings.defaultPlatform || !['youtube', 'instagram', 'tiktok'].includes(settings.defaultPlatform)) {
      return NextResponse.json(
        { error: 'Invalid platform selection' },
        { status: 400 }
      );
    }

    if (typeof settings.emailNotifications !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid email notification setting' },
        { status: 400 }
      );
    }

    if (!settings.customPromptPreferences || 
        typeof settings.customPromptPreferences.includeEmojis !== 'boolean' ||
        typeof settings.customPromptPreferences.includeBrackets !== 'boolean' ||
        typeof settings.customPromptPreferences.useHashtags !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid prompt preferences' },
        { status: 400 }
      );
    }

    if (!settings.language || typeof settings.language !== 'string') {
      return NextResponse.json(
        { error: 'Invalid language selection' },
        { status: 400 }
      );
    }

    // Save settings
    await kv.set(`${userKey}:settings`, settings);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to save settings. Please try again.' },
      { status: 500 }
    );
  }
} 