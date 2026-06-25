'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  UserX
} from 'lucide-react';
import Image from 'next/image';
import { DashboardService } from '@/lib/dashboardService';
import { MemberAnalytics, ContentLeaderboard } from '@/lib/types';

export default function UsersPage() {
  const [members, setMembers] = useState<MemberAnalytics[]>([]);
  const [contentList, setContentList] = useState<ContentLeaderboard[]>([]);
  
  // Query States
  const [search, setSearch] = useState('');
  const [contentFilter, setContentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  
  // Response Stats
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (pageNum: number = page, searchStr: string = search, filterStr: string = contentFilter) => {
    try {
      const [membersRes, contentRes] = await Promise.all([
        DashboardService.getMembersList(searchStr, filterStr, pageNum, limit),
        DashboardService.getContentLeaderboard()
      ]);
      
      setMembers(membersRes.items);
      setTotalItems(membersRes.totalItems);
      setTotalPages(membersRes.totalPages);
      setContentList(contentRes);
    } catch (error) {
      console.error('Error fetching members list:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(1, search, contentFilter);
    setPage(1);
  }, [search, contentFilter]);

  useEffect(() => {
    fetchData(page, search, contentFilter);
  }, [page]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(page, search, contentFilter);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-5 dark:border-zinc-900">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            User List
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Registered LINE members and their latest content access activities.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Table</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Name, Email, User ID, or Organization..."
            className="block w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-3 text-sm outline-none transition-all focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-700"
          />
        </div>

        {/* Dropdown Filter by Content ID */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter by Content:</span>
          </div>
          <select
            value={contentFilter}
            onChange={(e) => setContentFilter(e.target.value)}
            className="block rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none cursor-pointer focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
          >
            <option value="">All</option>
            {contentList.map(c => (
              <option key={c.contentId} value={c.contentId}>{c.contentId}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
            <thead className="bg-zinc-50/50 text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Occupation</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Latest Activity</th>
                <th className="px-6 py-4">Registered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                // Loading inside Table
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8">
                      <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : members.length > 0 ? (
                members.map((member) => (
                  <tr key={member.user_id} className="hover:bg-zinc-50/55 dark:hover:bg-zinc-900/40 transition-colors">
                    {/* User profile with picture */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                          {member.picture_url ? (
                            <img
                              src={member.picture_url || undefined}
                              alt={member.display_name || 'User'}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                              {getInitials(member.display_name)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {member.first_name && member.last_name 
                              ? `${member.first_name} ${member.last_name}` 
                              : member.display_name || 'Unknown Name'}
                          </p>
                          <p className="font-mono text-[10px] text-zinc-400 truncate max-w-32" title={member.user_id}>
                            {member.user_id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact details */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-zinc-900 dark:text-white font-medium">{member.email || '-'}</p>
                        <p className="text-xs font-medium text-zinc-400">{member.phone || '-'}</p>
                      </div>
                    </td>

                    {/* Occupation & Specialty */}
                    <td className="px-6 py-4">
                      {member.occupation ? (
                        <div>
                          <p className="text-zinc-900 dark:text-white font-medium">
                            {member.occupation}
                          </p>
                          <p className="text-xs font-semibold text-zinc-400">
                            {member.specialty} • {member.organization || 'Unspecified Organization'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-xs italic">No details provided</span>
                      )}
                    </td>

                    {/* Registration Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                        member.status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
                      }`}>
                        {member.status === 'Confirmed' ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Confirmed</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>Pending Register</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Latest visited content and target */}
                    <td className="px-6 py-4">
                      {member.latest_content_id ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block font-mono text-[10px] font-bold bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded dark:bg-emerald-950/30 dark:text-emerald-400">
                              {member.latest_content_id}
                            </span>
                            <span className="text-[11px] text-zinc-400" title={formatDate(member.latest_click_at)}>
                              {formatDate(member.latest_click_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <span className="truncate max-w-40 font-mono text-[11px] text-zinc-400" title={member.latest_target || undefined}>
                              {member.latest_target}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-xs italic">No activity recorded</span>
                      )}
                    </td>

                    {/* Created at date */}
                    <td className="px-6 py-4 font-medium text-xs">
                      {formatDate(member.registered_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-zinc-400">
                    <div className="flex flex-col items-center gap-2">
                      <UserX className="h-8 w-8 text-zinc-300" />
                      <span>No members found matching the search query.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {!loading && totalItems > 0 && (
          <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/30 text-xs font-medium text-zinc-500">
            <div>
              Showing <span className="text-zinc-900 dark:text-white font-semibold">{Math.min(totalItems, (page - 1) * limit + 1)}</span> to{' '}
              <span className="text-zinc-900 dark:text-white font-semibold">{Math.min(totalItems, page * limit)}</span> of{' '}
              <span className="text-zinc-900 dark:text-white font-semibold">{totalItems}</span> members
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-1.5 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="text-zinc-500 font-semibold text-xs">
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-1.5 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
