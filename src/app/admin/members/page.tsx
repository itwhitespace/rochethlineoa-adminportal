'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  UserX,
  Eye,
  X,
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Pencil,
  Trash2
} from 'lucide-react';
import { getDatabaseClient, isDatabaseConfigured } from '@/lib/database';
import { DashboardService } from '@/lib/dashboardService';
import { MemberAnalytics, ContentLeaderboard } from '@/lib/types';

export default function MembersPage() {
  const [members, setMembers] = useState<MemberAnalytics[]>([]);
  const [contentList, setContentList] = useState<ContentLeaderboard[]>([]);
  
  // Query States
  const [search, setSearch] = useState('');
  const [contentFilter, setContentFilter] = useState('');
  const [occupationFilter, setOccupationFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  
  // Response Stats
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Selected user for details modal
  const [selectedUser, setSelectedUser] = useState<MemberAnalytics | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const fetchData = async (
    pageNum: number = page, 
    searchStr: string = search, 
    filterStr: string = contentFilter,
    occFilter: string = occupationFilter,
    specFilter: string = specialtyFilter
  ) => {
    try {
      const [membersRes, contentRes] = await Promise.all([
        DashboardService.getMembersList(searchStr, filterStr, pageNum, limit, 'Confirmed', occFilter, specFilter),
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
    fetchData(1, search, contentFilter, occupationFilter, specialtyFilter);
    setPage(1);
  }, [search, contentFilter, occupationFilter, specialtyFilter]);

  useEffect(() => {
    fetchData(page, search, contentFilter, occupationFilter, specialtyFilter);
  }, [page]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(page, search, contentFilter, occupationFilter, specialtyFilter);
  };

  const handleCopyId = (userId: string) => {
    navigator.clipboard.writeText(userId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDeleteMember = async (userId: string, name: string) => {
    if (confirm(`Are you sure you want to delete member: ${name}?`)) {
      try {
        if (isDatabaseConfigured()) {
          const database = getDatabaseClient();
          if (database) {
            await database.from('members').delete().eq('user_id', userId);
          }
        }
        alert(`Member ${name} deleted successfully`);
        handleRefresh();
      } catch (error) {
        console.error('Failed to delete member', error);
        alert('Failed to delete member');
      }
    }
  };

  const handleEditMember = (userId: string) => {
    alert(`Edit functionality for member ID: ${userId} will be implemented in the modal.`);
    // TODO: Open edit modal
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
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  // Predefined filter options based on mock data
  const occupationsList = ['Doctor', 'Nurse', 'Pharmacist', 'Hospital/Clinic Officer'];
  const specialtiesList = ['Oncology', 'Hematology', 'General Medicine', 'Immunology', 'Cardiology'];

  return (
    <>
      <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-5 dark:border-zinc-900">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Members (Registered Users)
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            List of registered LINE OA members who have successfully completed registration.
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

      {/* Advanced Filters Toolbar */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <Filter className="h-4.5 w-4.5 text-zinc-500" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Advanced Filters</h3>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Search User
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, ID, or email..."
                className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-sm outline-none transition-all focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Filter by Content */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Last Visited Content
            </label>
            <select
              value={contentFilter}
              onChange={(e) => setContentFilter(e.target.value)}
              className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-2 px-3 text-sm outline-none cursor-pointer focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            >
              <option value="">All Content</option>
              {contentList.map(c => (
                <option key={c.contentId} value={c.contentId}>{c.contentId}</option>
              ))}
            </select>
          </div>

          {/* Filter by Occupation */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Occupation
            </label>
            <select
              value={occupationFilter}
              onChange={(e) => setOccupationFilter(e.target.value)}
              className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-2 px-3 text-sm outline-none cursor-pointer focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            >
              <option value="">All Occupations</option>
              {occupationsList.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          {/* Filter by Specialty */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Specialty
            </label>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/55 py-2 px-3 text-sm outline-none cursor-pointer focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            >
              <option value="">All Specialties</option>
              {specialtiesList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters helper */}
        {(search || contentFilter || occupationFilter || specialtyFilter) && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSearch('');
                setContentFilter('');
                setOccupationFilter('');
                setSpecialtyFilter('');
              }}
              className="text-xs font-semibold text-red-500 hover:underline dark:text-red-400"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
            <thead className="bg-zinc-50/50 text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Occupation & Specialty</th>
                <th className="px-6 py-4">Last Visited Content</th>
                <th className="px-6 py-4">Registered At</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
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
                    {/* Profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                          {member.picture_url ? (
                            <img
                              src={member.picture_url}
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
                              : member.display_name || 'Unspecified LINE User'}
                          </p>
                          <p className="font-mono text-[10px] text-zinc-400 truncate max-w-32" title={member.user_id}>
                            {member.user_id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
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
                          <p className="text-zinc-900 dark:text-white font-medium">{member.occupation}</p>
                          <p className="text-xs font-semibold text-zinc-400">
                            {member.specialty} • {member.organization || 'Unspecified Org'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-xs italic">No registration details</span>
                      )}
                    </td>

                    {/* Latest visited content */}
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
                          <p className="truncate max-w-40 font-mono text-[11px] text-zinc-400" title={member.latest_target || ''}>
                            {member.latest_target}
                          </p>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-xs italic">No click history</span>
                      )}
                    </td>

                    {/* Registered at */}
                    <td className="px-6 py-4 font-medium text-xs">
                      {formatDate(member.registered_at)}
                    </td>

                    {/* Action Button */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(member);
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-500 shadow-xs hover:bg-zinc-50 hover:text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditMember(member.user_id)}
                          className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-500 shadow-xs hover:bg-zinc-50 hover:text-brand-blue dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-brand-blue"
                          title="Edit Member"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.user_id, member.display_name || 'User')}
                          className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-500 shadow-xs hover:bg-red-50 hover:text-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          title="Delete Member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-zinc-400">
                    <div className="flex flex-col items-center gap-2">
                      <UserX className="h-8 w-8 text-zinc-300" />
                      <span>No members found matching current search/filters</span>
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
              <span className="text-zinc-900 dark:text-white font-semibold">{totalItems}</span> Members
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

      {/* User Details Modal (Centered style) */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Dialog Panel */}
          <div className="relative flex w-full max-w-2xl flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-900 dark:bg-zinc-950 animate-fade-in-up max-h-[90vh] overflow-y-auto z-10">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-900">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Member Profile Details</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Avatar Card */}
            <div className="flex flex-col items-center gap-4 py-6 border-b border-zinc-100 dark:border-zinc-900">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-emerald-500/30 overflow-hidden shadow-sm">
                {selectedUser.picture_url ? (
                  <img
                    src={selectedUser.picture_url}
                    alt={selectedUser.display_name || 'User'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-zinc-400">
                    {getInitials(selectedUser.display_name)}
                  </span>
                )}
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  {selectedUser.first_name && selectedUser.last_name 
                    ? `${selectedUser.first_name} ${selectedUser.last_name}` 
                    : selectedUser.display_name || 'Unspecified LINE User'}
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">LINE Display Name: {selectedUser.display_name || '-'}</p>
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/50 mt-2">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Register (Confirmed)</span>
                </span>
              </div>
            </div>

            {/* Info Sections */}
            <div className="flex-1 py-6 space-y-6">
              
              {/* LINE Info */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">LINE Platform Data</h5>
                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-900/50 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-medium">LINE User ID</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] text-zinc-900 dark:text-white bg-white border border-zinc-200 px-2 py-0.5 rounded dark:bg-zinc-900 dark:border-zinc-800">
                        {selectedUser.user_id}
                      </span>
                      <button
                        onClick={() => handleCopyId(selectedUser.user_id)}
                        className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500"
                        title="Copy User ID"
                      >
                        {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-medium">Registration Date</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{formatDate(selectedUser.registered_at)}</span>
                  </div>
                </div>
              </div>

              {/* Registration/Demographics Details */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Registration Form Details</h5>
                <div className="rounded-lg border border-zinc-200/60 p-4 dark:border-zinc-900 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-2.5">
                      <User className="h-4.5 w-4.5 text-zinc-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase">Occupation</p>
                        <p className="text-xs font-bold text-zinc-850 dark:text-white">{selectedUser.occupation || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Building className="h-4.5 w-4.5 text-zinc-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase">Specialty</p>
                        <p className="text-xs font-bold text-zinc-850 dark:text-white">{selectedUser.specialty || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                    <div className="flex items-start gap-2.5">
                      <Building className="h-4.5 w-4.5 text-zinc-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase">Organization / Hospital</p>
                        <p className="text-xs font-bold text-zinc-850 dark:text-white">{selectedUser.organization || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                    <div className="flex items-start gap-2.5">
                      <Mail className="h-4.5 w-4.5 text-zinc-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase">Email Address</p>
                        <p className="text-xs font-bold text-zinc-850 dark:text-white truncate max-w-32" title={selectedUser.email || ''}>
                          {selectedUser.email || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Phone className="h-4.5 w-4.5 text-zinc-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase">Phone Number</p>
                        <p className="text-xs font-bold text-zinc-850 dark:text-white">{selectedUser.phone || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Latest Clicks and Tracking link activity */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Latest Clicks & Activity</h5>
                <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900/50 space-y-3">
                  {selectedUser.latest_content_id ? (
                    <>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 font-medium">Content ID</span>
                        <span className="inline-block font-mono text-[10px] font-bold bg-brand-blue/15 text-brand-blue px-2 py-0.5 rounded dark:bg-emerald-950/40 dark:text-emerald-400">
                          {selectedUser.latest_content_id}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 font-medium">Last Clicked Path</span>
                        <span className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold">{selectedUser.latest_target}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 font-medium">Activity Timestamp</span>
                        <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{formatDate(selectedUser.latest_click_at)}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-zinc-400 text-center italic py-2">No click activity tracked yet.</p>
                  )}
                </div>
              </div>

              {/* Legal & Consent Policy Logs */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Consent Policy Audit Logs</h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-250/50 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <span className="text-zinc-500 font-medium">Privacy Consent</span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Agreed</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-250/50 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <span className="text-zinc-500 font-medium">Data Processing</span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Agreed</span>
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
}
