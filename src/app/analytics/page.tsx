'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Download } from 'lucide-react';
import Script from 'next/script';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface GenerationRecord {
  timestamp: number;
  platform: string;
  description: string;
  titles: string[];
}

interface AnalyticsData {
  history: GenerationRecord[];
  stats: {
    subscription: string;
    currentUsage: number;
    totalGenerations: number;
    platformDistribution: Record<string, number>;
    topPatterns: Record<string, number>;
  };
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export default function AnalyticsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange.from) {
          params.append('from', dateRange.from.toISOString());
        }
        if (dateRange.to) {
          params.append('to', dateRange.to.toISOString());
        }

        const response = await fetch(`/api/analytics?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError('Unable to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchAnalytics();
    }
  }, [session, dateRange]);

  const handleExport = () => {
    if (!data) return;

    const csvContent = [
      ['Timestamp', 'Platform', 'Description', 'Generated Titles'],
      ...data.history.map((record) => [
        new Date(record.timestamp).toISOString(),
        record.platform,
        record.description,
        record.titles.join(' | '),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'title-generation-history.csv';
    link.click();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <Button onClick={() => router.push('/')}>Back to Generator</Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const platformChartData = {
    labels: Object.keys(data.stats.platformDistribution),
    datasets: [
      {
        label: 'Generations by Platform',
        data: Object.values(data.stats.platformDistribution),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const patternsChartData = {
    labels: Object.keys(data.stats.topPatterns),
    datasets: [
      {
        label: 'Title Patterns',
        data: Object.values(data.stats.topPatterns),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  return (
    <>
      <Script
        id="schema-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Analytics Dashboard',
            description: 'Track your title generation patterns, usage statistics, and performance metrics.',
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: 'https://youtubetitle.tool',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Analytics',
                  item: 'https://youtubetitle.tool/analytics',
                },
              ],
            },
          }),
        }}
      />
      <main className="min-h-screen p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
              <p className="text-gray-400">Track your title generation patterns and usage</p>
            </motion.div>

            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} -{' '}
                          {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    initialFocus
                    mode="range"
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range: any) => setDateRange(range)}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Button
                onClick={handleExport}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Overview Card */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Overview</CardTitle>
                <CardDescription className="text-gray-400">Your generation stats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Subscription Type</p>
                    <p className="text-2xl font-bold text-white capitalize">{data.stats.subscription}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Generations</p>
                    <p className="text-2xl font-bold text-white">{data.stats.totalGenerations}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Current Period Usage</p>
                    <p className="text-2xl font-bold text-white">{data.stats.currentUsage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Distribution Card */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Platform Distribution</CardTitle>
                <CardDescription className="text-gray-400">Where you generate most</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <Bar
                    data={platformChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                          grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        },
                        x: {
                          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                          grid: { display: false },
                        },
                      },
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Top Patterns Card */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Top Patterns</CardTitle>
                <CardDescription className="text-gray-400">Most successful title patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <Pie
                    data={patternsChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                              size: 11,
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent History */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Generations</CardTitle>
              <CardDescription className="text-gray-400">Your latest title generations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.history.slice(0, 5).map((record, index) => (
                  <motion.div
                    key={record.timestamp}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 bg-white/5 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-gray-400 capitalize">{record.platform}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">"{record.description}"</p>
                    <div className="space-y-1">
                      {record.titles.map((title, i) => (
                        <p key={i} className="text-white text-sm">{title}</p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
} 