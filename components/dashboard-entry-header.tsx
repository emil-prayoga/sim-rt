"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function DashboardEntryHeader({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const [animateEntry, setAnimateEntry] = useState(false);
  const entryHandled = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (entryHandled.current) return;
    entryHandled.current = true;

    const shouldAnimate = window.sessionStorage.getItem("sirt-header-entry") === "pending";
    if (shouldAnimate) window.sessionStorage.removeItem("sirt-header-entry");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnimateEntry(shouldAnimate && window.location.pathname === "/");
  }, []);

  return (
    <motion.header
      className={className}
      initial={false}
      animate={animateEntry ? { y: [-18, 0] } : { y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 26, mass: 0.9 }}
      onAnimationComplete={() => { if (animateEntry) setAnimateEntry(false); }}
    >
      {children}
    </motion.header>
  );
}
