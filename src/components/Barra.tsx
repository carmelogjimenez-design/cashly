"use client";

import { useEffect, useState } from "react";

type Props = {
  valor: number; // 0..1
  color?: string;
  alto?: string;
};

export default function Barra({
  valor,
  color = "bg-cyan",
  alto = "h-3",
}: Props) {
  const pct = Math.max(0, Math.min(1, valor)) * 100;
  const [w, setW] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setW(pct);
      return;
    }
    const t = setTimeout(() => setW(pct), 120);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className={`w-full overflow-hidden rounded-full bg-navy/10 ${alto}`}>
      <div
        className={`${alto} rounded-full ${color}`}
        style={{
          width: `${w}%`,
          transition: "width 0.9s var(--ease-out)",
        }}
      />
    </div>
  );
}
