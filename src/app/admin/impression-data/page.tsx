'use client';

import { useState, useEffect } from 'react';
import { 
  Eye, 
  Search, 
  Sparkles, 
  Users, 
  Megaphone, 
  FileText,
  Loader2,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { DashboardService } from '@/lib/dashboardService';
import { FlexImpression } from '@/lib/types';

export default function ImpressionDataPage() {
  const [impressions, setImpressions] = useState<FlexImpression[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [occupationFilter, setOccupationFilter] = useState('All');
  const [campaignFilter, setCampaignFilter] = useState('All');
  
  // Sort State
  const [sortAsc, setSortAsc] = useState(false);

  // Get unique campaigns list
  const uniqueCampaignsList = Array.from(
    new Set(impressions.map(imp => imp.campaign_name).filter(Boolean))
  );

  // Load Impressions
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await DashboardService.getFlexImpressions();
        setImpressions(data);
      } catch (err) {
        console.error('Failed to load impressions:', err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Filtered Impressions
  const filteredImpressions = impressions.filter(imp => {
    // 1. Search filter (Campaign Name, Content ID, Member Name, User ID, Organization)
    const matchesSearch = search === '' || 
      (imp.campaign_name && imp.campaign_name.toLowerCase().includes(search.toLowerCase())) ||
      (imp.content_id && imp.content_id.toLowerCase().includes(search.toLowerCase())) ||
      (imp.display_name && imp.display_name.toLowerCase().includes(search.toLowerCase())) ||
      (imp.first_name && imp.first_name.toLowerCase().includes(search.toLowerCase())) ||
      (imp.last_name && imp.last_name.toLowerCase().includes(search.toLowerCase())) ||
      (imp.user_id && imp.user_id.toLowerCase().includes(search.toLowerCase())) ||
      (imp.organization && imp.organization.toLowerCase().includes(search.toLowerCase()));

    // 2. Occupation filter
    const matchesOccupation = occupationFilter === 'All' || imp.occupation === occupationFilter;

    // 3. Campaign filter
    const matchesCampaign = campaignFilter === 'All' || imp.campaign_name === campaignFilter;

    return matchesSearch && matchesOccupation && matchesCampaign;
  });

  // Sorted Impressions
  const sortedImpressions = [...filteredImpressions].sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return sortAsc ? timeA - timeB : timeB - timeA;
  });

  // Calculate Statistics
  const totalImpressions = filteredImpressions.length;
  const uniqueUsers = new Set(filteredImpressions.map(imp => imp.user_id)).size;
  const uniqueCampaigns = new Set(filteredImpressions.map(imp => imp.campaign_name).filter(Boolean)).size;

  // Helper to format date nicely
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Eye className="h-6 w-6 text-brand-blue" />
          Impression Data
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          ข้อมูลการเปิดอ่านหรือเปิดหน้าต่างคอนเทนต์ผ่านข้อความ LINE Flex Message ที่ส่งหาผู้ดูแลระบบหรือสมาชิก
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Total Impressions */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">จำนวนการเปิดดูทั้งหมด</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-0.5">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-zinc-400" /> : totalImpressions}
            </p>
          </div>
        </div>

        {/* Unique Openers */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">ผู้เปิดใช้งานจริง (ไม่ซ้ำคน)</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-0.5">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-zinc-400" /> : uniqueUsers}
            </p>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">จำนวนแคมเปญที่เคลื่อนไหว</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-0.5">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-zinc-400" /> : uniqueCampaigns}
            </p>
          </div>
        </div>

      </div>

      {/* Filter and Control Panel */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
            <input
              type="text"
              placeholder="ค้นหาตามแคมเปญ, Content ID, ชื่อ หรือหน่วยงาน..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white transition-all"
            />
          </div>

          {/* Occupation Filter */}
          <div className="w-full md:w-56">
            <select
              value={occupationFilter}
              onChange={e => setOccupationFilter(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white transition-all cursor-pointer"
            >
              <option value="All">ทุกกลุ่มอาชีพ (All Occupations)</option>
              <option value="Doctor">แพทย์ (Doctor)</option>
              <option value="Nurse">พยาบาล (Nurse)</option>
              <option value="Pharmacist">เภสัชกร (Pharmacist)</option>
              <option value="Hospital/Clinic Officer">เจ้าหน้าที่ (Hospital/Clinic Officer)</option>
            </select>
          </div>

          {/* Campaign Filter */}
          <div className="w-full md:w-56">
            <select
              value={campaignFilter}
              onChange={e => setCampaignFilter(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white transition-all cursor-pointer"
            >
              <option value="All">ทุกแคมเปญ (All Campaigns)</option>
              {uniqueCampaignsList.map(camp => (
                <option key={camp} value={camp}>{camp}</option>
              ))}
            </select>
          </div>

          {/* Sort Direction Toggle */}
          <div>
            <button
              onClick={() => setSortAsc(prev => !prev)}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
            >
              <ArrowUpDown className="h-4 w-4 text-zinc-400" />
              เรียงลำดับ: {sortAsc ? 'เก่าที่สุดขึ้นก่อน' : 'ใหม่ที่สุดขึ้นก่อน'}
            </button>
          </div>

        </div>
      </div>

      {/* Main Records Table Container */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">กำลังดึงข้อมูล Flex Impression...</p>
          </div>
        ) : sortedImpressions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <Eye className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">ไม่พบข้อมูลการเปิดดู (No Impressions Found)</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
              ไม่พบบันทึกการเปิดอ่านข้อความ Flex Message ที่มีคุณสมบัติสอดคล้องกับการค้นหาหรือเงื่อนไขตัวกรองของคุณ
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                <tr>
                  <th scope="col" className="px-6 py-4">โปรไฟล์ / สมาชิก (Member)</th>
                  <th scope="col" className="px-6 py-4">LINE User ID</th>
                  <th scope="col" className="px-6 py-4">กลุ่มวิชาชีพ / หน่วยงาน</th>
                  <th scope="col" className="px-6 py-4">แคมเปญ (Campaign)</th>
                  <th scope="col" className="px-6 py-4">Content ID</th>
                  <th scope="col" className="px-6 py-4">เวลาเปิดดู (Timestamp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {sortedImpressions.map((imp, idx) => {
                  const fullName = [imp.first_name, imp.last_name].filter(Boolean).join(' ').trim();
                  const nameDisplay = fullName || imp.display_name || 'Anonymous Member';
                  
                  return (
                    <tr 
                      key={imp.id || idx}
                      className="hover:bg-zinc-50/80 dark:hover:bg-white/[0.08] transition-colors"
                    >
                      {/* Member Info Profile */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {imp.picture_url ? (
                            <img 
                              src={imp.picture_url} 
                              alt={nameDisplay}
                              className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                              onError={(e) => {
                                // Fallback if image fails to load
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 font-bold text-xs uppercase">
                              {nameDisplay.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-white block">
                              {nameDisplay}
                            </span>
                            {fullName && imp.display_name && (
                              <span className="text-xs text-zinc-400 dark:text-zinc-500 block">
                                Line: {imp.display_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* User ID */}
                      <td className="px-6 py-4">
                        <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-mono text-zinc-600 dark:bg-white/5 dark:text-zinc-300 border dark:border-white/10">
                          {imp.user_id}
                        </code>
                      </td>

                      {/* Professional Info */}
                      <td className="px-6 py-4">
                        {imp.occupation ? (
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                              {imp.occupation}
                            </span>
                            {imp.organization && (
                              <span className="text-xs text-zinc-400 dark:text-zinc-500 block mt-1">
                                {imp.organization}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 italic">ไม่ระบุข้อมูล</span>
                        )}
                      </td>

                      {/* Campaign Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-brand-blue" />
                          <span className="font-medium text-zinc-900 dark:text-zinc-200">
                            {imp.campaign_name || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Content ID */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700 dark:bg-white/5 dark:text-zinc-300 border dark:border-white/10">
                          {imp.content_id || 'N/A'}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{formatDate(imp.created_at)}</span>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
