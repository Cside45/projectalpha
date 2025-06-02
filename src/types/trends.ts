export interface Trend {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  score: number;
  votes: number;
  submittedBy: string;
  timestamp: number;
}

export interface TrendVote {
  trendId: string;
  userId: string;
  value: 1 | -1;
  timestamp: number;
}

export interface SuccessStory {
  id: string;
  trendId: string;
  userId: string;
  title: string;
  description: string;
  metrics: {
    views: number;
    likes: number;
    ctr: number;
  };
  timestamp: number;
}

export interface UserReputation {
  userId: string;
  score: number;
  badges: string[];
  trendsSubmitted: number;
  successStories: number;
  timestamp: number;
} 