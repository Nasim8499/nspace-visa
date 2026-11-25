"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Page-level fade. Opacity only: a transform on this wrapper would create a
 * containing block and break the position:sticky scenes inside /careers and
 * the home flight journey.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
