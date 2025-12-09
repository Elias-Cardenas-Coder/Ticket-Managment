'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedCard({ children, delay = 0, className = '' }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={`card ${className}`}
    >
      {children}
    </motion.div>
  );
}
