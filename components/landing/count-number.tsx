"use client";

import { useRef, useEffect, useState } from "react";

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  className?: string;
  separator?: string;
}

export default function CountUp({
  to,
  from = 0,
  duration = 2,
  className = "",
  separator = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(from);
  const [hasAnimated, setHasAnimated] = useState(false);

  const getDecimalPlaces = (num: number): number => {
    const str = num.toString();
    if (str.includes(".")) {
      const decimals = str.split(".")[1];
      if (parseInt(decimals, 10) !== 0) return decimals.length;
    }
    return 0;
  };

  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || hasAnimated) return;
        setHasAnimated(true);

        const startTime = performance.now();
        const animate = (now: number) => {
          const elapsed = (now - startTime) / 1000;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = from + (to - from) * eased;
          setDisplayValue(current);
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      },
      { threshold: 0.1, rootMargin: "0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [from, to, duration, hasAnimated]);

  const formatValue = (value: number) => {
    const hasDecimals = maxDecimals > 0;
    const formatted = Intl.NumberFormat("en-US", {
      useGrouping: !!separator,
      minimumFractionDigits: hasDecimals ? maxDecimals : 0,
      maximumFractionDigits: hasDecimals ? maxDecimals : 0,
    }).format(value);
    return separator ? formatted.replace(/,/g, separator) : formatted;
  };

  return (
    <span className={className} ref={ref}>
      {formatValue(displayValue)}
    </span>
  );
}
