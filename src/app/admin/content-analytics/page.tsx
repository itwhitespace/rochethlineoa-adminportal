'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Target, 
  Layers, 
  ArrowUpRight, 
  PieChart as PieIcon,
  HelpCircle,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react';
import { DashboardService } from '@/lib/dashboardService';
import { TargetTraffic, ContentLeaderboard } from '@/lib/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend 
} from 'recharts';

export default function ContentAnalyticsPage() {
  const [targetTraffic, setTargetTraffic] = useState<TargetTraffic[]>([]);
  const [leaderboard, setLeaderboard] = useState<ContentLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [campaign, setCampaign] = useState('');
  const [eventSource, setEventSource] = useState('');

  const fetchData = async () => {
    try {
      const startISO = startDate ? new Date(startDate).toISOString() : undefined;
      const endISO = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString() : undefined;

      const [t, l] = await Promise.all([
        DashboardService.getTargetTraffic(startISO, endISO, campaign || undefined, eventSource || undefined),
        DashboardService.getContentLeaderboard(startISO, endISO, campaign || undefined, eventSource || undefined)
      ]);
      setTargetTraffic(t);
      setLeaderboard(l);
    } catch (error) {
      console.error('Error fetching content analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, campaign, eventSource]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-80 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse" />
          <div className="h-80 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse" />
        </div>
        <div className="h-96 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse" />
      </div>
    );
  }

  const COLORS = ['#0055ff', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

  const topTarget = targetTraffic[0] || { target: 'N/A', clicks: 0 };
  const topContent = leaderboard[0] || { contentId: 'N/A', clicks: 0 };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-5 dark:border-zinc-900">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Content Analytics
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            In-depth analysis of the most popular Content IDs and Campaign Names.
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

      {/* Filters Toolbar */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60 space-y-4 animate-fade-in-up">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <Filter className="h-4.5 w-4.5 text-zinc-500" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Report Filters</h3>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-2 px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-700"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-2 px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-700"
            />
          </div>

          {/* Campaign Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Campaign Name
            </label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="Search campaign..."
              className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-2 px-3.5 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-700"
            />
          </div>

          {/* Event Source */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Event Source
            </label>
            <select
              value={eventSource}
              onChange={(e) => setEventSource(e.target.value)}
              className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-2 px-3 text-sm outline-none cursor-pointer focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-700"
            >
              <option value="">All</option>
              <option value="Broadcast">Broadcast</option>
              <option value="Richmenu">Richmenu</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button if active */}
        {(startDate || endDate || campaign || eventSource) && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setCampaign('');
                setEventSource('');
              }}
              className="text-xs font-semibold text-red-500 hover:text-red-650 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Analytics Brief Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Target Card */}
        <div className="flex items-center gap-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="rounded-xl bg-brand-blue/10 p-3 text-brand-blue">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Top Performing Campaign</p>
            <p className="mt-1 font-mono text-base font-bold text-zinc-950 dark:text-white truncate max-w-xs md:max-w-md">
              {topTarget.target}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
              <span className="font-semibold text-zinc-900 dark:text-white">{topTarget.clicks} clicks</span>
              <span>•</span>
              <span>Accounting for {topTarget.percentage}% of total traffic</span>
            </div>
          </div>
        </div>

        {/* Top Content ID Card */}
        <div className="flex items-center gap-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-450">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Top Performing Content</p>
            <p className="mt-1 font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
              {topContent.contentId}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
              <span className="font-semibold text-zinc-900 dark:text-white">{topContent.clicks} clicks</span>
              <span>•</span>
              <span>Accounting for {topContent.percentage}% of total traffic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Target Paths Breakdown (Bar Chart) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-zinc-500" />
              <span>Campaign Traffic Distribution</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Comparison of visit counts across campaigns
            </p>
          </div>

          <div className="mt-6 h-72 w-full">
            {targetTraffic.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={targetTraffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                  <XAxis 
                    dataKey="target" 
                    tick={{ fontSize: 10, fill: '#888' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#888' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(9, 9, 11, 0.95)', 
                      borderRadius: '8px', 
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="clicks" radius={[4, 4, 0, 0]}>
                    {targetTraffic.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Right: Content ID Distribution (Pie Chart) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-zinc-500" />
              <span>Content Share</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Distribution of content interest based on visits
            </p>
          </div>

          <div className="mt-6 h-72 w-full">
            {leaderboard.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaderboard}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="clicks"
                    nameKey="contentId"
                  >
                    {leaderboard.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(9, 9, 11, 0.95)', 
                      borderRadius: '8px', 
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leaderboard Table (Complete List) */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 p-6 dark:border-zinc-800">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            Content & Campaign Leaderboard
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Rankings of Content IDs by total click events
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
            <thead className="bg-zinc-50/50 text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Content ID</th>
                <th className="px-6 py-4 text-right">Clicks</th>
                <th className="px-6 py-4">Share Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {leaderboard.map((item, index) => (
                <tr key={item.contentId} className="hover:bg-zinc-50/55 dark:hover:bg-zinc-900/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-zinc-400 text-xs">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-zinc-900 dark:text-white">
                    {item.contentId}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-zinc-900 dark:text-white">
                    {item.clicks.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3.5 max-w-sm">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300 min-w-8 text-xs">{item.percentage}%</span>
                      <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-brand-blue dark:bg-emerald-500 transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-zinc-400">
                    No rankings data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
