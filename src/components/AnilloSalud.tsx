"use client";

import { useEffect, useState } from "react";

type Props = {
  puntos: number; // 0..100
  nivel: string;
};

const prefiereReducir = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function AnilloSalud({ puntos, nivel }: Props) {
  const radio = 52;
  const circ = 2 * Math.PI * radio;
  const objetivo = circ * (1 - puntos / 100);

  const [offset, setOffset] = useState(circ); // arranca vacío
  const [n, setN] = useState(0); // número que sube

  useEffect(() => {
    if (prefiereReducir()) {
      setOffset(objetivo);
      setN(puntos);
      return;
    }

    // Dibuja el arco
    const t = setTimeout(() => setOffset(objetivo), 80);

    // Cuenta hacia arriba
    const dur = 1200;
    const inicio = performance.now();
    let raf = 0;
    const paso = (ahora: number) => {
      const p = Math.min(1, (ahora - inicio) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * puntos));
      if (p < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [puntos, objetivo]);

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg
        width="144"
        height="144"
        viewBox="0 0 144 144"
        className="-rotate-90"
      >
        <circle
          cx="72"
          cy="72"
          r={radio}
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="14"
        />
        <circle
          className="animate-ring-glow"
          cx="72"
          cy="72"
          r={radio}
          fill="none"
          stroke="#FFE500"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s var(--ease-out)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-4xl font-bold text-white tabular-nums">
          {n}
        </span>
        <span className="text-xs font-bold text-yellow">{nivel}</span>
      </div>
    </div>
  );
}
