export interface Trend {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  points: number;
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
  userId: string;
  userEmail: string;
  title: string;
  originalTitle: string;
  category: string;
  tags: string[];
  metrics: {
    [key: string]: number | string;
  };
  imageUrl?: string;
  timestamp: number;
}

export interface UserReputation {
  userId: string;
  points: number;
  trendsSpotted: number;
  successfulPosts: number;
  timestamp: number;
} 