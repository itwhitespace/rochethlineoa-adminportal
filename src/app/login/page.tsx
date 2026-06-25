'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail, AlertCircle, CheckCircle2, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { getDatabaseClient, isDatabaseConfigured } from '@/lib/database';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Check connection mode
    setIsLive(isDatabaseConfigured());

    // If already logged in, redirect to admin
    const session = localStorage.getItem('roche_admin_session') || document.cookie.includes('roche_admin_logged_in');
    if (session) {
      router.push('/admin');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      if (isLive) {
        // Authenticate against public.system_users table
        const database = getDatabaseClient();
        if (!database) {
          throw new Error('Database client failed to initialize');
        }

        const { data, error: authError } = await database
          .from('system_users')
          .select('email, role')
          .eq('email', email.trim().toLowerCase())
          .eq('password', password)
          .single();

        if (authError) {
          if (authError.code === '42P01' || (authError.message && authError.message.toLowerCase().includes('relation') && authError.message.toLowerCase().includes('not exist'))) {
            throw new Error('Database table "system_users" does not exist in Database. Please run the SQL Editor script in your Database dashboard first.');
          }

          // Check if the table is completely empty
          try {
            const { count, error: countError } = await database
              .from('system_users')
              .select('*', { count: 'exact', head: true });
            if (!countError && count === 0) {
              throw new Error('The "system_users" table in Database is currently empty. Please run the following SQL query in your Database SQL Editor to insert the default admin user: INSERT INTO system_users (email, password, role) VALUES (\'admin@roche.com\', \'admin123\', \'Admin\');');
            }
          } catch (e: any) {
            if (e.message && e.message.includes('system_users')) {
              throw e;
            }
          }

          throw new Error('Invalid email or password. Please verify your credentials.');
        }

        if (!data) {
          throw new Error('Invalid email or password.');
        }

        // Store session indicator with role details
        const session = { user: { email: data.email, role: data.role } };
        localStorage.setItem('roche_admin_session', JSON.stringify(session));
        document.cookie = "roche_admin_logged_in=true; path=/; max-age=86400"; // 1 day cookie
        setSuccess('Login successful. Redirecting...');
        setTimeout(() => router.push('/admin'), 1000);
      } else {
        // Mock Mode Authentication
        let mockAdmins = [
          { email: 'admin@roche.com', password: 'admin123', role: 'Admin' },
          { email: 'user@roche.com', password: 'user123', role: 'Viewer' }
        ];
        const stored = localStorage.getItem('roche_mock_admins');
        if (stored) {
          try {
            mockAdmins = JSON.parse(stored);
          } catch (e) { }
        }

        const matchingAdmin = mockAdmins.find(
          a => a.email.toLowerCase() === email.trim().toLowerCase() &&
            ((a as any).password === password || (a.email === 'admin@roche.com' && password === 'admin123'))
        );

        if (matchingAdmin) {
          const role = (matchingAdmin as any).role || (matchingAdmin.email.toLowerCase() === 'user@roche.com' ? 'Viewer' : 'Admin');
          localStorage.setItem('roche_admin_session', JSON.stringify({ user: { email: matchingAdmin.email, role } }));
          document.cookie = "roche_admin_logged_in=true; path=/; max-age=86400";
          setSuccess('Login successful (Mock Mode). Redirecting...');
          setTimeout(() => router.push('/admin'), 1000);
        } else {
          setError('Invalid email or password. (For Mock Mode, use admin@roche.com / admin123, user@roche.com / user123, or a newly created account.)');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred while connecting to the system.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8 animate-fade-in-up">
        {/* Branding Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Roche Admin Portal
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Backend Management and User Behavior Analytics Portal
          </p>
        </div>

        {/* Login Form Container */}
        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Connection Status Banner */}
            <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs border ${isLive
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
              : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
              }`}>
              {isLive ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Connected to Database (Live Mode)</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="leading-relaxed">
                    <strong>Simulation Mode (Mock Mode)</strong>
                    <br />
                    Use email: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono text-[10px]">admin@roche.com</code> / <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono text-[10px]">admin123</code> (Admin) or <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono text-[10px]">user@roche.com</code> / <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono text-[10px]">user123</code> (Viewer)
                  </span>
                </>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <p>{success}</p>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-700 dark:focus:bg-zinc-900"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-10 text-sm outline-none transition-all focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-700 dark:focus:bg-zinc-900"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-450 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-zinc-900 py-2.5 px-4 text-sm font-medium text-white transition-all hover:bg-zinc-800 focus:outline-none disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
