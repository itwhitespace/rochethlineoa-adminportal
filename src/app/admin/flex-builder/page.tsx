'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileJson,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Copy,
  Megaphone,
  Target,
  Image as ImageIcon,
  Type,
  RectangleHorizontal,
  Box as BoxIcon,
  Minus,
  Maximize2,
  Info,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  ListRestart
} from 'lucide-react';
import { getDatabaseClient } from '@/lib/database';
import { Member } from '@/lib/types';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface FlexComponent {
  id: string;
  type: 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'pixel';
  text?: string;
  url?: string;
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '3xl' | '4xl' | '5xl' | 'full';
  weight?: 'regular' | 'bold';
  color?: string;
  wrap?: boolean;
  align?: 'start' | 'center' | 'end';
  style?: 'primary' | 'secondary' | 'link';
  actionUri?: string;
}

interface BoxComponent {
  id: string;
  type: 'box';
  layout: 'vertical' | 'horizontal';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  children: FlexComponent[];
}

type BuilderComponent = FlexComponent | BoxComponent;

interface FlexBubble {
  id: string;
  headerTitle: string;
  headerSubtitle: string;
  headerBgColor: string;
  heroUrl: string;
  heroActionUri: string;
  bodyComponents: BuilderComponent[];
  footerText: string;
  footerBgColor: string;
}

interface CampaignForm {
  campaignName: string;
  contentId: string;
  altText: string;
  evensource: string;
  evenDA: string;
  pixelBaseUrl: string;
  liffBaseUrl: string;
}

interface BroadcastResult {
  userId: string;
  displayName: string;
  status: 'success' | 'error';
  message?: string;
}

// ─── Constants & Mock Defaults ────────────────────────────────────────────────

const OCCUPATIONS = ['Doctor', 'Nurse', 'Pharmacist', 'Hospital/Clinic Officer'];

const createDefaultBubble = (id: string): FlexBubble => ({
  id,
  headerTitle: '',
  headerSubtitle: '',
  headerBgColor: '#0055FF',
  heroUrl: '',
  heroActionUri: '',
  bodyComponents: [
    {
      id: `${id}-txt-1`,
      type: 'text',
      text: 'ขอเชิญเข้าเรียนหลักสูตรความรู้ทางการแพทย์และการดูแลรักษาผู้ป่วยระดับสากล',
      size: 'sm',
      color: '#4a5568',
      wrap: true,
      align: 'start'
    },
    {
      id: `${id}-box-1`,
      type: 'box',
      layout: 'vertical',
      spacing: 'xs',
      padding: 'xs',
      children: [
        {
          id: `${id}-box-txt-1`,
          type: 'text',
          text: '• หัวข้อ: Advanced Oncology Care 2026',
          size: 'xs',
          color: '#2d3748',
          weight: 'bold',
          wrap: true
        },
        {
          id: `${id}-box-txt-2`,
          type: 'text',
          text: '• วิทยากร: คณะผู้เชี่ยวชาญจากโรงพยาบาลชั้นนำ',
          size: 'xs',
          color: '#718096',
          wrap: true
        }
      ]
    },
    {
      id: `${id}-btn-1`,
      type: 'button',
      text: 'ลงทะเบียนเรียนออนไลน์',
      style: 'primary',
      color: '#0055FF',
      actionUri: ''
    },
    {
      id: `${id}-divider-1`,
      type: 'divider',
      color: '#e5e7eb'
    },
    {
      id: `${id}-pixel-1`,
      type: 'pixel'
    }
  ],
  footerText: '© Roche Thailand — ข้อมูลสำหรับบุคลากรทางการแพทย์เท่านั้น',
  footerBgColor: '#f7fafc'
});

