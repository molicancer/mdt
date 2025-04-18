"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import React from 'react';

interface MagicMoveClientProps {
  children: React.ReactNode;
}

export function MagicMoveClient({ children }: MagicMoveClientProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      {/* Wrap children in motion.div and key by pathname for smooth page transitions */}
      <motion.div key={pathname}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 