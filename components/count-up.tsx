"use client";

import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/format";

type CountUpProps = {
  value: number;
  format?: "number" | "rupiah" | "percent";
  className?: string;
  replayOnNavigation?: boolean;
};

const numberFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

export function CountUp({ value, format = "number", className, replayOnNavigation = false }: CountUpProps) {
  const progress = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();

  useMotionValueEvent(progress, "change", (latest) => setDisplayValue(Math.round(latest)));

  useEffect(() => {
    if (replayOnNavigation && pathname !== "/") {
      progress.set(value);
      setDisplayValue(value);
      return;
    }

    progress.set(0);
    setDisplayValue(0);

    if (reduceMotion) {
      progress.set(value);
      setDisplayValue(value);
      return;
    }

    const controls = animate(progress, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [pathname, progress, reduceMotion, replayOnNavigation, value]);

  const label = format === "rupiah"
    ? formatRupiah(displayValue)
    : `${numberFormatter.format(displayValue)}${format === "percent" ? "%" : ""}`;

  return <span className={className} aria-label={format === "rupiah" ? formatRupiah(value) : `${numberFormatter.format(value)}${format === "percent" ? "%" : ""}`}>
    <span aria-hidden="true">{label}</span>
  </span>;
}
