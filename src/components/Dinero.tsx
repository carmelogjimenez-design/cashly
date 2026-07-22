"use client";

import { useEffect, useState } from "react";

type Size = "sm" | "md" | "lg" | "xl";

const cifra: Record<Size, string> = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-4xl",
  xl: "text-6xl",
};
const simbolo: Record<Size, string> = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-3xl",
};

type Props = {
  valor: number;
  size?: Size;
  decimales?: boolean;
  animar?: boolean;
  className?: string;
};

// Muestra un importe en euros con tratamiento tipográfico:
// cifra compacta, símbolo € pequeño y decimales atenuados.
export default function Dinero({
  valor,
  size = "md",
  decimales = false,
  animar = true,
  className = "",
}: Props) {
  const [n, setN] = useState(animar ? 0 : valor);

  useEffect(() => {
    if (!animar) {
      setN(valor);
      return;
    }
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(valor);
      return;
    }
    const dur = 900;
    const inicio = performance.now();
    let raf = 0;
    const paso = (ahora: number) => {
      const p = Math.min(1, (ahora - inicio) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(eased * valor);
      if (p < 1) raf = requestAnimationFrame(paso);
      else setN(valor);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [valor, animar]);

  const negativo = n < 0;
  const abs = Math.abs(n);
  const entero = Math.floor(abs);
  const dec = Math.round((abs - entero) * 100);

  const enteroFmt = new Intl.NumberFormat("es-ES").format(entero);
  const decFmt = dec.toString().padStart(2, "0");

  return (
    <span
      className={`inline-flex items-baseline font-display font-bold tabular-nums ${className}`}
    >
      {negativo && <span className={cifra[size]}>−</span>}
      <span className={cifra[size]}>{enteroFmt}</span>
      {decimales && (
        <span className={`${simbolo[size]} opacity-50`}>,{decFmt}</span>
      )}
      <span className={`${simbolo[size]} ml-0.5 opacity-60`}>€</span>
    </span>
  );
}
