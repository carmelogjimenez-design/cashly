"use client";

import { useEffect, useState } from "react";
import { euro } from "@/lib/finanzas";

type Props = {
  valor: number;
  formato?: (n: number) => string;
  duracion?: number;
  className?: string;
};

export default function Contador({
  valor,
  formato = (n) => euro(n),
  duracion = 900,
  className = "",
}: Props) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(valor);
      return;
    }
    const inicio = performance.now();
    let raf = 0;
    const paso = (ahora: number) => {
      const p = Math.min(1, (ahora - inicio) / duracion);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(eased * valor);
      if (p < 1) raf = requestAnimationFrame(paso);
      else setN(valor);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [valor, duracion]);

  return <span className={`tabular-nums ${className}`}>{formato(n)}</span>;
}
