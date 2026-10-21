"use client";

import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

type Direction = "left" | "right" | "up" | "down";
type ElementTag = "div" | "section" | "article" | "header";

type DirectionalMotionProps = {
  as?: ElementTag;
  direction: Direction;
  className?: string;
  delay?: number;
  children: ReactNode;
  role?: string;
  "aria-label"?: string;
};

const offsetByDirection: Record<Direction, { x: number; y: number }> = {
  left: { x: -48, y: 0 },
  right: { x: 48, y: 0 },
  up: { x: 0, y: -36 },
  down: { x: 0, y: 36 },
};

export function DirectionalMotion({
  as = "div",
  direction,
  className,
  delay = 0,
  children,
  role,
  "aria-label": ariaLabel,
}: DirectionalMotionProps) {
  const elementRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const element = elementRef.current;
    if (!element || reduceMotion) return;

    const offset = offsetByDirection[direction];
    const controls = animate(
      element,
      { x: [offset.x, 0], y: [offset.y, 0] },
      { type: "spring", stiffness: 170, damping: 26, mass: 0.9, delay },
    );

    return () => controls.stop();
  }, [delay, direction, reduceMotion]);

  const props = {
    className,
    role,
    "aria-label": ariaLabel,
    ref: (element: HTMLElement | null) => { elementRef.current = element; },
  };
  if (as === "section") return <section {...props}>{children}</section>;
  if (as === "article") return <article {...props}>{children}</article>;
  if (as === "header") return <header {...props}>{children}</header>;
  return <div {...props}>{children}</div>;
}