export default function FlexBuilderPage() {
  const [builderMode, setBuilderMode] = useState<'bubble' | 'carousel'>('bubble');
  const [bubbles, setBubbles] = useState<FlexBubble[]>([createDefaultBubble('bubble-1')]);
  const [activeBubbleIndex, setActiveBubbleIndex] = useState<number>(0);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  // Campaign Form State
  const [form, setForm] = useState<CampaignForm>({
    campaignName: 'flex_builder_camp',
    contentId: 'builder_content_1',
    altText: 'ข้อความใหม่จาก Roche Thailand',
    evensource: 'FlexBuilder',
    evenDA: 'HCP',
    pixelBaseUrl: 'https://roche-liff.vercel.app',
    liffBaseUrl: 'https://liff.line.me/2010492367-Ad3wEuzW'
  });

  // Targeting States
  const [targetType, setTargetType] = useState<'all' | 'confirmed'>('confirmed');
  const [occupationTarget, setOccupationTarget] = useState<string>('All');
  
  // Database Members & LINE token
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [lineToken, setLineToken] = useState('');

  // Sending status
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<BroadcastResult[]>([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [broadcastError, setBroadcastError] = useState('');

  // Initial Load
  useEffect(() => {
    // 1. Fetch saved LINE Token
    const storedToken = localStorage.getItem('roche_line_token');
    if (storedToken) {
      setLineToken(storedToken);
    }

    // 2. Fetch Members
    async function loadMembers() {
      setLoadingMembers(true);
      const database = getDatabaseClient();
      if (!database) {
        setLoadingMembers(false);
        return;
      }
      try {
        const { data, error } = await database
          .from('members')
          .select('user_id, display_name, first_name, last_name, status, occupation')
          .order('created_at', { ascending: false });
        if (!error && data) {
          setMembers(data as Member[]);
        }
      } catch (err) {
        console.error('Error fetching members:', err);
      }
      setLoadingMembers(false);
    }
    loadMembers();
  }, []);

  // Filter Members based on selection
  const filteredMembers = members.filter(m => {
    if (targetType === 'all') {
      // Everyone (Member + Pending) - matches all DB entries
      return true;
    } else {
      // Specific Confirm
      if (m.status !== 'Confirmed') return false;
      if (occupationTarget === 'All') return true;
      return m.occupation === occupationTarget;
    }
  });

  const activeBubble = bubbles[activeBubbleIndex] || bubbles[0];

  // Update Campaign Form fields
  const handleFormChange = (field: keyof CampaignForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Update Active Bubble field
  const handleBubbleFieldChange = (field: keyof FlexBubble, value: string) => {
    setBubbles(prev => prev.map((b, idx) => {
      if (idx === activeBubbleIndex) {
        return { ...b, [field]: value };
      }
      return b;
    }));
  };

  // Component Management Helpers
  const addComponent = (type: BuilderComponent['type'], boxId?: string) => {
    const newId = `${type}-${Date.now()}`;
    let newComp: BuilderComponent;

    switch (type) {
      case 'text':
        newComp = { id: newId, type: 'text', text: 'หัวข้อข้อความใหม่', size: 'sm', color: '#111827', wrap: true };
        break;
      case 'image':
        newComp = { id: newId, type: 'image', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop', size: 'full', actionUri: '' };
        break;
      case 'button':
        newComp = { id: newId, type: 'button', text: 'ปุ่มดำเนินการ', style: 'primary', color: '#0055FF', actionUri: '' };
        break;
      case 'divider':
        newComp = { id: newId, type: 'divider', color: '#e5e7eb' };
        break;
      case 'spacer':
        newComp = { id: newId, type: 'spacer', size: 'md' };
        break;
      case 'pixel':
        newComp = { id: newId, type: 'pixel' };
        break;
      case 'box':
        newComp = { id: newId, type: 'box', layout: 'vertical', spacing: 'none', padding: 'none', children: [] };
        break;
    }

    setBubbles(prev => prev.map((b, idx) => {
      if (idx === activeBubbleIndex) {
        if (boxId) {
          // Add into nested Box
          return {
            ...b,
            bodyComponents: b.bodyComponents.map(bc => {
              if (bc.type === 'box' && bc.id === boxId) {
                return {
                  ...bc,
                  children: [...bc.children, newComp as FlexComponent]
                };
              }
              return bc;
            })
          };
        } else {
          // Add to top level
          return {
            ...b,
            bodyComponents: [...b.bodyComponents, newComp]
          };
        }
      }
      return b;
    }));
    
    setSelectedComponentId(newId);
  };

  const deleteComponent = (id: string, parentBoxId?: string) => {
    setBubbles(prev => prev.map((b, idx) => {
      if (idx === activeBubbleIndex) {
        if (parentBoxId) {
          // Delete from nested Box
          return {
            ...b,
            bodyComponents: b.bodyComponents.map(bc => {
              if (bc.type === 'box' && bc.id === parentBoxId) {
                return {
                  ...bc,
                  children: bc.children.filter(child => child.id !== id)
                };
              }
              return bc;
            })
          };
        } else {
          // Delete from top level
          return {
            ...b,
            bodyComponents: b.bodyComponents.filter(bc => bc.id !== id)
          };
        }
      }
      return b;
    }));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  };

  const reorderComponent = (index: number, direction: 'up' | 'down') => {
    setBubbles(prev => prev.map((b, idx) => {
      if (idx === activeBubbleIndex) {
        const nextComponents = [...b.bodyComponents];
        const swapIdx = direction === 'up' ? index - 1 : index + 1;
        if (swapIdx >= 0 && swapIdx < nextComponents.length) {
          const temp = nextComponents[index];
          nextComponents[index] = nextComponents[swapIdx];
          nextComponents[swapIdx] = temp;
        }
        return {
          ...b,
          bodyComponents: nextComponents
        };
      }
      return b;
    }));
  };

  const updateComponentProperty = (id: string, key: string, value: any, parentBoxId?: string) => {
    setBubbles(prev => prev.map((b, idx) => {
      if (idx === activeBubbleIndex) {
        return {
          ...b,
          bodyComponents: b.bodyComponents.map(bc => {
            if (parentBoxId && bc.type === 'box' && bc.id === parentBoxId) {
              return {
                ...bc,
                children: bc.children.map(child => {
                  if (child.id === id) {
                    return { ...child, [key]: value };
                  }
                  return child;
                })
              };
            } else if (bc.id === id) {
              return { ...bc, [key]: value };
            }
            return bc;
          })
        };
      }
      return b;
    }));
  };

  // Add/Remove Bubbles (for Carousel)
  const addBubble = () => {
    if (bubbles.length >= 10) {
      alert('LINE Flex Message Carousel รองรับการ์ดสูงสุด 10 ใบเท่านั้น');
      return;
    }
    const newId = `bubble-${Date.now()}`;
    const newBub = createDefaultBubble(newId);
    setBubbles(prev => [...prev, newBub]);
    setActiveBubbleIndex(bubbles.length);
  };

  const removeBubble = (idxToRemove: number) => {
    if (bubbles.length <= 1) return;
    setBubbles(prev => prev.filter((_, idx) => idx !== idxToRemove));
    setActiveBubbleIndex(0);
  };

  // ─── JSON Generation Logic ───────────────────────────────────────────────────
  
  const generateBubbleJson = (bubble: FlexBubble, userIdPlaceholder: string = '${userId}') => {
    const pixelUrl = () => {
      return `${form.pixelBaseUrl}/pixel/image.png?user_id=${userIdPlaceholder}&content_id=${encodeURIComponent(form.contentId)}&campaign_name=${encodeURIComponent(form.campaignName)}&sender_id=builder`;
    };

    const liffUrl = (targetUrl: string) => {
      if (!targetUrl) return form.liffBaseUrl || 'https://liff.line.me';
      return `${form.liffBaseUrl}?target=${encodeURIComponent(targetUrl)}&content_id=${encodeURIComponent(form.contentId)}&evensource=${encodeURIComponent(form.evensource)}&evenDA=${encodeURIComponent(form.evenDA)}&CampaignName=${encodeURIComponent(form.campaignName)}`;
    };

    const mapComp = (c: BuilderComponent): any => {
      switch (c.type) {
        case 'text':
          return {
            type: 'text',
            text: c.text || ' ',
            size: c.size || 'sm',
            weight: c.weight || 'regular',
            color: c.color || '#111827',
            wrap: c.wrap !== false,
            align: c.align || 'start'
          };
        case 'image':
          return {
            type: 'image',
            url: c.url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop',
            size: c.size || 'full',
            aspectMode: 'cover',
            aspectRatio: '16:9',
            action: c.actionUri ? {
              type: 'uri',
              label: 'Link',
              uri: liffUrl(c.actionUri)
            } : undefined
          };
        case 'button':
          return {
            type: 'button',
            style: c.style || 'primary',
            color: c.color || '#0055FF',
            margin: 'md',
            action: {
              type: 'uri',
              label: c.text || 'ปุ่มกด',
              uri: liffUrl(c.actionUri || '')
            }
          };
        case 'divider':
          return {
            type: 'separator',
            color: c.color || '#e5e7eb',
            margin: 'md'
          };
        case 'spacer':
          return {
            type: 'spacer',
            size: c.size || 'md'
          };
        case 'pixel':
          const trackingUrl = pixelUrl();
          return {
            type: 'image',
            url: trackingUrl,
            size: 'xxs',
            aspectMode: 'cover',
            aspectRatio: '1:1',
            margin: 'none'
          };
        case 'box':
          return {
            type: 'box',
            layout: c.layout || 'vertical',
            spacing: c.spacing || 'none',
            paddingAll: c.padding || 'none',
            contents: c.children && c.children.length > 0
              ? c.children.map(mapComp)
              : [{ type: 'spacer', size: 'xs' }]
          };
      }
    };

    const bubbleObj: any = {
      type: 'bubble',
      size: 'mega'
    };

    // Header
    if (bubble.headerTitle || bubble.headerSubtitle) {
      bubbleObj.header = {
        type: 'box',
        layout: 'vertical',
        backgroundColor: bubble.headerBgColor || '#0055FF',
        paddingAll: '20px',
        contents: []
      };
      if (bubble.headerTitle) {
        bubbleObj.header.contents.push({
          type: 'text',
          text: bubble.headerTitle,
          color: '#ffffff',
          size: 'xl',
          weight: 'bold'
        });
      }
      if (bubble.headerSubtitle) {
        bubbleObj.header.contents.push({
          type: 'text',
          text: bubble.headerSubtitle,
          color: '#cce0ff',
          size: 'sm',
          wrap: true,
          margin: 'sm'
        });
      }
    }

    // Hero
    if (bubble.heroUrl) {
      bubbleObj.hero = {
        type: 'image',
        url: bubble.heroUrl,
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover',
        action: bubble.heroActionUri ? {
          type: 'uri',
          label: 'Link',
          uri: liffUrl(bubble.heroActionUri)
        } : undefined
      };
    }

    // Body
    bubbleObj.body = {
      type: 'box',
      layout: 'vertical',
      paddingAll: '20px',
      spacing: 'md',
      contents: bubble.bodyComponents.map(mapComp).filter(Boolean)
    };

    // Footer
    if (bubble.footerText) {
      bubbleObj.footer = {
        type: 'box',
        layout: 'vertical',
        paddingAll: '12px',
        backgroundColor: bubble.footerBgColor || '#f7fafc',
        contents: [
          {
            type: 'text',
            text: bubble.footerText,
            size: 'xxs',
            color: '#a0aec0',
            align: 'center',
            wrap: true
          }
        ]
      };
    }

    return bubbleObj;
  };

  const getFinalJson = (userIdPlaceholder: string = '${userId}') => {
    if (builderMode === 'bubble') {
      return {
        type: 'flex',
        altText: form.altText || 'ข้อความใหม่จาก Roche Thailand',
        contents: generateBubbleJson(bubbles[0], userIdPlaceholder)
      };
    } else {
      return {
        type: 'flex',
        altText: form.altText || 'ข้อความใหม่จาก Roche Thailand',
        contents: {
          type: 'carousel',
          contents: bubbles.map(b => generateBubbleJson(b, userIdPlaceholder))
        }
      };
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(getFinalJson(), null, 2));
    alert('คัดลอก LINE Flex Message JSON เรียบร้อยแล้ว!');
  };

  // ─── Broadcast Broadcast Logic ────────────────────────────────────────────────

  const handleBroadcast = async () => {
    setBroadcastError('');
    if (!lineToken) {
      setBroadcastError('ไม่พบ LINE Channel Access Token ใน Settings กรุณาไปตั้งค่าที่หน้า Setting ก่อน');
      return;
    }
    if (filteredMembers.length === 0) {
      setBroadcastError('ไม่พบสมาชิกในกลุ่มเป้าหมายที่เลือก');
      return;
    }

    if (!confirm(`คุณต้องการส่งบรอดแคสต์ Flex Message นี้ไปยังสมาชิกจำนวน ${filteredMembers.length} คน ใช่หรือไม่?`)) {
      return;
    }

    setSending(true);
    setResults([]);
    setShowResultsModal(true);

    const newResults: BroadcastResult[] = [];

    for (const member of filteredMembers) {
      // Build personalized payload per user
      const personalizedFlex = getFinalJson(member.user_id);
      const name = member.display_name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.user_id;

      try {
        const res = await fetch('/api/broadcast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lineToken: lineToken.trim(),
            to: member.user_id,
            messages: [personalizedFlex]
          })
        });

        if (res.ok) {
          newResults.push({ userId: member.user_id, displayName: name, status: 'success' });
        } else {
          const errBody = await res.json().catch(() => ({}));
          console.error('LINE Broadcast Error Details:', errBody);
          let errMsg = errBody.message || `HTTP ${res.status}`;
          if (errBody.details && errBody.details.length > 0) {
            const detailsStr = errBody.details.map((d: any) => `${d.property ? d.property : 'property'}: ${d.message}`).join(', ');
            errMsg += ` (${detailsStr})`;
          }
          newResults.push({
            userId: member.user_id,
            displayName: name,
            status: 'error',
            message: errMsg
          });
        }
      } catch (e: any) {
        newResults.push({
          userId: member.user_id,
          displayName: name,
          status: 'error',
          message: e.message || 'Network Error'
        });
      }

      setResults([...newResults]);
      await new Promise(r => setTimeout(r, 200)); // Rate limit buffer
    }

    setSending(false);
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <FileJson className="h-6 w-6 text-brand-blue" />
            Flex Message Builder
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            ออกแบบ LINE Flex Message แบบลากวาง พร้อมรองรับระบบแคมเปญและการเลือกกลุ่มเป้าหมายในตัว
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setBuilderMode(prev => prev === 'bubble' ? 'carousel' : 'bubble');
              setActiveBubbleIndex(0);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white py-2 px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850 transition-all"
          >
            <ListRestart className="h-4 w-4 text-zinc-500" />
            สลับเป็น {builderMode === 'bubble' ? 'Carousel (หลายการ์ด)' : 'Single (การ์ดเดี่ยว)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* ── Left Panel: Campaign & Target (1/4 Width) ── */}
        <div className="xl:col-span-1 space-y-4">
          
          {/* Campaign Form Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-650" />
              ข้อมูลแคมเปญ
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={form.campaignName}
                  onChange={e => handleFormChange('campaignName', e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Content ID</label>
                <input
                  type="text"
                  value={form.contentId}
                  onChange={e => handleFormChange('contentId', e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Event Source</label>
                  <input
                    type="text"
                    value={form.evensource}
                    onChange={e => handleFormChange('evensource', e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Event DA</label>
                  <input
                    type="text"
                    value={form.evenDA}
                    onChange={e => handleFormChange('evenDA', e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Alt Text (แจ้งเตือนมือถือ)</label>
                <input
                  type="text"
                  value={form.altText}
                  onChange={e => handleFormChange('altText', e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Targeting Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-655" />
              กลุ่มเป้าหมายบรอดแคสต์
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">เลือกประเภทสมาชิก</label>
                <select
                  value={targetType}
                  onChange={e => setTargetType(e.target.value as 'all' | 'confirmed')}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs cursor-pointer outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                >
                  <option value="confirmed">เฉพาะผู้ยืนยันตัวตน (Confirmed)</option>
                  <option value="all">ทุกคน (Member + Pending)</option>
                </select>
              </div>

              {targetType === 'confirmed' && (
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">กลุ่มอาชีพของ User</label>
                  <select
                    value={occupationTarget}
                    onChange={e => setOccupationTarget(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs cursor-pointer outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="All">ทั้งหมด (All Occupations)</option>
                    {OCCUPATIONS.map(occ => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="rounded-lg bg-blue-50/50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50 p-3 text-center">
                {loadingMembers ? (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-blue-650">
                    <Loader2 className="h-3 w-3 animate-spin" /> กำลังตรวจสอบ...
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-blue-600">{filteredMembers.length}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">จำนวนผู้รับสารในกลุ่มนี้</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Token Status Alert */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">LINE Connection</h4>
            {lineToken ? (
              <div className="rounded-lg bg-emerald-50 text-emerald-800 p-3 text-xs dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-250 flex items-start gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Token Configured</p>
                  <p className="text-[10px] opacity-90 mt-0.5">ดึงข้อมูลสำเร็จและพร้อมบรอดแคสต์</p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-amber-50 text-amber-800 p-3 text-xs dark:bg-amber-950/20 dark:text-amber-450 border border-amber-250 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Token Missing</p>
                    <p className="text-[10px] opacity-90 mt-0.5">กรุณาตั้งค่า Channel Access Token ใน Settings</p>
                  </div>
                </div>
                <Link
                  href="/admin/settings"
                  className="block text-center text-[10px] font-bold text-blue-650 hover:text-blue-700 bg-white dark:bg-zinc-950 border border-blue-200 rounded py-1"
                >
                  ไปหน้า Setting
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Middle Panel: Canvas & Property Editor (2/4 Width) ── */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Carousel Tabs Indicator */}
          {builderMode === 'carousel' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800">
              {bubbles.map((b, idx) => (
                <div key={b.id} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => {
                      setActiveBubbleIndex(idx);
                      setSelectedComponentId(null);
                    }}
                    className={`rounded-lg py-1.5 px-3 text-xs font-semibold border transition-all ${
                      idx === activeBubbleIndex
                        ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100'
                        : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850'
                    }`}
                  >
                    การ์ดที่ {idx + 1}
                  </button>
                  {bubbles.length > 1 && (
                    <button
                      onClick={() => removeBubble(idx)}
                      className="ml-1 text-red-500 hover:text-red-700 p-1"
                      title="ลบการ์ดนี้"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addBubble}
                className="flex items-center gap-1 py-1.5 px-3 border border-dashed border-zinc-300 hover:border-zinc-500 rounded-lg text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400 transition-all flex-shrink-0"
              >
                <Plus className="h-3 w-3" /> เพิ่มการ์ด
              </button>
            </div>
          )}

          {/* Canvas & Editor split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Bubble Layout Structure Canvas */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>โครงสร้างการ์ดที่ {activeBubbleIndex + 1}</span>
              </h3>

              {/* Header Editor Block */}
              <div className="border border-zinc-105 dark:border-zinc-850 rounded-lg p-3 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/20">
                <p className="text-xs font-bold text-zinc-705 dark:text-zinc-300">ส่วนหัว (Header)</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="หัวข้อการ์ด (เช่น Roche Thailand)"
                    value={activeBubble.headerTitle}
                    onChange={e => handleBubbleFieldChange('headerTitle', e.target.value)}
                    className="w-full rounded bg-white border border-zinc-200 px-2.5 py-1 text-xs outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="คำอธิบายการ์ด"
                    value={activeBubble.headerSubtitle}
                    onChange={e => handleBubbleFieldChange('headerSubtitle', e.target.value)}
                    className="w-full rounded bg-white border border-zinc-200 px-2.5 py-1 text-xs outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[10px] text-zinc-500">สีพื้นหลังส่วนหัว</label>
                    <input
                      type="color"
                      value={activeBubble.headerBgColor}
                      onChange={e => handleBubbleFieldChange('headerBgColor', e.target.value)}
                      className="h-6 w-10 border border-zinc-300 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Editor Block */}
              <div className="border border-zinc-105 dark:border-zinc-850 rounded-lg p-3 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/20">
                <p className="text-xs font-bold text-zinc-705 dark:text-zinc-300">ภาพหลัก (Hero Image)</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="URL รูปภาพ (เว้นว่างเพื่อไม่แสดง)"
                    value={activeBubble.heroUrl}
                    onChange={e => handleBubbleFieldChange('heroUrl', e.target.value)}
                    className="w-full rounded bg-white border border-zinc-200 px-2.5 py-1 text-xs outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="ลิงก์เชื่อมโยงเมื่อคลิกที่ภาพ"
                    value={activeBubble.heroActionUri}
                    onChange={e => handleBubbleFieldChange('heroActionUri', e.target.value)}
                    className="w-full rounded bg-white border border-zinc-200 px-2.5 py-1 text-xs outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Body Components Canvas List */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-zinc-705 dark:text-zinc-300 flex items-center justify-between">
                  <span>เนื้อหาหลัก (Body Components)</span>
                  <span className="text-[10px] text-zinc-400">คลิกที่รายการเพื่อแก้ไข</span>
                </p>

                <div className="space-y-1.5 max-h-[300px] overflow-y-auto border border-zinc-105 dark:border-zinc-800 p-2 rounded-lg bg-zinc-50/20 dark:bg-zinc-950/10">
                  {activeBubble.bodyComponents.length === 0 && (
                    <p className="text-xs text-zinc-400 text-center py-6">ไม่มีคอมโพเนนต์ในเนื้อหาหลัก</p>
                  )}
                  {activeBubble.bodyComponents.map((comp, index) => {
                    const isSelected = selectedComponentId === comp.id;
                    return (
                      <div
                        key={comp.id}
                        onClick={() => setSelectedComponentId(comp.id)}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-300 dark:bg-blue-950/20 dark:border-blue-900'
                            : 'bg-white border-zinc-150 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-850 dark:hover:bg-zinc-850'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {comp.type === 'text' && <Type className="h-3.5 w-3.5 text-indigo-500" />}
                          {comp.type === 'image' && <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />}
                          {comp.type === 'button' && <RectangleHorizontal className="h-3.5 w-3.5 text-blue-500" />}
                          {comp.type === 'divider' && <Minus className="h-3.5 w-3.5 text-zinc-450" />}
                          {comp.type === 'spacer' && <Maximize2 className="h-3.5 w-3.5 text-zinc-450" />}
                          {comp.type === 'pixel' && <Eye className="h-3.5 w-3.5 text-purple-500" />}
                          {comp.type === 'box' && <BoxIcon className="h-3.5 w-3.5 text-amber-500" />}
                          
                          <span className="font-medium capitalize text-[11px] text-zinc-500 dark:text-zinc-400">
                            {comp.type}:
                          </span>
                          <span className="truncate max-w-[120px] font-semibold">
                            {comp.type === 'text' && comp.text}
                            {comp.type === 'button' && comp.text}
                            {comp.type === 'image' && 'Image Link'}
                            {comp.type === 'divider' && 'Line Separator'}
                            {comp.type === 'spacer' && `Height (${comp.size || 'md'})`}
                            {comp.type === 'pixel' && '1px Auto Tracking'}
                            {comp.type === 'box' && `Layout (${comp.layout}) [${comp.children?.length || 0}]`}
                          </span>
                        </div>
                        
                        {/* Control buttons */}
                        <div className="flex items-center gap-1.5 onClickPrevent" onClick={e => e.stopPropagation()}>
                          <button
                            disabled={index === 0}
                            onClick={() => reorderComponent(index, 'up')}
                            className="p-1 hover:bg-zinc-100 rounded disabled:opacity-40 dark:hover:bg-zinc-800"
                          >
                            <ArrowUp className="h-3 w-3 text-zinc-500" />
                          </button>
                          <button
                            disabled={index === activeBubble.bodyComponents.length - 1}
                            onClick={() => reorderComponent(index, 'down')}
                            className="p-1 hover:bg-zinc-100 rounded disabled:opacity-40 dark:hover:bg-zinc-800"
                          >
                            <ArrowDown className="h-3 w-3 text-zinc-500" />
                          </button>
                          <button
                            onClick={() => deleteComponent(comp.id)}
                            className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add top level Component Panel */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {(['text', 'image', 'button', 'divider', 'spacer', 'box', 'pixel'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => addComponent(type)}
                      className="flex items-center justify-center gap-1 rounded bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 py-1.5 text-[10px] font-semibold hover:opacity-90 transition-all uppercase tracking-wider"
                    >
                      <Plus className="h-3 w-3" /> {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Editor Block */}
              <div className="border border-zinc-105 dark:border-zinc-850 rounded-lg p-3 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/20">
                <p className="text-xs font-bold text-zinc-705 dark:text-zinc-300">ส่วนท้าย (Footer)</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="ข้อความข้อตกลง / ลิขสิทธิ์"
                    value={activeBubble.footerText}
                    onChange={e => handleBubbleFieldChange('footerText', e.target.value)}
                    className="w-full rounded bg-white border border-zinc-200 px-2.5 py-1 text-xs outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[10px] text-zinc-500">สีพื้นหลังส่วนท้าย</label>
                    <input
                      type="color"
                      value={activeBubble.footerBgColor}
                      onChange={e => handleBubbleFieldChange('footerBgColor', e.target.value)}
                      className="h-6 w-10 border border-zinc-300 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Component Property Editor (1/2 Canvas split) */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs flex flex-col">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                คุณสมบัติคอมโพเนนต์
              </h3>

              {!selectedComponentId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-400 py-20">
                  <Info className="h-8 w-8 mb-2 opacity-50 text-brand-blue" />
                  <p className="text-xs font-semibold">เลือก Component ในรายการโครงสร้างการ์ดเพื่อตั้งค่าคุณสมบัติ</p>
                </div>
              ) : (
                (() => {
                  // Find selected component (it could be top level or nested inside a box)
                  let comp: BuilderComponent | undefined = activeBubble.bodyComponents.find(c => c.id === selectedComponentId);
                  let parentBox: BoxComponent | undefined = undefined;

                  if (!comp) {
                    // Look inside boxes
                    for (const bc of activeBubble.bodyComponents) {
                      if (bc.type === 'box' && bc.children) {
                        const match = bc.children.find(child => child.id === selectedComponentId);
                        if (match) {
                          comp = match;
                          parentBox = bc;
                          break;
                        }
                      }
                    }
                  }

                  if (!comp) return null;

                  return (
                    <div className="space-y-4 flex-1 overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold dark:bg-blue-950/20 dark:text-blue-450 dark:border-blue-900 uppercase">
                          {comp.type}
                        </span>
                        {parentBox && (
                          <span className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded font-mono">
                            in {parentBox.id.split('-')[0]}
                          </span>
                        )}
                      </div>

                      {/* TEXT Editor Fields */}
                      {comp.type === 'text' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">ข้อความ</label>
                            <textarea
                              rows={3}
                              value={comp.text}
                              onChange={e => updateComponentProperty(comp!.id, 'text', e.target.value, parentBox?.id)}
                              className="w-full text-xs rounded border border-zinc-200 p-2 outline-none focus:border-blue-500 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-zinc-500 mb-1">ขนาดตัวอักษร</label>
                              <select
                                value={comp.size || 'sm'}
                                onChange={e => updateComponentProperty(comp!.id, 'size', e.target.value, parentBox?.id)}
                                className="w-full text-xs rounded border border-zinc-200 p-1.5 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
                              >
                                {['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', '3xl', '4xl'].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] text-zinc-500 mb-1">ความหนา</label>
                              <select
                                value={comp.weight || 'regular'}
                                onChange={e => updateComponentProperty(comp!.id, 'weight', e.target.value, parentBox?.id)}
                                className="w-full text-xs rounded border border-zinc-200 p-1.5 dark:bg-zinc-955 dark:border-zinc-800 dark:text-white"
                              >
                                <option value="regular">บาง (Regular)</option>
                                <option value="bold">หนา (Bold)</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-zinc-500 mb-1">การจัดวางเนื้อหา</label>
                              <select
                                value={comp.align || 'start'}
                                onChange={e => updateComponentProperty(comp!.id, 'align', e.target.value, parentBox?.id)}
                                className="w-full text-xs rounded border border-zinc-200 p-1.5 dark:bg-zinc-955 dark:border-zinc-800 dark:text-white"
                              >
                                <option value="start">ชิดซ้าย (Start)</option>
                                <option value="center">กึ่งกลาง (Center)</option>
                                <option value="end">ชิดขวา (End)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] text-zinc-500 mb-1">ตัดคำยาว (Wrap)</label>
                              <select
                                value={comp.wrap !== false ? 'true' : 'false'}
                                onChange={e => updateComponentProperty(comp!.id, 'wrap', e.target.value === 'true', parentBox?.id)}
                                className="w-full text-xs rounded border border-zinc-200 p-1.5 dark:bg-zinc-955 dark:border-zinc-800 dark:text-white"
                              >
                                <option value="true">ใช่ (True)</option>
                                <option value="false">ไม่ (False)</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">สีข้อความ (Hex Code)</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={comp.color || '#111827'}
                                onChange={e => updateComponentProperty(comp!.id, 'color', e.target.value, parentBox?.id)}
                                className="flex-1 text-xs rounded border border-zinc-200 px-2 py-1 outline-none dark:bg-zinc-955 dark:border-zinc-800 dark:text-white"
                              />
                              <input
                                type="color"
                                value={comp.color || '#111827'}
                                onChange={e => updateComponentProperty(comp!.id, 'color', e.target.value, parentBox?.id)}
                                className="h-7 w-8 border border-zinc-300 rounded cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* IMAGE Editor Fields */}
                      {comp.type === 'image' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">URL รูปภาพ</label>
                            <input
                              type="text"
                              value={comp.url}
                              onChange={e => updateComponentProperty(comp!.id, 'url', e.target.value, parentBox?.id)}
                              className="w-full text-xs rounded border border-zinc-200 p-2 outline-none dark:bg-zinc-955 dark:border-zinc-800 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">ขนาดรูปภาพ (Size)</label>
                            <select
                              value={comp.size || 'full'}
                              onChange={e => updateComponentProperty(comp!.id, 'size', e.target.value, parentBox?.id)}
                              className="w-full text-xs rounded border border-zinc-200 p-1.5 dark:bg-zinc-955 dark:border-zinc-800 dark:text-white"
                            >
                              {['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', '3xl', '4xl', '5xl', 'full'].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">ลิงก์ Action เมื่อคลิก (URL)</label>
                            <input
                              type="text"
                              placeholder="เช่น https://liff.line.me"
                              value={comp.actionUri || ''}
                              onChange={e => updateComponentProperty(comp!.id, 'actionUri', e.target.value, parentBox?.id)}
                              className="w-full text-xs rounded border border-zinc-200 p-2 outline-none dark:bg-zinc-955 dark:border-zinc-800 dark:text-white"
                            />
                          </div>
                        </div>
                      )}

                      {/* BUTTON Editor Fields */}
                      {comp.type === 'button' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">ข้อความบนปุ่ม</label>
                            <input
                              type="text"
                              value={comp.text}
                              onChange={e => updateComponentProperty(comp!.id, 'text', e.target.value, parentBox?.id)}
                              className="w-full text-xs rounded border border-zinc-200 p-2 outline-none dark:bg-zinc-955 dark:border-zinc-800 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">รูปแบบปุ่ม (Style)</label>
                            <select
                              value={comp.style || 'primary'}
                              onChange={e => updateComponentProperty(comp!.id, 'style', e.target.value, parentBox?.id)}
                              className="w-full text-xs rounded border border-zinc-200 p-1.5 dark:bg-zinc-955 dark:border-zinc-800 dark:text-white"
                            >
                              <option value="primary">ปุ่มหลัก (Primary)</option>
                              <option value="secondary">ปุ่มรอง (Secondary)</option>
                              <option value="link">ข้อความลิงก์ (Link)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">สีพื้นหลังปุ่ม (Hex Code)</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={comp.color || '#0055FF'}
                                onChange={e => updateComponentProperty(comp!.id, 'color', e.target.value, parentBox?.id)}
                                className="flex-1 text-xs rounded border border-zinc-200 px-2 py-1 outline-none dark:bg-zinc-955 dark:border-zinc-800 dark:text-white"
                              />
                              <input
                                type="color"
                                value={comp.color || '#0055FF'}
                                onChange={e => updateComponentProperty(comp!.id, 'color', e.target.value, parentBox?.id)}
                                className="h-7 w-8 border border-zinc-300 rounded cursor-pointer"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">ลิงก์ Action ปลายทาง (Target URL)</label>
                            <input
                              type="text"
                              placeholder="เช่น https://liff.line.me"
                              value={comp.actionUri || ''}
                              onChange={e => updateComponentProperty(comp!.id, 'actionUri', e.target.value, parentBox?.id)}
                              className="w-full text-xs rounded border border-zinc-200 p-2 outline-none dark:bg-zinc-955 dark:border-zinc-800 dark:text-white"
                            />
                          </div>
                        </div>
                      )}

                      {/* BOX Editor Fields */}
                      {comp.type === 'box' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">ทิศทางการเรียงลำดับลูก (Layout)</label>
                            <select
                              value={comp.layout}
                              onChange={e => updateComponentProperty(comp!.id, 'layout', e.target.value)}
                              className="w-full text-xs rounded border border-zinc-200 p-1.5 dark:bg-zinc-955 dark:border-zinc-800 dark:text-white"
                            >
                              <option value="vertical">แนวตั้ง (Vertical)</option>
                              <option value="horizontal">แนวนอน (Horizontal)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">ระยะห่างระหว่างลูก (Spacing)</label>
                            <select
                              value={comp.spacing || 'none'}
                              onChange={e => updateComponentProperty(comp!.id, 'spacing', e.target.value)}
                              className="w-full text-xs rounded border border-zinc-200 p-1.5 dark:bg-zinc-955 dark:border-zinc-800 dark:text-white"
                            >
                              {['none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'].map(sp => (
                                <option key={sp} value={sp}>{sp}</option>
                              ))}
                            </select>
                          </div>
                          
                          {/* Inner Box children management */}
                          <div className="border border-zinc-150 rounded-lg p-2.5 space-y-2 bg-zinc-50/20 dark:bg-zinc-950/20">
                            <p className="text-[11px] font-bold text-zinc-705 dark:text-zinc-300">สมาชิกในกล่อง ({comp.children.length})</p>
                            <div className="space-y-1">
                              {comp.children.map((child) => (
                                <div
                                  key={child.id}
                                  onClick={() => setSelectedComponentId(child.id)}
                                  className="flex items-center justify-between p-1.5 bg-white dark:bg-zinc-950 border border-zinc-100 rounded text-[10px] font-medium"
                                >
                                  <span>{child.type}: {child.type === 'text' ? child.text : 'Child content'}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteComponent(child.id, comp!.id);
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex gap-1 pt-1">
                              <button
                                onClick={() => addComponent('text', comp!.id)}
                                className="flex-1 py-1 rounded bg-zinc-200 text-zinc-800 hover:bg-zinc-300 text-[9px] font-semibold dark:bg-zinc-800 dark:text-zinc-300"
                              >
                                + Text
                              </button>
                              <button
                                onClick={() => addComponent('button', comp!.id)}
                                className="flex-1 py-1 rounded bg-zinc-200 text-zinc-800 hover:bg-zinc-300 text-[9px] font-semibold dark:bg-zinc-800 dark:text-zinc-300"
                              >
                                + Button
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* DIVIDER Editor Fields */}
                      {comp.type === 'divider' && (
                        <div>
                          <label className="block text-[10px] text-zinc-500 mb-1">สีเส้นคั่น (Hex Code)</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={comp.color || '#e5e7eb'}
                              onChange={e => updateComponentProperty(comp!.id, 'color', e.target.value, parentBox?.id)}
                              className="flex-1 text-xs rounded border border-zinc-200 px-2 py-1 outline-none dark:bg-zinc-955 dark:border-zinc-800 dark:text-white"
                            />
                            <input
                              type="color"
                              value={comp.color || '#e5e7eb'}
                              onChange={e => updateComponentProperty(comp!.id, 'color', e.target.value, parentBox?.id)}
                              className="h-7 w-8 border border-zinc-300 rounded cursor-pointer"
                            />
                          </div>
                        </div>
                      )}

                      {/* SPACER Editor Fields */}
                      {comp.type === 'spacer' && (
                        <div>
                          <label className="block text-[10px] text-zinc-500 mb-1">ขนาดระยะห่าง (Size)</label>
                          <select
                            value={comp.size || 'md'}
                            onChange={e => updateComponentProperty(comp!.id, 'size', e.target.value, parentBox?.id)}
                            className="w-full text-xs rounded border border-zinc-200 p-1.5 dark:bg-zinc-955 dark:border-zinc-805 dark:text-white"
                          >
                            {['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* TRACKING PIXEL Editor Fields */}
                      {comp.type === 'pixel' && (
                        <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/20 p-3 text-[11px] text-indigo-900 dark:text-indigo-400 space-y-1.5 border border-indigo-150">
                          <p className="font-bold flex items-center gap-1">
                            <Info className="h-3.5 w-3.5" />
                            Tracking Pixel Image
                          </p>
                          <p className="leading-relaxed">
                            ระบบจะใส่รูปภาพโปร่งใสขนาด 1px พร้อมต่อลิงก์ Tracking ไปที่ Liff backend อัตโนมัติ:
                          </p>
                          <p className="font-mono text-[9px] break-all bg-white dark:bg-zinc-950 p-1.5 border rounded">
                            {form.pixelBaseUrl}/pixel?user_id=[userId]&content_id={form.contentId}&campaign_name={form.campaignName}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>

        {/* ── Right Panel: Preview & JSON (1/4 Width) ── */}
        <div className="xl:col-span-1 space-y-4">
          
          {/* Real-time LINE Mobile Preview */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
              LINE Mobile Preview
            </h3>

            {/* Chat Simulator Shell */}
            <div className="w-full rounded-2xl bg-[#7489ab] p-3 border border-zinc-300 dark:border-zinc-800 shadow-lg select-none">
              
              {/* Chat Header */}
              <div className="flex items-center gap-2 pb-2.5 border-b border-white/20 mb-2">
                <div className="h-7 w-7 rounded-full bg-white text-[#0055ff] flex items-center justify-center font-bold text-xs">
                  R
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-white">Roche Thailand</span>
                    <span className="h-3 w-3 bg-[#00c300] rounded-full flex items-center justify-center text-[8px] text-white">✓</span>
                  </div>
                  <span className="text-[8px] text-white/70">Official Account</span>
                </div>
              </div>

              {/* Flex Bubble Card container */}
              <div className="rounded-xl bg-white shadow-md overflow-hidden text-zinc-900 text-xs">
                
                {/* Simulated Header */}
                {(activeBubble.headerTitle || activeBubble.headerSubtitle) && (
                  <div
                    style={{ backgroundColor: activeBubble.headerBgColor }}
                    className="p-4 text-white"
                  >
                    <p className="font-bold text-base">{activeBubble.headerTitle || '🔬 Title'}</p>
                    {activeBubble.headerSubtitle && (
                      <p className="text-[10px] opacity-90 mt-1 leading-normal">{activeBubble.headerSubtitle}</p>
                    )}
                  </div>
                )}

                {/* Simulated Hero */}
                {activeBubble.heroUrl && (
                  <div className="relative aspect-[20/13] w-full overflow-hidden bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeBubble.heroUrl}
                      alt="Hero"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Simulated Body Components */}
                <div className="p-4 space-y-3">
                  {activeBubble.bodyComponents.map(comp => {
                    if (comp.type === 'text') {
                      return (
                        <p
                          key={comp.id}
                          style={{
                            fontSize: comp.size === 'xs' ? '10px' : comp.size === 'sm' ? '12px' : comp.size === 'lg' ? '16px' : comp.size === 'xl' ? '18px' : '14px',
                            fontWeight: comp.weight === 'bold' ? 'bold' : 'normal',
                            color: comp.color || '#111827',
                            textAlign: comp.align || 'left'
                          }}
                          className="leading-relaxed"
                        >
                          {comp.text || 'เนื้อหาข้อความ'}
                        </p>
                      );
                    }
                    if (comp.type === 'image') {
                      return (
                        <div key={comp.id} className="w-full overflow-hidden rounded bg-zinc-50 border border-zinc-105 my-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={comp.url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop'}
                            alt="Embed"
                            className="w-full object-cover max-h-36"
                          />
                        </div>
                      );
                    }
                    if (comp.type === 'button') {
                      const isLink = comp.style === 'link';
                      const isSecondary = comp.style === 'secondary';
                      return (
                        <button
                          key={comp.id}
                          style={{
                            backgroundColor: isLink ? 'transparent' : isSecondary ? '#f3f4f6' : comp.color || '#0055FF',
                            color: isLink ? comp.color || '#0055FF' : isSecondary ? '#374151' : '#ffffff'
                          }}
                          className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold ${
                            isLink ? 'text-center underline hover:opacity-80' : 'shadow-xs border border-zinc-200/50 hover:opacity-95'
                          }`}
                        >
                          {comp.text || 'ปุ่มกด'}
                        </button>
                      );
                    }
                    if (comp.type === 'divider') {
                      return (
                        <div
                          key={comp.id}
                          style={{ borderColor: comp.color || '#e5e7eb' }}
                          className="border-b my-2"
                        />
                      );
                    }
                    if (comp.type === 'spacer') {
                      const h = comp.size === 'xs' ? '8px' : comp.size === 'sm' ? '12px' : comp.size === 'lg' ? '24px' : comp.size === 'xl' ? '32px' : '16px';
                      return <div key={comp.id} style={{ height: h }} />;
                    }
                    if (comp.type === 'box') {
                      const isHoriz = comp.layout === 'horizontal';
                      return (
                        <div
                          key={comp.id}
                          className={`flex rounded-lg border border-dashed border-zinc-200/80 bg-zinc-50/20 p-2 gap-2 ${
                            isHoriz ? 'flex-row items-center justify-between' : 'flex-col'
                          }`}
                        >
                          {comp.children.map(child => {
                            if (child.type === 'text') {
                              return (
                                <span
                                  key={child.id}
                                  style={{
                                    fontSize: child.size === 'xs' ? '10px' : child.size === 'sm' ? '12px' : '14px',
                                    fontWeight: child.weight === 'bold' ? 'bold' : 'normal',
                                    color: child.color || '#111827'
                                  }}
                                >
                                  {child.text}
                                </span>
                              );
                            }
                            if (child.type === 'button') {
                              return (
                                <span
                                  key={child.id}
                                  style={{ color: child.color || '#0055ff' }}
                                  className="text-[10px] font-bold underline"
                                >
                                  {child.text}
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Simulated Footer */}
                {activeBubble.footerText && (
                  <div
                    style={{ backgroundColor: activeBubble.footerBgColor }}
                    className="p-3 text-center border-t border-zinc-100"
                  >
                    <p className="text-[9px] text-zinc-400 font-mono">{activeBubble.footerText}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions Pane */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">แผงดำเนินการ</h4>
            
            <button
              onClick={handleCopyJson}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 py-2.5 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850 shadow-xs"
            >
              <Copy className="h-4 w-4" /> คัดลอก LINE Flex JSON
            </button>

            {broadcastError && (
              <div className="rounded-lg bg-red-50 text-red-800 border border-red-200 p-3 text-xs dark:bg-red-950/20 dark:text-red-400 dark:border-red-900 flex items-start gap-1.5">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{broadcastError}</span>
              </div>
            )}

            <button
              id="broadcastBuilderBtn"
              onClick={handleBroadcast}
              disabled={sending}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-semibold text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> กำลังส่ง... {results.length}/{filteredMembers.length}</>
              ) : (
                <><Megaphone className="h-4 w-4" /> บรอดแคสต์ {filteredMembers.length} คน</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Real-time JSON Output Viewer (Bottom Panel) ── */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-955 p-5 dark:border-zinc-800 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3 flex-shrink-0">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Generated Flex Message JSON
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono">Real-time update</span>
        </div>
        <pre className="overflow-auto text-xs text-emerald-400 max-h-80 select-all font-mono leading-relaxed">
          {JSON.stringify(getFinalJson(), null, 2)}
        </pre>
      </div>

      {/* ── Broadcast Progress Modal overlay ── */}
      {showResultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            onClick={() => { if(!sending) setShowResultsModal(false); }}
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs transition-opacity duration-300"
          />

          <div className="relative w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-900 dark:bg-zinc-950 z-10 space-y-4 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-3 dark:border-zinc-850 flex-shrink-0">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Megaphone className="h-4.5 w-4.5 text-blue-600 animate-bounce" />
                <span>สถานะการส่งข้อความ LINE Flex Message</span>
              </h3>
              {!sending && (
                <button 
                  onClick={() => setShowResultsModal(false)}
                  className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-450"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-center bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-850 flex-shrink-0">
              <div>
                <p className="text-xl font-bold text-emerald-600">{successCount}</p>
                <p className="text-[10px] text-zinc-500">สำเร็จ</p>
              </div>
              <div>
                <p className="text-xl font-bold text-red-500">{errorCount}</p>
                <p className="text-[10px] text-zinc-500">ผิดพลาด</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[200px] border border-zinc-100 dark:border-zinc-850 rounded-lg p-2 bg-zinc-50/20 dark:bg-zinc-950/20">
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-450">
                  <Loader2 className="h-6 w-6 animate-spin mb-2" />
                  <p className="text-xs font-semibold">เริ่มประมวลผลการส่งข้อมูล...</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {results.map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 text-xs">
                      <span className="font-semibold">{r.displayName}</span>
                      {r.status === 'success' ? (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded font-bold">
                          ส่งสำเร็จ
                        </span>
                      ) : (
                        <span className="text-[10px] text-red-55 bg-red-55/10 px-2 py-0.5 rounded font-bold">
                          {r.message || 'ส่งผิดพลาด'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-850 flex justify-end flex-shrink-0">
              <button
                disabled={sending}
                onClick={() => setShowResultsModal(false)}
                className="rounded-lg bg-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 text-white px-4 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {sending ? 'กำลังส่งข้อมูล...' : 'ปิดหน้าต่าง'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
