"use client";

import { useEffect, useState } from "react";
import Dinero from "@/components/Dinero";

type Seg = { label: string; valor: number; color: string };

export default function FlujoDinero({
  ingresos,
  esenciales,
  otros,
  prescindible,
  ahorro,
}: {
  ingresos: number;
  esenciales: number;
  otros: number;
  prescindible: number;
  ahorro: number;
}) {
  const segs: Seg[] = [
    { label: "Esenciales", valor: esenciales, color: "#3B6FE0" },
    { label: "Otros gastos", valor: otros, color: "#8A94B0" },
    { label: "Caprichos", valor: prescindible, color: "#FFD400" },
    { label: "Ahorro", valor: Math.max(0, ahorro), color: "#22C58B" },
  ].filter((s) => s.valor > 0);

  const total = segs.reduce((s, x) => s + x.valor, 0) || 1;
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setMostrar(true);
      return;
    }
    const t = setTimeout(() => setMostrar(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="card">
      <div className="flex items-baseline justify-between">
        <p className="font-display text-lg font-bold text-navy">
          A dónde va tu dinero
        </p>
        <span className="text-xs font-bold text-slate">este mes</span>
      </div>

      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-sm font-bold text-slate">Entran</span>
        <Dinero valor={ingresos} size="md" className="text-navy" />
      </div>

      {/* Barra de flujo */}
      <div className="mt-3 flex h-5 w-full overflow-hidden rounded-full bg-navy/5">
        {segs.map((s) => (
          <div
            key={s.label}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{
              width: mostrar ? `${(s.valor / total) * 100}%` : "0%",
              backgroundColor: s.color,
              transition: "width 0.9s var(--ease-out)",
            }}
          />
        ))}
      </div>

      {/* Leyenda */}
      <div className="mt-4 space-y-2.5">
        {segs.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="flex-1 text-sm font-bold text-navy">
              {s.label}
            </span>
            <span className="text-xs font-bold text-slate">
              {Math.round((s.valor / total) * 100)}%
            </span>
            <Dinero
              valor={s.valor}
              size="sm"
              animar={false}
              className="w-20 justify-end text-navy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
