'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/app/components/Navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const user = session?.user as any | undefined;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && user) {
      setName(user.name || '');
    }
  }, [status, router, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Name is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Profile updated successfully');
        await update({ name });
      } else {
        alert(data.error || 'Error updating profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(data.error || 'Error changing password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-green-50/30 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-green-600 dark:border-t-green-400 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-black">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <motion.div
            className="card-glass p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Profile Information
            </h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="input opacity-60 cursor-not-allowed"
                  disabled
                  readOnly
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </motion.div>

          {/* Change Password */}
          <motion.div
            className="card-glass p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Change Password
            </h2>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
