'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface FadeInUpProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

export function FadeInUp({ children, delay = 0, duration = 0.6 }: FadeInUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

export function ScaleIn({ children, delay = 0, duration = 0.5 }: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  delay?: number;
  duration?: number;
}

export function SlideIn({ children, direction = 'left', delay = 0, duration = 0.6 }: SlideInProps) {
  const xValue = direction === 'left' ? -50 : 50;
  return (
    <motion.div
      initial={{ opacity: 0, x: xValue }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

interface HoverScaleProps {
  children: React.ReactNode;
  scale?: number;
}

export function HoverScale({ children, scale = 1.05 }: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
