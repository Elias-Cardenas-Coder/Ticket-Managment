'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FadeInUp } from './Animations';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', { redirect: false, email, password });

      // signIn returns undefined in some setups, check for ok
      // @ts-ignore
      if (!res || res.error) {
        // @ts-ignore
        setError(res?.error || 'Invalid credentials');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeInUp>
      <motion.div
        className="card-glass p-10 max-w-md mx-auto backdrop-blur-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="text-2xl font-bold mb-2 text-center text-slate-900 dark:text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Sign In
        </motion.h1>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
          Access your account to continue
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
              {'Email'}
            </label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
              {'Password'}
            </label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </motion.div>

          <motion.button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ delay: 0.4 }}
          >
            {loading ? (
              <motion.span animate={{ opacity: [0.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                Loading...
              </motion.span>
            ) : (
              'Login'
            )}
          </motion.button>
        </form>

      </motion.div>
    </FadeInUp>
  );
}
