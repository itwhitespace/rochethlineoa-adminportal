'use client';

import { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  Search, 
  Users, 
  Megaphone, 
  Loader2, 
  Calendar, 
  ArrowUpDown, 
  MousePointerClick,
  Eye,
  Clock,
  User,
  Building,
  X,
  Copy,
  Check
} from 'lucide-react';
import { DashboardService } from '@/lib/dashboardService';
import { LiffLog } from '@/lib/types';
import { isDatabaseConfigured } from '@/lib/database';

export default function LiffLogsPage() {
  const [logs, setLogs] = useState<LiffLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [occupationFilter, setOccupationFilter] = useState('All');
  const [campaignFilter, setCampaignFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  
  // Sort State
  const [sortAsc, setSortAsc] = useState(false);

  // Centered Modal States
  const [selectedLog, setSelectedLog] = useState<LiffLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Get unique lists for dropdown filters
  const uniqueCampaignsList = Array.from(
    new Set(logs.map(log => log.campaign_name).filter((x): x is string => !!x))
  );
  
  const uniqueSourcesList = Array.from(
    new Set(logs.map(log => log.even_source).filter((x): x is string => !!x))
  );

  // Load Liff Logs
  useEffect(() => {
    setIsLive(isDatabaseConfigured());
    async function loadData() {
      setLoading(true);
      try {
        const data = await DashboardService.getLiffLogsJoined();
        setLogs(data);
      } catch (err) {
        console.error('Failed to load liff logs:', err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Filtered Logs
  const filteredLogs = logs.filter(log => {
    // 1. Search filter (Campaign, Content ID, Target URL, Member Name, User ID, Organization)
    const matchesSearch = search === '' || 
      (log.campaign_name && log.campaign_name.toLowerCase().includes(search.toLowerCase())) ||
      (log.content_id && log.content_id.toLowerCase().includes(search.toLowerCase())) ||
      (log.target && log.target.toLowerCase().includes(search.toLowerCase())) ||
      (log.display_name && log.display_name.toLowerCase().includes(search.toLowerCase())) ||
      (log.first_name && log.first_name.toLowerCase().includes(search.toLowerCase())) ||
      (log.last_name && log.last_name.toLowerCase().includes(search.toLowerCase())) ||
      (log.user_id && log.user_id.toLowerCase().includes(search.toLowerCase())) ||
      (log.organization && log.organization.toLowerCase().includes(search.toLowerCase()));

    // 2. Occupation filter
    const matchesOccupation = occupationFilter === 'All' || log.occupation === occupationFilter;

    // 3. Campaign filter
    const matchesCampaign = campaignFilter === 'All' || log.campaign_name === campaignFilter;

    // 4. Source filter
    const matchesSource = sourceFilter === 'All' || log.even_source === sourceFilter;

    return matchesSearch && matchesOccupation && matchesCampaign && matchesSource;
  });

  // Sorted Logs
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return sortAsc ? timeA - timeB : timeB - timeA;
  });

  // Calculate Statistics
  const totalClicks = filteredLogs.length;
  const uniqueUsers = new Set(filteredLogs.map(log => log.user_id)).size;
  const uniqueCampaigns = new Set(filteredLogs.map(log => log.campaign_name).filter(Boolean)).size;

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

  // Helper to get relative link name
  const getShortUrl = (urlStr: string | null) => {
    if (!urlStr) return '-';
    if (urlStr.startsWith('/')) return urlStr;
    try {
      const url = new URL(urlStr);
      return url.pathname + url.search;
    } catch (e) {
      return urlStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <MousePointerClick className="h-6 w-6 text-brand-blue" />
          LIFF Click Logs
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          ข้อมูลประวัติการกดเข้าอ่านบทความ/คอนเทนต์ผ่านระบบ LINE LIFF Redirect Link
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Total Clicks */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
            <MousePointerClick className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">จำนวนการคลิกทั้งหมด</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-0.5">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-zinc-400" /> : totalClicks}
            </p>
          </div>
        </div>

        {/* Unique Clickers */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">ผู้คลิกจริง (ไม่ซ้ำคน)</p>
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
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">แคมเปญที่มีความเคลื่อนไหว</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-0.5">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-zinc-400" /> : uniqueCampaigns}
            </p>
          </div>
        </div>

      </div>

      {/* Filter and Control Panel */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs space-y-4">
        <div className="flex flex-col xl:flex-row gap-4">
          
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
            <input
              type="text"
              placeholder="ค้นหาตามแคมเปญ, Content ID, ลิงก์ปลายทาง, ชื่อ หรือหน่วยงาน..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white transition-all"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Occupation Filter */}
            <div>
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
            <div>
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

            {/* Event Source Filter */}
            <div>
              <select
                value={sourceFilter}
                onChange={e => setSourceFilter(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white transition-all cursor-pointer"
              >
                <option value="All">ทุกแหล่งที่มา (All Sources)</option>
                {uniqueSourcesList.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Direction Toggle */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setSortAsc(prev => !prev)}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
            >
              <ArrowUpDown className="h-4 w-4 text-zinc-400" />
              เรียงลำดับ: {sortAsc ? 'เก่าสุด' : 'ใหม่สุด'}
            </button>
          </div>

        </div>
      </div>

      {/* Main Records Table Container */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">กำลังดึงข้อมูล LIFF Click Logs...</p>
          </div>
        ) : sortedLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <MousePointerClick className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">ไม่พบข้อมูลการคลิก (No Click Logs Found)</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
              ไม่พบบันทึกประวัติการคลิกอ่านคอนเทนต์ที่มีคุณสมบัติสอดคล้องกับเงื่อนไขตัวกรองของคุณ
            </p>
            
            {isLive && (
              <div className="mt-6 max-w-md rounded-lg border border-amber-200/60 bg-amber-50/50 p-4 text-left text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400 shadow-xs">
                <p className="font-semibold flex items-center gap-1">
                  💡 คำแนะนำสำหรับผู้พัฒนา (Supabase RLS Check):
                </p>
                <p className="mt-1 leading-relaxed">
                  หากในฐานข้อมูล Supabase มีข้อมูลเก็บอยู่จริงในตาราง <code className="bg-amber-100/60 dark:bg-amber-900/50 px-1 rounded">liff_logs</code> แต่หน้าจอแสดงเป็น 0 รายการ แสดงว่าถูกบล็อกด้วย RLS
                </p>
                <p className="mt-2 font-semibold">วิธีแก้ไข:</p>
                <p className="mt-1 leading-relaxed">
                  กรุณาไปที่หน้า SQL Editor ในระบบจัดการ Supabase ของคุณ แล้วรันคำสั่งนี้:
                </p>
                <pre className="mt-2 rounded bg-white dark:bg-zinc-950 p-2 font-mono text-[10px] text-zinc-750 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 overflow-x-auto select-all">
{`ALTER TABLE liff_logs DISABLE ROW LEVEL SECURITY;

-- หรือสร้าง Policy เพื่อเปิดให้ SELECT ได้อย่างเดียว
CREATE POLICY "Allow public select" ON liff_logs FOR SELECT USING (true);`}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-550 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                <tr>
                  <th scope="col" className="px-6 py-4">โปรไฟล์ / สมาชิก (Member)</th>
                  <th scope="col" className="px-6 py-4">กลุ่มวิชาชีพ & สังกัด</th>
                  <th scope="col" className="px-6 py-4">แคมเปญ & ช่องทาง (Campaign/Source)</th>
                  <th scope="col" className="px-6 py-4">คอนเทนต์เป้าหมาย (Target)</th>
                  <th scope="col" className="px-6 py-4">เวลาคลิก (Timestamp)</th>
                  <th scope="col" className="px-6 py-4 text-center">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {sortedLogs.map((log, idx) => {
                  const fullName = [log.first_name, log.last_name].filter(Boolean).join(' ').trim();
                  const nameDisplay = fullName || log.display_name || 'Anonymous Member';
                  
                  return (
                    <tr 
                      key={log.id || idx}
                      className="hover:bg-zinc-50/80 dark:hover:bg-white/[0.08] transition-colors"
                    >
                      {/* 1. Member Profile */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {log.picture_url ? (
                            <img 
                              src={log.picture_url} 
                              alt={nameDisplay}
                              className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                              onError={(e) => {
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
                            <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 block truncate max-w-[140px]" title={log.user_id}>
                              {log.user_id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Professional Info */}
                      <td className="px-6 py-4">
                        {log.occupation ? (
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/30 dark:text-purple-400">
                              {log.occupation}
                            </span>
                            {log.organization && (
                              <span className="text-xs text-zinc-400 dark:text-zinc-500 block mt-0.5 truncate max-w-[150px]" title={log.organization}>
                                {log.organization}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 italic dark:text-zinc-500">ไม่ระบุข้อมูล</span>
                        )}
                      </td>

                      {/* 3. Campaign & Source */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                            <span className="font-semibold text-zinc-850 dark:text-zinc-200 text-xs truncate max-w-[160px]" title={log.campaign_name || 'N/A'}>
                              {log.campaign_name || 'N/A'}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mt-0.5">
                            Src: {log.even_source || 'N/A'} • DA: {log.even_da || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* 4. Target Content */}
                      <td className="px-6 py-4 max-w-[180px]">
                        <div>
                          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs font-mono font-semibold text-zinc-700 dark:bg-white/5 dark:text-zinc-300 border dark:border-white/10">
                            {log.content_id || 'N/A'}
                          </span>
                          {log.target && (
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mt-1 truncate max-w-[170px]" title={log.target}>
                              {getShortUrl(log.target)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 5. Timestamp */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{formatDate(log.created_at)}</span>
                        </div>
                      </td>

                      {/* 6. Action Button (View Details) */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Centered Modal */}
      {isModalOpen && selectedLog && (
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
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <MousePointerClick className="h-5 w-5 text-brand-blue" />
                <span>LIFF Click Log Details</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Avatar Card */}
            <div className="flex flex-col items-center gap-4 py-6 border-b border-zinc-100 dark:border-zinc-900">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-purple-500/30 overflow-hidden shadow-sm">
                {selectedLog.picture_url ? (
                  <img
                    src={selectedLog.picture_url}
                    alt={selectedLog.display_name || 'User'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-zinc-400">
                    {selectedLog.display_name?.slice(0, 2).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  {[selectedLog.first_name, selectedLog.last_name].filter(Boolean).join(' ').trim() || selectedLog.display_name || 'Anonymous LINE User'}
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">LINE Display Name: {selectedLog.display_name || '-'}</p>
              </div>
            </div>

            {/* Info Sections */}
            <div className="flex-1 py-6 space-y-6">
              
              {/* LINE Info */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">LINE Platform Data</h5>
                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-900/50 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-medium">LINE User ID</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] text-zinc-900 dark:text-white bg-white border border-zinc-200 px-2 py-0.5 rounded dark:bg-zinc-900 dark:border-zinc-800">
                        {selectedLog.user_id}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedLog.user_id);
                          setCopiedId(true);
                          setTimeout(() => setCopiedId(false), 2000);
                        }}
                        className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500"
                        title="Copy User ID"
                      >
                        {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign & Click Analytics */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Campaign & Click Analytics</h5>
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase">Campaign Name</p>
                      <p className="font-bold text-zinc-850 dark:text-white mt-0.5">{selectedLog.campaign_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase">Content ID</p>
                      <p className="font-mono font-bold text-zinc-850 dark:text-white mt-0.5">{selectedLog.content_id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase">Event Source</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{selectedLog.even_source || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase">Event DA (Target Area)</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{selectedLog.even_da || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3">
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase">Click Timestamp</p>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      {formatDate(selectedLog.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Destination Links */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Destination Links</h5>
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 text-xs">
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase">Target URL (Redirect Destination)</p>
                    <a 
                      href={selectedLog.target?.startsWith('/') ? `https://www.roche.co.th${selectedLog.target}` : selectedLog.target}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 mt-1 truncate"
                    >
                      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                      {selectedLog.target || '-'}
                    </a>
                  </div>
                  
                  <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3">
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase">Full Entry Link</p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="font-mono text-[10px] text-zinc-500 truncate select-all flex-1">{selectedLog.full_url || '-'}</p>
                      {selectedLog.full_url && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedLog.full_url!);
                            setCopiedUrl(true);
                            setTimeout(() => setCopiedUrl(false), 2000);
                          }}
                          className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 flex-shrink-0"
                          title="Copy Full Link"
                        >
                          {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* HCP Profile Info (If registered) */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">HCP Profile Data</h5>
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 text-xs">
                  {selectedLog.occupation ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-2.5">
                        <User className="h-4.5 w-4.5 text-zinc-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold text-zinc-400 uppercase">Occupation</p>
                          <p className="font-bold text-zinc-850 dark:text-white mt-0.5">{selectedLog.occupation}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Building className="h-4.5 w-4.5 text-zinc-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold text-zinc-400 uppercase">Organization</p>
                          <p className="font-bold text-zinc-850 dark:text-white mt-0.5">{selectedLog.organization || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-zinc-400 italic text-center py-2">ไม่มีข้อมูลการลงทะเบียน (แพทย์ยังไม่ได้ลงทะเบียนสมาชิก)</p>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-zinc-100 pt-4 dark:border-zinc-900 mt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
