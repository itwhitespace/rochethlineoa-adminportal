import { createClient } from '@supabase/supabase-js';

export interface DatabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
}

export function getDatabaseConfig(): DatabaseConfig | null {
  // 1. Check local storage if on client side
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('roche_database_url');
    const customKey = localStorage.getItem('roche_database_anon_key');
    if (customUrl && customKey) {
      return {
        url: customUrl,
        anonKey: customKey,
        isCustom: true
      };
    }
  }

  // 2. Check environment variables
  const envUrl = process.env.NEXT_PUBLIC_DATABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_DATABASE_ANON_KEY;
  if (envUrl && envKey) {
    return {
      url: envUrl,
      anonKey: envKey,
      isCustom: false
    };
  }

  // 3. Fallback to default project credentials provided by the user
  const defaultUrl = 'https://knkcassjktpolmpdfqfb.supabase.co';
  const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtua2Nhc3Nqa3Rwb2xtcGRmcWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNjQxMDAsImV4cCI6MjA5Nzg0MDEwMH0.SGUaY4AiCV70Wj4UdxZP3pf7RHFT-E1HBGFPXFkCLvg';
  
  return {
    url: defaultUrl,
    anonKey: defaultKey,
    isCustom: false
  };
}

export function getDatabaseClient() {
  const config = getDatabaseConfig();
  if (!config) return null;

  try {
    let url = config.url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}.supabase.co`;
    }
    return createClient(url, config.anonKey);
  } catch (error) {
    console.error('Failed to initialize Database client:', error);
    return null;
  }
}

export function isDatabaseConfigured(): boolean {
  return getDatabaseConfig() !== null;
}
