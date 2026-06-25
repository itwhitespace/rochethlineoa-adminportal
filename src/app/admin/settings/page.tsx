'use client';

import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  ShieldAlert,
  KeyRound,
  Mail,
  Users,
  History,
  Lock,
  X,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  UserCheck,
  Pencil
} from 'lucide-react';
import { getDatabaseConfig, getDatabaseClient, isDatabaseConfigured } from '@/lib/database';

export default function SettingsPage() {
  const [isLive, setIsLive] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // LIFF Configuration States
  const [liffId, setLiffId] = useState('2001928374-lkJae12P');
  const [newLiffId, setNewLiffId] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  // LINE Token Configuration States
  const [lineToken, setLineToken] = useState('');
  const [newLineToken, setNewLineToken] = useState('');
  const [confirmType, setConfirmType] = useState<'liff' | 'lineToken'>('liff');

  // History Log States
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<{ timestamp: string; action: string; operator: string }[]>([]);

  // Admin Management States
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRoleInput, setAdminRoleInput] = useState('Viewer');
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [mockAdmins, setMockAdmins] = useState<{ email: string; role?: string; created_at?: string }[]>([]);
  const [currentAdminEmail, setCurrentAdminEmail] = useState('admin@roche.com');
  const [currentAdminRole, setCurrentAdminRole] = useState('Viewer');

  // Eye icon password states
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fetchAdmins = async () => {
    if (isDatabaseConfigured()) {
      const database = getDatabaseClient();
      if (!database) return;
      try {
        const { data, error } = await database
          .from('system_users')
          .select('email, role, created_at')
          .order('created_at', { ascending: true });
        if (!error && data) {
          setMockAdmins(data as any);
        }
      } catch (err) {
        console.error('Error fetching system users:', err);
      }
    } else {
      const storedAdmins = localStorage.getItem('roche_mock_admins');
      if (storedAdmins) {
        try {
          setMockAdmins(JSON.parse(storedAdmins));
        } catch (e) {}
      } else {
        const defaultList = [
          { email: 'admin@roche.com', password: 'admin123', role: 'Admin' },
          { email: 'user@roche.com', password: 'user123', role: 'Viewer' }
        ];
        localStorage.setItem('roche_mock_admins', JSON.stringify(defaultList));
        setMockAdmins(defaultList);
      }
    }
  };

  useEffect(() => {
    // 1. Check live status
    const configured = isDatabaseConfigured();
    setIsLive(configured);

    // 2. Load active admin session
    try {
      const sessionStr = localStorage.getItem('roche_admin_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session?.user?.email) {
          setCurrentAdminEmail(session.user.email);
        }
        if (session?.user?.role) {
          setCurrentAdminRole(session.user.role);
        }
      }
    } catch (e) {}

    // 3. Load or initialize LIFF ID
    const storedLiff = localStorage.getItem('roche_liff_id');
    if (storedLiff) {
      setLiffId(storedLiff);
    } else {
      localStorage.setItem('roche_liff_id', '2001928374-lkJae12P');
    }

    // 3.5 Load or initialize LINE Token
    const storedToken = localStorage.getItem('roche_line_token');
    if (storedToken) {
      setLineToken(storedToken);
    }

    // 4. Load or initialize history logs
    const storedLogs = localStorage.getItem('roche_history_logs');
    if (storedLogs) {
      try {
        setHistoryLogs(JSON.parse(storedLogs));
      } catch (e) {}
    } else {
      const defaultLogs = [
        { timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString('en-US', { hour12: false }), action: 'System Initialized', operator: 'system' },
        { timestamp: new Date(Date.now() - 3600000).toLocaleString('en-US', { hour12: false }), action: 'Set initial LIFF ID to 2001928374-lkJae12P', operator: 'admin@roche.com' }
      ];
      localStorage.setItem('roche_history_logs', JSON.stringify(defaultLogs));
      setHistoryLogs(defaultLogs);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [isLive]);

  const addHistoryLog = (action: string, operator: string) => {
    const logsStr = localStorage.getItem('roche_history_logs');
    let logs = [];
    if (logsStr) {
      try {
        logs = JSON.parse(logsStr);
      } catch (e) {}
    }
    const newLog = {
      timestamp: new Date().toLocaleString('en-US', { hour12: false }),
      action,
      operator
    };
    const updated = [newLog, ...logs];
    localStorage.setItem('roche_history_logs', JSON.stringify(updated));
    setHistoryLogs(updated);
  };

  const verifyAdminCredentials = async (email: string, pass: string): Promise<{ valid: boolean; role?: string }> => {
    if (isDatabaseConfigured()) {
      const database = getDatabaseClient();
      if (!database) return { valid: false };
      try {
        const { data, error } = await database
          .from('system_users')
          .select('role')
          .eq('email', email.trim().toLowerCase())
          .eq('password', pass)
          .single();
        if (error || !data) return { valid: false };
        return { valid: true, role: data.role };
      } catch (err) {
        console.error('Verify admin credentials error:', err);
        return { valid: false };
      }
    } else {
      let mockList = [
        { email: 'admin@roche.com', password: 'admin123', role: 'Admin' },
        { email: 'user@roche.com', password: 'user123', role: 'Viewer' }
      ];
      const stored = localStorage.getItem('roche_mock_admins');
      if (stored) {
        try {
          mockList = JSON.parse(stored);
        } catch (e) {}
      }
      const match = mockList.find(
        a => a.email.toLowerCase() === email.trim().toLowerCase() && 
        ((a as any).password === pass || (a.email === 'admin@roche.com' && pass === 'admin123'))
      );
      if (match) {
        return { valid: true, role: (match as any).role || (match.email === 'user@roche.com' ? 'Viewer' : 'Admin') };
      }
      return { valid: false };
    }
  };

  const handleConfirmSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmError('');
    setConfirmLoading(true);

    if (confirmType === 'liff' && !newLiffId.trim()) {
      setConfirmError('Please enter the new LIFF ID');
      setConfirmLoading(false);
      return;
    }
    if (confirmType === 'lineToken' && !newLineToken.trim()) {
      setConfirmError('Please enter the new LINE Channel Access Token');
      setConfirmLoading(false);
      return;
    }

    if (!confirmEmail.trim() || !confirmPassword) {
      setConfirmError('Please enter admin email and password to verify identity');
      setConfirmLoading(false);
      return;
    }

    try {
      const { valid, role } = await verifyAdminCredentials(confirmEmail, confirmPassword);
      if (!valid) {
        setConfirmError('Invalid admin email or password');
        setConfirmLoading(false);
        return;
      }

      if (role !== 'Admin') {
        setConfirmError('Access Denied: Only users with Admin role can modify configuration.');
        setConfirmLoading(false);
        return;
      }

      if (confirmType === 'liff') {
        // Save LIFF ID
        const oldLiff = liffId;
        localStorage.setItem('roche_liff_id', newLiffId.trim());
        setLiffId(newLiffId.trim());

        // Log action
        addHistoryLog(`Updated LIFF ID from '${oldLiff}' to '${newLiffId.trim()}'`, confirmEmail.trim());

        setSuccess('LIFF ID updated successfully!');
      } else {
        // Save LINE Token
        const oldToken = lineToken ? `${lineToken.substring(0, 5)}...` : 'empty';
        localStorage.setItem('roche_line_token', newLineToken.trim());
        setLineToken(newLineToken.trim());

        // Log action
        addHistoryLog(`Updated LINE Channel Access Token from '${oldToken}' to '${newLineToken.trim().substring(0, 5)}...'`, confirmEmail.trim());

        setSuccess('LINE Channel Access Token updated successfully!');
      }

      setIsConfirmModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Confirm error:', err);
      setConfirmError(err.message || 'Error verifying credentials');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');
    setAdminLoading(true);

    if (currentAdminRole !== 'Admin') {
      setAdminError('Access Denied: Only Administrators can create new accounts.');
      setAdminLoading(false);
      return;
    }

    if (!adminEmail || !adminPassword) {
      setAdminError('Please fill in all fields.');
      setAdminLoading(false);
      return;
    }

    if (adminPassword.length < 6) {
      setAdminError('Password must be at least 6 characters.');
      setAdminLoading(false);
      return;
    }

    try {
      if (isLive) {
        const database = getDatabaseClient();
        if (!database) {
          throw new Error('Database client failed to initialize');
        }

        const { error: insertErr } = await database
          .from('system_users')
          .insert({
            email: adminEmail.trim().toLowerCase(),
            password: adminPassword,
            role: adminRoleInput
          });

        if (insertErr) throw insertErr;

        addHistoryLog(`Added system user (Live Mode): ${adminEmail.trim()} (${adminRoleInput})`, currentAdminEmail);
        setAdminSuccess(`System user account ${adminEmail.trim()} (${adminRoleInput}) successfully created!`);
        fetchAdmins();
      } else {
        const exists = mockAdmins.some(a => a.email.toLowerCase() === adminEmail.trim().toLowerCase());
        if (exists) {
          setAdminError('This email is already registered.');
          setAdminLoading(false);
          return;
        }

        const newAdmins = [...mockAdmins, { email: adminEmail.trim().toLowerCase(), password: adminPassword, role: adminRoleInput }];
        localStorage.setItem('roche_mock_admins', JSON.stringify(newAdmins));
        setMockAdmins(newAdmins);

        addHistoryLog(`Added system user (Mock Mode): ${adminEmail.trim()} (${adminRoleInput})`, currentAdminEmail);
        setAdminSuccess(`System user account ${adminEmail.trim()} (${adminRoleInput}) successfully created!`);
      }

      setAdminEmail('');
      setAdminPassword('');
    } catch (err: any) {
      console.error('Error creating admin:', err);
      setAdminError(err.message || 'An error occurred during admin registration.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeleteAdmin = async (emailToDelete: string) => {
    if (emailToDelete === 'admin@roche.com') return;

    if (currentAdminRole !== 'Admin') {
      alert('Access Denied: Only Administrators can delete accounts.');
      return;
    }

    if (confirm(`Are you sure you want to delete the administrator account for ${emailToDelete}?`)) {
      try {
        if (isLive) {
          const database = getDatabaseClient();
          if (!database) return;
          const { error } = await database
            .from('system_users')
            .delete()
            .eq('email', emailToDelete.toLowerCase());

          if (error) {
            alert(`Error deleting user: ${error.message}`);
          } else {
            addHistoryLog(`Deleted admin account: ${emailToDelete}`, currentAdminEmail);
            setAdminSuccess(`Admin account ${emailToDelete} has been successfully deleted.`);
            setTimeout(() => setAdminSuccess(''), 3000);
            fetchAdmins();
          }
        } else {
          const updated = mockAdmins.filter(a => a.email.toLowerCase() !== emailToDelete.toLowerCase());
          localStorage.setItem('roche_mock_admins', JSON.stringify(updated));
          setMockAdmins(updated);

          addHistoryLog(`Deleted admin account: ${emailToDelete}`, currentAdminEmail);
          setAdminSuccess(`Admin account ${emailToDelete} has been successfully deleted.`);
          setTimeout(() => setAdminSuccess(''), 3000);
        }
      } catch (err: any) {
        console.error('Delete error:', err);
        alert(err.message || 'An error occurred while deleting user.');
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="border-b border-zinc-100 pb-5 dark:border-zinc-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <SettingsIcon className="h-6 w-6 text-zinc-500" />
            <span>Settings</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Manage system LIFF ID configurations and administrator account privileges.
            </p>
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">|</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <div className={`h-2.5 w-2.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className={isLive ? 'text-emerald-600 dark:text-emerald-450' : 'text-amber-600 dark:text-amber-450'}>
                {isLive ? 'Live Mode (Database)' : 'Mock Mode (Simulation)'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white py-2.5 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850 transition-all shadow-xs"
          >
            <History className="h-4.5 w-4.5 text-zinc-500" />
            <span>History Log</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 animate-fade-in-up">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50 animate-fade-in-up">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Configurations */}
        <div className="space-y-8">
          {/* LINE LIFF ID Protection Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2.5 mb-3">
                <Lock className="h-5 w-5 text-brand-blue" />
                <span>LINE LIFF ID Configuration</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                The LIFF ID is automatically applied when generating tracking URLs for LINE campaigns. 
                To ensure system security, admin privileges must be verified before modifying this configuration.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 mb-2">
                  Active LIFF ID
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    readOnly
                    value={liffId}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm font-mono text-zinc-600 outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 select-all"
                  />
                  {currentAdminRole === 'Admin' ? (
                    <button
                      onClick={() => {
                        setConfirmType('liff');
                        setNewLiffId(liffId);
                        setConfirmEmail('');
                        setConfirmPassword('');
                        setConfirmError('');
                        setIsConfirmModalOpen(true);
                      }}
                      className="flex-shrink-0 flex items-center justify-center p-2.5 rounded-lg bg-zinc-900 text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      title="Edit LIFF ID"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="flex-shrink-0 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 py-2.5 px-3.5 text-xs text-zinc-400 font-medium border border-zinc-200 dark:border-zinc-700">
                      <Lock className="h-3.5 w-3.5" />
                      <span>Locked</span>
                    </div>
                  )}
                </div>
                {currentAdminRole !== 'Admin' && (
                  <p className="text-[10px] text-zinc-400 mt-2">
                    * Administrator privileges are required to modify the LINE LIFF ID.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* LINE Channel Access Token Protection Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2.5 mb-3">
                <Lock className="h-5 w-5 text-brand-blue" />
                <span>LINE Channel Access Token</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                This token is used for broadcasting Flex Messages and other campaign messages.
                To ensure system security, admin privileges must be verified before modifying this configuration.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 mb-2">
                  Active Channel Access Token
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="password"
                    readOnly
                    value={lineToken ? '••••••••••••••••••••••••••••••••' : ''}
                    placeholder="Not Configured"
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm font-mono text-zinc-650 outline-none dark:border-zinc-805 dark:bg-zinc-950 dark:text-zinc-400"
                  />
                  {currentAdminRole === 'Admin' ? (
                    <button
                      onClick={() => {
                        setConfirmType('lineToken');
                        setNewLineToken(lineToken);
                        setConfirmEmail('');
                        setConfirmPassword('');
                        setConfirmError('');
                        setIsConfirmModalOpen(true);
                      }}
                      className="flex-shrink-0 flex items-center justify-center p-2.5 rounded-lg bg-zinc-900 text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      title="Edit Channel Access Token"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="flex-shrink-0 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 py-2.5 px-3.5 text-xs text-zinc-400 font-medium border border-zinc-200 dark:border-zinc-700">
                      <Lock className="h-3.5 w-3.5" />
                      <span>Locked</span>
                    </div>
                  )}
                </div>
                {currentAdminRole !== 'Admin' && (
                  <p className="text-[10px] text-zinc-400 mt-2">
                    * Administrator privileges are required to modify the LINE Channel Access Token.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Management Section */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-100 pb-4 mb-5 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2.5">
              <UserCheck className="h-5 w-5 text-brand-blue" />
              <span>System Accounts</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Create, configure roles, or delete system users for accessing the Analytics Dashboard.
            </p>
          </div>

          <div className="space-y-6">
            {/* Create Admin Form */}
            {currentAdminRole === 'Admin' ? (
              <div className="space-y-4 bg-zinc-50/50 p-4 rounded-xl dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-850">
                <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Add System Account
                </h4>

                {adminError && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-800 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50 animate-fade-in-up">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <p>{adminError}</p>
                  </div>
                )}

                {adminSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 animate-fade-in-up">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <p>{adminSuccess}</p>
                  </div>
                )}

                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 mb-1.5">
                        Email
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="block w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs outline-none transition-all focus:border-zinc-400 dark:border-zinc-805 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-700"
                          placeholder="admin2@roche.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                          <KeyRound className="h-4 w-4" />
                        </div>
                        <input
                          type={showAdminPassword ? 'text' : 'password'}
                          required
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="block w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-10 text-xs outline-none transition-all focus:border-zinc-400 dark:border-zinc-805 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-700"
                          placeholder="At least 6 chars"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-650"
                        >
                          {showAdminPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Role Select Dropdown */}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 mb-1.5">
                      System Permission Role
                    </label>
                    <select
                      value={adminRoleInput}
                      onChange={(e) => setAdminRoleInput(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-200 bg-white py-2 px-3 text-xs outline-none cursor-pointer focus:border-zinc-400 dark:border-zinc-805 dark:bg-zinc-950 dark:text-white"
                    >
                      <option value="Viewer">Viewer (Read-Only access to metrics & logs)</option>
                      <option value="Admin">Admin (Full access to configurations & accounts)</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={adminLoading}
                      className="flex items-center gap-1.5 rounded-lg bg-zinc-950 py-2 px-4 text-xs font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      {adminLoading ? (
                        <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                      ) : (
                        <>
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>Add Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="rounded-lg bg-zinc-50 p-4 border border-zinc-200 dark:bg-zinc-950/20 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-2.5">
                <Lock className="h-4.5 w-4.5 text-zinc-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">Account Management Restricted</p>
                  <p className="mt-1 leading-normal text-[11px]">
                    You are logged in as a **Viewer**. Creation or deletion of system user accounts requires full **Admin** permissions role.
                  </p>
                </div>
              </div>
            )}

            {/* Active Admins List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-4 w-4 text-zinc-400" />
                <span>Active System Accounts</span>
              </h4>

              <div className="rounded-lg border border-zinc-150 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-850">
                  {mockAdmins.map((adm, index) => (
                    <div key={index} className="px-4 py-3 flex items-center justify-between text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold flex items-center justify-center text-[10px]">
                          {adm.email.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{adm.email}</span>
                          {adm.created_at && (
                            <span className="block text-[9px] text-zinc-400">Created: {new Date(adm.created_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {adm.email === 'admin@roche.com' ? (
                          <span className="text-[10px] bg-zinc-100 text-zinc-550 border border-zinc-200/50 font-bold px-2.5 py-0.5 rounded-full dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/50">
                            Default Admin
                          </span>
                        ) : (
                          <>
                            <span className={`text-[10px] border px-2.5 py-0.5 rounded-full font-semibold ${
                              adm.role === 'Admin' 
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-250 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                            }`}>
                              {adm.role || 'Admin'}
                            </span>
                            {currentAdminRole === 'Admin' && (
                              <button
                                onClick={() => handleDeleteAdmin(adm.email)}
                                className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Admin Verification Dialog for LIFF ID Editing */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            onClick={() => setIsConfirmModalOpen(false)}
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs transition-opacity duration-300"
          />

          <div className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-900 dark:bg-zinc-950 animate-fade-in-up z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-900 flex-shrink-0">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-zinc-650" />
                <span>Verify Admin Privileges</span>
              </h3>
              <button 
                onClick={() => setIsConfirmModalOpen(false)}
                className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-550"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Please enter the new {confirmType === 'liff' ? 'LIFF ID' : 'LINE Channel Access Token'} along with an administrator's email and password to verify and apply this configuration.
            </p>

            {confirmError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-800 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p>{confirmError}</p>
              </div>
            )}

            <form onSubmit={handleConfirmSaveConfig} className="space-y-4">
              {confirmType === 'liff' ? (
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 mb-1">
                    New LIFF ID
                  </label>
                  <input
                    type="text"
                    required
                    value={newLiffId}
                    onChange={(e) => setNewLiffId(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-xs outline-none transition-all focus:border-zinc-400 focus:bg-white dark:border-zinc-805 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-700 dark:focus:bg-zinc-900 font-mono"
                    placeholder="2001928374-lkJae12P"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 mb-1">
                    New Channel Access Token
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newLineToken}
                    onChange={(e) => setNewLineToken(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-xs outline-none transition-all focus:border-zinc-400 focus:bg-white dark:border-zinc-805 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-700 dark:focus:bg-zinc-900 font-mono resize-none"
                    placeholder="Enter LINE Channel Access Token..."
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-xs outline-none transition-all focus:border-zinc-400 focus:bg-white dark:border-zinc-805 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-700 dark:focus:bg-zinc-900"
                  placeholder="admin@roche.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-3 pr-10 text-xs outline-none transition-all focus:border-zinc-400 focus:bg-white dark:border-zinc-805 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-700 dark:focus:bg-zinc-900"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-650 animate-pulse"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmLoading}
                  className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {confirmLoading && <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />}
                  <span>Verify and Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. History Log Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            onClick={() => setIsHistoryModalOpen(false)}
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs transition-opacity duration-300"
          />

          <div className="relative w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-900 dark:bg-zinc-950 animate-fade-in-up z-10 space-y-4 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-900 flex-shrink-0">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <History className="h-5 w-5 text-zinc-500" />
                <span>System History Log</span>
              </h3>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-550"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px] border border-zinc-100 dark:border-zinc-850 rounded-lg p-2.5 bg-zinc-50/50 dark:bg-zinc-950/20">
              {historyLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 py-12">
                  <History className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-xs font-semibold">No system modification history found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyLogs.map((log, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/60 dark:border-zinc-850/80 shadow-2xs space-y-1.5 text-xs hover:border-zinc-300 dark:hover:bg-zinc-850 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 leading-normal">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-mono whitespace-nowrap">
                          {log.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-450">
                        <span className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 px-1.5 py-0.5 rounded font-mono">
                          operator: {log.operator}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex justify-end flex-shrink-0">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-zinc-850 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
