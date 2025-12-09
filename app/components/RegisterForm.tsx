'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FadeInUp } from './Animations';

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validations
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'An error occurred');
        return;
      }

      // After successful registration, sign in via NextAuth credentials
      const res = await signIn('credentials', { redirect: false, email, password });
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
          Create Account
        </motion.h1>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
          Sign up to get started
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Email Address
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
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Password
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

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Confirm Password
            </label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </motion.div>

          <motion.button
            type="submit"
            className="btn btn-primary w-full mt-6"
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
              'Register'
            )}
          </motion.button>
        </form>

        <motion.p
          className="text-center mt-6 text-sm text-slate-600 dark:text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Already have an account?{' '}
          <Link href="/login" className="btn-link">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </FadeInUp>
  );
}
