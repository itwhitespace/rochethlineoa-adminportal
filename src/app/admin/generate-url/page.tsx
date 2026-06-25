'use client';

import { useState, useEffect } from 'react';
import { 
  Link2, 
  Copy, 
  Check, 
  Globe, 
  Hash, 
  FileText, 
  Layers, 
  Info,
  ExternalLink,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export default function GenerateUrlPage() {
  // Input States
  const [destinationUrl, setDestinationUrl] = useState('');
  const [liffId, setLiffId] = useState('2001928374-lkJae12P');
  const [contentId, setContentId] = useState('onc_001');
  const [eventSource, setEventSource] = useState('Broadcast');
  const [eventDa, setEventDa] = useState('Undefined');
  const [campaignName, setCampaignName] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('roche_liff_id');
    if (stored) {
      setLiffId(stored);
    }
  }, []);
  
  // Output state
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [warning, setWarning] = useState('');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setWarning('');

    if (!destinationUrl) {
      return;
    }

    // Basic URL validation
    let targetUrl = destinationUrl.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      setWarning('Warning: Destination URL should start with http:// or https://');
    }

    // Construct url query parameters
    const encodedTarget = encodeURIComponent(targetUrl);
    const encodedContent = encodeURIComponent(contentId.trim());
    const encodedSource = encodeURIComponent(eventSource);
    const encodedDa = encodeURIComponent(eventDa);
    const encodedCampaign = encodeURIComponent(campaignName.trim());

    // Format: https://liff.line.me/{LIFF_ID}?target={TARGET_URL}&content_id={CONTENT_ID}&evensource={Even_source}&evenDA={Even_DA}&CampaignName={Campaign_Name}
    const fullUrl = `https://liff.line.me/${liffId.trim()}?target=${encodedTarget}&content_id=${encodedContent}&evensource=${encodedSource}&evenDA=${encodedDa}&CampaignName=${encodedCampaign}`;
    
    setGeneratedUrl(fullUrl);
  };

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setDestinationUrl('');
    setContentId('onc_001');
    setEventSource('Broadcast');
    setEventDa('Undefined');
    setCampaignName('');
    setGeneratedUrl('');
    setWarning('');
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="border-b border-zinc-100 pb-5 dark:border-zinc-900">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
          <Link2 className="h-6 w-6 text-zinc-500" />
          <span>Generate URL Tracking</span>
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Generate tracking links for LINE campaigns to track individual content viewing behavior.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        
        {/* Left: Input Form */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <Globe className="h-4.5 w-4.5 text-brand-blue" />
              <span>Campaign & Destination Link Information</span>
            </h3>

            <form onSubmit={handleGenerate} className="space-y-5">
              
              {/* Destination URL */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 mb-1.5">
                  Destination URL (target) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://www.roche.co.th/products/oncology"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm outline-none transition-all focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-700 dark:focus:bg-zinc-900"
                />
              </div>

              {/* Content ID */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 mb-1.5">
                  Content ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="onc_001"
                  value={contentId}
                  onChange={(e) => setContentId(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm outline-none transition-all focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-700 dark:focus:bg-zinc-900 font-mono"
                />
              </div>

              {/* Event Source & Event DA (Row layout) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 mb-1.5">
                    Event Source
                  </label>
                  <select
                    value={eventSource}
                    onChange={(e) => setEventSource(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm outline-none cursor-pointer focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-700 dark:focus:bg-zinc-900"
                  >
                    <option value="Broadcast">Broadcast</option>
                    <option value="Richmenu">Richmenu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 mb-1.5">
                    Event DA
                  </label>
                  <select
                    value={eventDa}
                    onChange={(e) => setEventDa(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm outline-none cursor-pointer focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-700 dark:focus:bg-zinc-900"
                  >
                    <option value="Undefined">Undefined</option>
                    <option value="HCP">HCP</option>
                    <option value="Lung">Lung</option>
                    <option value="Nephrology">Nephrology</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Campaign Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 mb-1.5">
                  Campaign Name
                </label>
                <input
                  type="text"
                  placeholder="World_Cancer_Day"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm outline-none transition-all focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-700 dark:focus:bg-zinc-900"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-zinc-900 py-2.5 px-4 text-sm font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <Link2 className="h-4 w-4" />
                  <span>Generate Link</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 py-2.5 px-4 text-sm font-semibold text-zinc-650 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-350 dark:hover:bg-zinc-850"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reset</span>
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Right: Output & Instructions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Result Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-emerald-500" />
              <span>Generated Tracking Link</span>
            </h3>

            {generatedUrl ? (
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    readOnly
                    rows={6}
                    value={generatedUrl}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs font-mono leading-relaxed outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-300 resize-none select-all"
                  />
                  
                  {warning && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-255 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <p>{warning}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 px-4 text-sm font-semibold text-white transition-all hover:bg-emerald-600"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                  <a
                    href={destinationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    title="Open Destination Page"
                  >
                    <ExternalLink className="h-4.5 w-4.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed border-zinc-200 rounded-lg py-12 dark:border-zinc-800 text-zinc-400">
                <Link2 className="h-10 w-10 mb-3 text-zinc-300 stroke-1" />
                <p className="text-xs font-semibold">Enter tracking information and click "Generate Link" on the left.</p>
                <p className="text-[10px] text-zinc-500 mt-1">The generated link will appear here.</p>
              </div>
            )}
          </div>

          {/* Guidelines / Help Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/40 text-xs text-zinc-500 dark:text-zinc-400 space-y-3">
            <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Info className="h-4.5 w-4.5 text-zinc-500" />
              <span>Tracking Link Guidelines</span>
            </h4>
            <p className="leading-relaxed">
              <strong>URL Structure:</strong> The generated link points to a LINE LIFF application. The LIFF application captures all campaign parameters and redirects the user to the destination URL, tracking interaction telemetry.
            </p>
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1.5 rounded font-mono text-[10px] text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800/80 mb-2">
              <span>Active LIFF ID:</span>
              <span className="font-semibold text-zinc-850 dark:text-zinc-200 bg-zinc-200/50 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{liffId}</span>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded font-mono text-[10px] break-all leading-normal">
              FULL SCHEMA:<br/>
              https://liff.line.me/&#123;LIFF_ID&#125;?target=&#123;TARGET&#125;&amp;content_id=&#123;CONTENT&#125;&amp;evensource=&#123;SOURCE&#125;&amp;evenDA=&#123;DA&#125;&amp;CampaignName=&#123;CAMPAIGN&#125;
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
