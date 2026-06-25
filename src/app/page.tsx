'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('roche_admin_session') || document.cookie.includes('roche_admin_logged_in');
    if (session) {
      router.push('/admin');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
    </div>
  );
}
