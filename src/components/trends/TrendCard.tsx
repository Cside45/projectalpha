'use client';

import { useState } from 'react';
import { Trend } from '@/types/trends';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

interface TrendCardProps {
  trend: Trend;
  onVote?: (trendId: string, value: 1 | -1) => Promise<void>;
}

export function TrendCard({ trend, onVote }: TrendCardProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (value: 1 | -1) => {
    if (!session) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to vote on trends.',
        variant: 'destructive',
      });
      return;
    }

    if (isVoting) return;

    try {
      setIsVoting(true);
      if (onVote) {
        await onVote(trend.id, value);
      }
      toast({
        title: 'Vote recorded',
        description: 'Your vote has been recorded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record your vote. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{trend.title}</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDistanceToNow(trend.timestamp, { addSuffix: true })}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {trend.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{trend.description}</p>
        {trend.imageUrl && (
          <div className="relative h-48 w-full overflow-hidden rounded-md">
            <Image
              src={trend.imageUrl}
              alt={trend.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex items-center space-x-4">
          <Badge>{trend.category}</Badge>
          <span className="text-sm text-muted-foreground">
            by {trend.submittedBy}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote(1)}
              disabled={isVoting}
            >
              <ThumbsUp className="mr-1 h-4 w-4" />
              Upvote
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote(-1)}
              disabled={isVoting}
            >
              <ThumbsDown className="mr-1 h-4 w-4" />
              Downvote
            </Button>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium">
              🔥 {trend.points > 0 ? trend.points : 0}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
} 