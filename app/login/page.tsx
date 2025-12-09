'use client';

import { LoginForm } from '@/app/components/LoginForm';
import { AuthControls } from '@/app/components/AuthControls';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-black dark:bg-black relative overflow-hidden">
      <AuthControls />
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-green-500/10 dark:bg-green-500/10 rounded-full blur-3xl"
        animate={{ y: [0, 40, 0], x: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl"
        animate={{ y: [0, -40, 0], x: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 bg-green-500/5 dark:bg-green-500/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="w-full max-w-md z-10">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 mb-4 shadow-lg shadow-green-500/50"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Welcome to HelpDeskPro
          </h1>
          <p className="mt-2 text-slate-400 dark:text-green-500/60">Sign in to your account</p>
        </motion.div>

        <LoginForm />
      </div>
    </div>
  );
}
