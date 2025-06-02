'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const tips = [
  {
    title: 'Be Specific About Your Content',
    description: 'Instead of "gaming video", try "Minecraft survival challenge video with unique building techniques".',
    examples: [
      '❌ Cooking video about pasta',
      '✅ Italian homemade fettuccine recipe with traditional sauce techniques',
    ],
  },
  {
    title: 'Include Target Audience',
    description: 'Specify who your content is for to get more relevant titles.',
    examples: [
      '❌ How to invest money',
      '✅ Investment strategies for college students on a tight budget',
    ],
  },
  {
    title: 'Mention Key Features or Benefits',
    description: 'Highlight what makes your content unique or valuable.',
    examples: [
      '❌ Workout routine video',
      '✅ 15-minute low-impact HIIT workout for joint health and weight loss',
    ],
  },
  {
    title: 'Add Emotional Appeal',
    description: 'Include the emotional response or transformation viewers can expect.',
    examples: [
      '❌ Room cleaning tutorial',
      '✅ Life-changing room organization secrets for instant calm and productivity',
    ],
  },
  {
    title: 'Specify Content Format',
    description: 'Mention if it\'s a tutorial, review, reaction, challenge, etc.',
    examples: [
      '❌ New phone video',
      '✅ Honest review of iPhone 15 Pro after 3 months of daily use',
    ],
  },
];

const platforms = [
  {
    name: 'YouTube',
    tips: [
      'Include searchable keywords',
      'Front-load important words',
      'Keep titles under 60 characters',
      'Use numbers when relevant',
      'Consider adding year for evergreen content',
    ],
  },
  {
    name: 'Instagram',
    tips: [
      'Use relevant emojis',
      'Include trending hashtags',
      'Keep it concise',
      'Use action words',
      'Add personality',
    ],
  },
  {
    name: 'TikTok',
    tips: [
      'Use trending sounds/phrases',
      'Be conversational',
      'Add relevant emojis',
      'Keep it short and catchy',
      'Use popular hashtags',
    ],
  },
];

export default function GuidePage() {
  return (
    <main className="min-h-screen p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Writing Effective Title Prompts
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Learn how to write prompts that generate engaging, click-worthy titles
            for your content across different platforms.
          </p>
        </motion.div>

        {/* General Tips */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Writing Better Prompts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">{tip.title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {tip.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {tip.examples.map((example) => (
                        <p key={example} className="text-gray-300 font-mono text-sm">
                          {example}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Platform-Specific Tips */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Platform-Specific Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">{platform.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {platform.tips.map((tip) => (
                        <li key={tip} className="text-gray-300 text-sm">
                          • {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
} 