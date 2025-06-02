'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { PaymentModal } from '@/components/PaymentModal';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import Script from 'next/script';

interface UsageInfo {
  current: number;
  limit: number;
  remaining: number;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [titles, setTitles] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Load saved form data when component mounts
  useEffect(() => {
    if (status === 'authenticated') {
      const savedDescription = localStorage.getItem('savedDescription');
      const savedTargetAudience = localStorage.getItem('savedTargetAudience');
      const savedPlatform = localStorage.getItem('savedPlatform');
      
      if (savedDescription) {
        setDescription(savedDescription);
        localStorage.removeItem('savedDescription');
      }
      if (savedTargetAudience) {
        setTargetAudience(savedTargetAudience);
        localStorage.removeItem('savedTargetAudience');
      }
      if (savedPlatform) {
        setPlatform(savedPlatform);
        localStorage.removeItem('savedPlatform');
      }
    }
  }, [status]);

  const handleSignIn = () => {
    // Save form data before redirecting to sign in
    localStorage.setItem('savedDescription', description);
    localStorage.setItem('savedTargetAudience', targetAudience);
    localStorage.setItem('savedPlatform', platform);
    signIn('google');
  };

  const handlePayment = async (type: 'pay_per_use' | 'subscription') => {
    try {
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceType: type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to access subscription management');
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to manage subscription');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!session) {
      handleSignIn();
      return;
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          platform,
          targetAudience,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated
          handleSignIn();
          return;
        }
        if (response.status === 402) {
          // Payment required
          toast({
            variant: 'destructive',
            title: 'Usage Limit Reached',
            description: data.isMonthlyLimit
              ? 'You have reached your monthly generation limit. Please try again next month.'
              : 'You have reached your usage limit. Please upgrade your plan to continue.',
          });
          if (!data.isMonthlyLimit) {
            router.push('/pricing');
          }
        } else {
          throw new Error(data.error || 'Failed to generate titles');
        }
        return;
      }

      setTitles(data.titles);
      setUsage(data.usage);
      toast({
        title: 'Titles Generated',
        description: 'Your titles have been generated successfully!',
        variant: 'default'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate titles',
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <>
      <Script
        id="schema-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'YouTube Title Tool',
            description: 'Generate engaging, algorithm-friendly titles for your YouTube, Instagram, and TikTok videos using AI.',
            applicationCategory: 'Content Creation Tool',
            operatingSystem: 'Web Browser',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free tier available with premium options',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '1250',
            },
            featureList: [
              'AI-powered title generation',
              'Multi-platform support (YouTube, Instagram, TikTok)',
              'Analytics and performance tracking',
              'Custom prompt preferences',
              'Export functionality',
            ],
          }),
        }}
      />
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        {/* Add sign out button in the top right */}
        {session && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              onClick={() => signOut()}
              className="text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm"
            >
              Sign Out
            </Button>
          </div>
        )}
        
        <div className="relative container mx-auto px-4 py-24">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF0000] via-[#FF0000] to-purple-400">
                YouTube
              </span>{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Title Tool
              </span>
            </h1>
            <p className="text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Generate algorithm-optimized titles that captivate your audience
            </p>
            {usage && (
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                {usage.remaining === Infinity ? (
                  <span className="text-emerald-400">Pro Plan: Unlimited Generations</span>
                ) : (
                  <span className="text-blue-400">
                    {usage.remaining} generations remaining ({usage.current}/{usage.limit} used)
                  </span>
                )}
              </div>
            )}
            
            {session && (
              <div className="mt-8 max-w-md mx-auto">
                <SubscriptionManager
                  remainingGenerations={usage?.remaining || 0}
                  isSubscriber={usage?.limit === 30}
                  onManageSubscription={handleManageSubscription}
                />
              </div>
            )}
          </motion.div>

          {/* Main Generator Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <div className="backdrop-blur-xl bg-white/10 p-8 rounded-2xl border border-white/20 shadow-2xl">
              <Tabs value={platform} onValueChange={setPlatform} className="mb-8">
                <TabsList className="grid w-full grid-cols-3 p-1 bg-white/5 rounded-xl">
                  <TabsTrigger value="youtube" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                    YouTube
                  </TabsTrigger>
                  <TabsTrigger value="instagram" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                    Instagram
                  </TabsTrigger>
                  <TabsTrigger value="tiktok" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                    TikTok
                  </TabsTrigger>
                </TabsList>
                <TabsContent value={platform} className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      What's your video about?
                    </label>
                    <Input 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="E.g., 'I built a treehouse in 24 hours'"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">
                      Target audience (optional)
                    </label>
                    <Input 
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="E.g., 'DIY enthusiasts, homeowners'"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </div>
                    ) : session ? 'Generate Titles' : 'Sign in to Generate Titles'}
                  </Button>
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Results Section */}
              {titles.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 space-y-6"
                >
                  <h3 className="text-xl font-semibold mb-4 text-gray-200">Generated Titles</h3>
                  <div className="space-y-4">
                    {titles.map((title, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.1 }}
                        className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-colors duration-200"
                      >
                        <p className="font-medium text-gray-200">{title}</p>
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-sm text-gray-400">Click to copy</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(title)}
                            className="text-gray-300 hover:text-white hover:bg-white/10"
                          >
                            Copy
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
        
        {showPaymentModal && (
          <PaymentModal
            onClose={() => setShowPaymentModal(false)}
            onSelectPayment={handlePayment}
          />
        )}
      </main>
    </>
  );
} 