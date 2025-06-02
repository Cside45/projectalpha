'use client';

import { useState, useEffect } from 'react';
import { Trend } from '@/types/trends';
import { TrendCard } from '@/components/trends/TrendCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function TrendsPage() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const response = await fetch('/api/trends');
      const data = await response.json();
      if (response.ok) {
        setTrends(data.trends);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch trends. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (trendId: string, value: 1 | -1) => {
    try {
      const response = await fetch(`/api/trends/${trendId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      const data = await response.json();
      if (response.ok) {
        setTrends(trends.map(trend => 
          trend.id === trendId ? data.trend : trend
        ));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Title Trends</h1>
          <p className="text-muted-foreground mt-2">
            Discover and vote on the latest trending title patterns
          </p>
        </div>
        <Link href="/trends/submit">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Submit Trend
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trends.map((trend) => (
          <TrendCard
            key={trend.id}
            trend={trend}
            onVote={handleVote}
          />
        ))}
        {trends.length === 0 && (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No trends yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to submit a trend!
            </p>
            <Link href="/trends/submit">
              <Button variant="outline">Submit a Trend</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 