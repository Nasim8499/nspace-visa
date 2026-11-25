"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/** Apple-ish spring: quick to arrive, settles without a wobble. */
export const spring = { type: "spring", stiffness: 130, damping: 22, mass: 0.9 } as const;

/**
 * Scroll-in reveal on a real spring instead of a CSS transition, so sections
 * arrive with weight. Content is visible immediately for reduced-motion users
 * and when JS is unavailable.
 */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ ...spring, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Parent that releases its children one after another. */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const riseIn: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: spring },
};

export function Stagger({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-8% 0px" }}>
      {children}
    </motion.div>
  );
}

export function Rise({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={riseIn}>
      {children}
    </motion.div>
  );
}
