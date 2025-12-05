// frontend/components/MotionWrapper.tsx
"use client";

import { motion } from "framer-motion";
import React from "react";

export default function MotionWrapper({ children }: { children: React.ReactNode }) {
  // FIX: Cast motion.div to 'any' so TypeScript accepts the className prop
  const MotionDiv = motion.div as any;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28 }}
      className="motion-wrapper"
    >
      {children}
    </MotionDiv>
  );
}
