'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Send,
  Users,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  MessageSquare,
  Target,
  Megaphone
} from 'lucide-react';
import { getDatabaseClient } from '@/lib/database';
import { Member } from '@/lib/types';

// ─── Config ───────────────────────────────────────────────────────────────────
const PIXEL_BASE_URL = 'https://roche-liff.vercel.app';
const LIFF_BASE_URL  = 'https://liff.line.me/2010492367-Ad3wEuzW';

// ─── Types ────────────────────────────────────────────────────────────────────
interface BroadcastForm {
  campaignName: string;
  contentId: string;
  altText: string;
  headerText: string;
  bodyText: string;
  ctaLabel: string;
  ctaTarget: string;
  evensource: string;
  evenDA: string;
  lineToken: string;
  sendTo: 'confirmed' | 'all';
}

interface SendResult {
  userId: string;
  displayName: string;
  status: 'success' | 'error';
  message?: string;
}

// ─── Helper: Build Flex Message (inject userId ต่อคน) ────────────────────────
function buildFlexMessage(form: BroadcastForm, userId: string): object {
  const pixelUrl = `${PIXEL_BASE_URL}/pixel/image.png?user_id=${encodeURIComponent(userId)}&content_id=${encodeURIComponent(form.contentId)}&campaign_name=${encodeURIComponent(form.campaignName)}&sender_id=broadcast`;

  const liffUrl = `${LIFF_BASE_URL}?target=${encodeURIComponent(form.ctaTarget)}&content_id=${encodeURIComponent(form.contentId)}&evensource=${encodeURIComponent(form.evensource)}&evenDA=${encodeURIComponent(form.evenDA)}&CampaignName=${encodeURIComponent(form.campaignName)}`;

  return {
    type: 'flex',
    altText: form.altText || 'ข้อความใหม่จาก Roche Thailand',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0055FF',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '🔬 Roche Thailand',
            color: '#ffffff',
            size: 'xl',
            weight: 'bold'
          },
          {
            type: 'text',
            text: form.headerText || 'ข้อมูลสุขภาพล่าสุดสำหรับบุคลากรทางการแพทย์',
            color: '#cce0ff',
            size: 'sm',
            wrap: true,
            margin: 'sm'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '20px',
        spacing: 'md',
        contents: [
          {
            type: 'text',
            text: form.bodyText || 'เนื้อหาข้อความหลัก',
            size: 'sm',
            color: '#4a5568',
            wrap: true
          },
          {
            type: 'button',
            style: 'primary',
            color: '#0055FF',
            margin: 'lg',
            action: {
              type: 'uri',
              label: form.ctaLabel || 'อ่านเพิ่มเติม',
              uri: liffUrl
            }
          },
          {
            type: 'image',
            url: pixelUrl,
            size: '1px',
            aspectMode: 'cover',
            aspectRatio: '1:1',
            margin: 'none',
            action: { type: 'uri', label: 'pixel', uri: pixelUrl }
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '12px',
        backgroundColor: '#f7fafc',
        contents: [
          {
            type: 'text',
            text: '© Roche Thailand — ข้อมูลสำหรับบุคลากรทางการแพทย์เท่านั้น',
            size: 'xxs',
            color: '#a0aec0',
            align: 'center',
            wrap: true
          }
        ]
      }
    }
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BroadcastPage() {
  const [form, setForm] = useState<BroadcastForm>({
    campaignName: '',
    contentId: '',
    altText: 'ข้อความใหม่จาก Roche Thailand',
    headerText: 'ข้อมูลสุขภาพล่าสุดสำหรับบุคลากรทางการแพทย์',
    bodyText: '',
    ctaLabel: 'อ่านเพิ่มเติม',
    ctaTarget: '',
    evensource: 'Broadcast',
    evenDA: 'HCP',
    lineToken: '',
    sendTo: 'confirmed'
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<SendResult[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');

  // โหลดรายชื่อสมาชิกจาก Database และดึง token จาก Settings
  useEffect(() => {
    const savedToken = localStorage.getItem('roche_line_token');
    if (savedToken) {
      setForm(prev => ({ ...prev, lineToken: savedToken }));
    }

    async function loadMembers() {
      setLoadingMembers(true);
      const database = getDatabaseClient();
      if (!database) { setLoadingMembers(false); return; }

      const query = database
        .from('members')
        .select('user_id, display_name, first_name, last_name, status')
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (!error && data) setMembers(data as Member[]);
      setLoadingMembers(false);
    }
    loadMembers();
  }, []);

  const targetMembers = form.sendTo === 'confirmed'
    ? members.filter(m => m.status === 'Confirmed')
    : members;

  const handleChange = (field: keyof BroadcastForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // ─── ส่ง Flex Message ทีละ userId ────────────────────────────────────────
  async function handleSend() {
    setError('');

    if (!form.lineToken.trim()) {
      setError('กรุณากรอก LINE Channel Access Token ก่อน');
      return;
    }
    if (!form.campaignName.trim() || !form.contentId.trim() || !form.bodyText.trim()) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (Campaign, Content ID, เนื้อหา)');
      return;
    }
    if (targetMembers.length === 0) {
      setError('ไม่มีสมาชิกที่อยู่ในกลุ่มเป้าหมาย');
      return;
    }

    setSending(true);
    setResults([]);
    setShowResults(true);

    const newResults: SendResult[] = [];

    for (const member of targetMembers) {
      const flexMessage = buildFlexMessage(form, member.user_id);

      try {
        const res = await fetch('/api/broadcast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lineToken: form.lineToken.trim(),
            to: member.user_id,
            messages: [flexMessage]
          })
        });

        const name = member.display_name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.user_id;

        if (res.ok) {
          newResults.push({ userId: member.user_id, displayName: name, status: 'success' });
        } else {
          const errBody = await res.json().catch(() => ({}));
          newResults.push({
            userId: member.user_id,
            displayName: name,
            status: 'error',
            message: (errBody as { message?: string }).message || `HTTP ${res.status}`
          });
        }
      } catch (e: unknown) {
        newResults.push({
          userId: member.user_id,
          displayName: member.display_name || member.user_id,
          status: 'error',
          message: e instanceof Error ? e.message : 'Network error'
        });
      }

      setResults([...newResults]);
      // หน่วงเล็กน้อยเพื่อไม่ให้ยิง API เร็วเกินไป (Rate Limit)
      await new Promise(r => setTimeout(r, 200));
    }

    setSending(false);
  }

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount   = results.filter(r => r.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-blue-600" />
          Broadcast Flex Message
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          ส่ง LINE Flex Message พร้อม Tracking Pixel ให้สมาชิกทุกคนโดยอัตโนมัติ
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ── Form Panel ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Campaign Info */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              <Target className="h-4 w-4 text-blue-600" />
              ข้อมูลแคมเปญ
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Campaign Name <span className="text-red-500">*</span></label>
                <input
                  id="campaignName"
                  type="text"
                  placeholder="เช่น carewell_jun2026"
                  value={form.campaignName}
                  onChange={e => handleChange('campaignName', e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Content ID <span className="text-red-500">*</span></label>
                <input
                  id="contentId"
                  type="text"
                  placeholder="เช่น carewell_center"
                  value={form.contentId}
                  onChange={e => handleChange('contentId', e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Event Source</label>
                <input
                  id="evensource"
                  type="text"
                  value={form.evensource}
                  onChange={e => handleChange('evensource', e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Event DA</label>
                <input
                  id="evenDA"
                  type="text"
                  value={form.evenDA}
                  onChange={e => handleChange('evenDA', e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              เนื้อหาข้อความ
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Alt Text (แสดงบน Notification)</label>
                <input
                  id="altText"
                  type="text"
                  value={form.altText}
                  onChange={e => handleChange('altText', e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Header Subtitle</label>
                <input
                  id="headerText"
                  type="text"
                  value={form.headerText}
                  onChange={e => handleChange('headerText', e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">เนื้อหาหลัก <span className="text-red-500">*</span></label>
                <textarea
                  id="bodyText"
                  rows={4}
                  placeholder="พิมพ์เนื้อหาที่ต้องการส่งถึงสมาชิก..."
                  value={form.bodyText}
                  onChange={e => handleChange('bodyText', e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white resize-none"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">ชื่อปุ่ม CTA</label>
                  <input
                    id="ctaLabel"
                    type="text"
                    value={form.ctaLabel}
                    onChange={e => handleChange('ctaLabel', e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Target URL / Domain</label>
                  <input
                    id="ctaTarget"
                    type="text"
                    placeholder="เช่น www.carewell.center"
                    value={form.ctaTarget}
                    onChange={e => handleChange('ctaTarget', e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* LINE Token */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              <Send className="h-4 w-4 text-blue-600" />
              LINE Channel Access Token
            </h2>
            {form.lineToken ? (
              <div className="flex items-center justify-between gap-3 rounded-lg bg-emerald-50/50 p-3 border border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30">
                <p className="text-xs text-emerald-700 dark:text-emerald-450 font-medium">
                  ✓ ดึงข้อมูล Token จากหน้า Setting เรียบร้อยแล้ว
                </p>
                <Link 
                  href="/admin/settings"
                  className="text-xs font-semibold text-blue-650 hover:text-blue-700 underline"
                >
                  ไปหน้า Setting
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 rounded-lg bg-amber-50/50 p-3 border border-amber-250 dark:bg-amber-950/10 dark:border-amber-900/30">
                <p className="text-xs text-amber-700 dark:text-amber-450 font-medium">
                  ⚠ ยังไม่มีการกำหนด LINE Channel Access Token กรุณาไปตั้งค่าที่หน้า Setting ก่อนเริ่มบรอดแคสต์
                </p>
                <Link 
                  href="/admin/settings"
                  className="text-xs font-bold text-blue-600 hover:text-blue-755 underline self-start"
                >
                  ไปหน้า Setting เพื่อกรอก Token
                </Link>
              </div>
            )}
          </div>

          {/* Preview toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span className="flex items-center gap-2"><Eye className="h-4 w-4" /> ดูตัวอย่าง JSON ที่จะส่ง</span>
            {showPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showPreview && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-950 p-4 dark:border-zinc-700">
              <p className="mb-2 text-xs text-zinc-400">ตัวอย่าง — userId จะถูกแทนด้วยค่าจริงแต่ละคนตอนส่ง</p>
              <pre className="overflow-auto text-xs text-green-400">
                {JSON.stringify(buildFlexMessage(form, 'REPLACE_USER_ID'), null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* ── Summary Panel ── */}
        <div className="space-y-4">

          {/* Target Members */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              <Users className="h-4 w-4 text-blue-600" />
              กลุ่มเป้าหมาย
            </h2>

            {/* Radio sendTo */}
            <div className="mb-4 space-y-2">
              {(['confirmed', 'all'] as const).map(opt => (
                <label key={opt} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-all ${form.sendTo === opt ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-zinc-200 dark:border-zinc-700'}`}>
                  <input
                    type="radio"
                    name="sendTo"
                    value={opt}
                    checked={form.sendTo === opt}
                    onChange={() => handleChange('sendTo', opt)}
                    className="accent-blue-600"
                  />
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {opt === 'confirmed' ? 'เฉพาะ Confirmed' : 'ทุกสมาชิก (รวม Pending)'}
                  </span>
                </label>
              ))}
            </div>

            {loadingMembers ? (
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin" /> กำลังโหลด...
              </div>
            ) : (
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3 text-center">
                <p className="text-3xl font-bold text-blue-600">{targetMembers.length}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">สมาชิกที่จะได้รับข้อความ</p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Info className="h-3.5 w-3.5" />
              Pixel URL ที่จะใช้
            </div>
            <p className="break-all rounded bg-zinc-100 p-2 text-[10px] font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {PIXEL_BASE_URL}/pixel?user_id=<span className="text-blue-500">[userId]</span>&content_id={form.contentId || '...'}&campaign_name={form.campaignName || '...'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 flex gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Send Button */}
          <button
            id="sendBroadcastBtn"
            onClick={handleSend}
            disabled={sending || targetMembers.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          >
            {sending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> กำลังส่ง... {results.length}/{targetMembers.length}</>
            ) : (
              <><Send className="h-4 w-4" /> ส่งข้อความ {targetMembers.length} คน</>
            )}
          </button>
        </div>
      </div>

      {/* ── Results Panel ── */}
      {showResults && results.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-6 py-4">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">ผลการส่ง</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> {successCount} สำเร็จ</span>
              {errorCount > 0 && <span className="flex items-center gap-1 text-red-500"><AlertTriangle className="h-3.5 w-3.5" /> {errorCount} ผิดพลาด</span>}
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3 text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{r.displayName}</span>
                {r.status === 'success' ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> ส่งสำเร็จ</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-red-500"><AlertTriangle className="h-3.5 w-3.5" /> {r.message}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
