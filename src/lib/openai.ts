import { OpenAI } from 'openai';

// Single OpenAI instance
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Standardized platform prompts
export const platformPrompts = {
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

export interface GenerateTitleParams {
  description: string;
  platform: 'youtube' | 'instagram' | 'tiktok';
  targetAudience?: string;
}

export async function generateTitles({ description, platform, targetAudience }: GenerateTitleParams) {
  const prompt = `Generate 5 highly engaging, modern titles for a ${platform} video about: "${description}"${
    targetAudience ? ` targeting ${targetAudience}` : ''
  }.

${platformPrompts[platform]}

Additional requirements:
1. Focus on current algorithm preferences
2. Use patterns from viral content
3. Optimize for click-through rate while maintaining authenticity
4. Include keywords naturally without stuffing
5. Each title should follow a different viral pattern

Format the response as a simple array of strings, with no additional explanation or commentary.`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert social media strategist who deeply understands ${platform}'s current algorithm and trending patterns. You create titles that drive high engagement while maintaining authenticity.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.8,
      max_tokens: 300,
    });

    const titles = completion.choices[0].message.content
      ?.split('\n')
      .filter((title: string) => title.trim())
      .map((title: string) => title.replace(/^["']|["']$/g, '').trim())
      .filter((title: string) => {
        const isValid = 
          title.length > 3 &&
          !/^\[+$/.test(title) &&
          !/^\d+\./.test(title) &&
          !/^-/.test(title) &&
          !title.includes('2024');
        return isValid;
      })
      .slice(0, 5);

    if (!titles || titles.length < 5) {
      throw new Error('Failed to generate sufficient valid titles');
    }

    return {
      titles,
      usage: completion.usage,
    };
  } catch (error) {
    console.error('Error generating titles:', error);
    throw new Error('Failed to generate titles');
  }
} 