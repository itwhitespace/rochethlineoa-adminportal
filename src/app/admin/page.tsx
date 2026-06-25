'use client';

import { useState, useEffect } from 'react';
import { 
  MousePointerClick, 
  Users, 
  Award, 
  TrendingUp, 
  UserCheck, 
  Clock, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { DashboardService } from '@/lib/dashboardService';
import { DashboardStats, TargetTraffic, ContentLeaderboard } from '@/lib/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [targetTraffic, setTargetTraffic] = useState<TargetTraffic[]>([]);
  const [leaderboard, setLeaderboard] = useState<ContentLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [s, t, l] = await Promise.all([
        DashboardService.getDashboardStats(),
        DashboardService.getTargetTraffic(),
        DashboardService.getContentLeaderboard()
      ]);
      setStats(s);
      setTargetTraffic(t.slice(0, 5)); // show top 5
      setLeaderboard(l.slice(0, 5)); // show top 5
    } catch (error) {
      console.error('Error fetching dashboard overview data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        
        {/* KPI Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse" />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse" />
          <div className="h-80 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse" />
        </div>
      </div>
    );
  }

  // Colors for Pie Chart
  const COLORS = ['#0055ff', '#10b981', '#3b82f6', '#f59e0b', '#6366f1'];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            System Overview
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Analyze campaign performance and LINE OA member tracking URL engagement.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1: Total Clicks */}
        <div className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-xs transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Clicks Tracking
            </span>
            <div className="rounded-lg bg-zinc-50 p-2 text-zinc-600 group-hover:bg-brand-blue/10 group-hover:text-brand-blue dark:bg-zinc-800 dark:text-zinc-400 transition-colors">
              <MousePointerClick className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {stats?.totalClicks.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-zinc-500">Visits</span>
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Total click logs logged across all generated tracking links
          </p>
        </div>

        {/* Card 2: Total Users */}
        <div className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-xs transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Active Users
            </span>
            <div className="rounded-lg bg-zinc-50 p-2 text-zinc-600 group-hover:bg-brand-blue/10 group-hover:text-brand-blue dark:bg-zinc-800 dark:text-zinc-400 transition-colors">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {stats?.totalUsers.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-zinc-500">Members</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <UserCheck className="h-3 w-3 text-emerald-500" />
              Confirmed: {stats?.totalConfirmed}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" />
              Pending: {stats?.totalPending}
            </span>
          </div>
        </div>

        {/* Card 3: Top Performing Content */}
        <div className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-xs transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Top Performing Content
            </span>
            <div className="rounded-lg bg-zinc-55 p-2 text-zinc-600 group-hover:bg-brand-blue/10 group-hover:text-brand-blue dark:bg-zinc-800 dark:text-zinc-400 transition-colors">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-mono text-xl font-bold tracking-tight text-brand-blue dark:text-emerald-400">
              {stats?.topContentId}
            </span>
            <div className="mt-1 flex items-baseline gap-1.5 text-zinc-900 dark:text-white">
              <span className="text-lg font-semibold">{stats?.topContentClicks}</span>
              <span className="text-xs font-medium text-zinc-500">clicks</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Content ID with the highest engagement
          </p>
        </div>
      </div>

      {/* Analytics Charts Preview */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Left: Traffic by Campaign (Bar Chart) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                Top Performing Campaigns
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Share of click logs across the top 5 campaigns
              </p>
            </div>
            <Link 
              href="/admin/content-analytics" 
              className="flex items-center text-xs font-semibold text-brand-blue hover:underline dark:text-emerald-400"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          
          <div className="h-64 w-full">
            {targetTraffic.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={targetTraffic} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="target" 
                    type="category" 
                    width={100} 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#888' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(9, 9, 11, 0.9)', 
                      borderRadius: '8px', 
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="clicks" radius={[0, 4, 4, 0]}>
                    {targetTraffic.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                No click logs tracked yet
              </div>
            )}
          </div>
        </div>

        {/* Right: Top Performing Content Leaderboard */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                Content ID Rankings
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Rankings of the top 5 most engaged content identifiers
              </p>
            </div>
            <Link 
              href="/admin/content-analytics" 
              className="flex items-center text-xs font-semibold text-brand-blue hover:underline dark:text-emerald-400"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {leaderboard.length > 0 ? (
              leaderboard.map((item, index) => (
                <div key={item.contentId} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-400">#{index + 1}</span>
                      <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">{item.contentId}</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <span className="text-zinc-900 dark:text-white">{item.clicks} clicks</span>
                      <span className="text-zinc-400">({item.percentage}%)</span>
                    </div>
                  </div>
                  {/* Minimal progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-brand-blue dark:bg-emerald-500 transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-zinc-400">
                No content rankings available
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
