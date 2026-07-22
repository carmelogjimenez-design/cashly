"use client";

import { useState } from "react";
import type { Movimiento } from "@/lib/tipos";
import { euro, fechaCorta, EMOJI_CATEGORIA } from "@/lib/finanzas";

export default function MovimientosLista({
  movimientos,
}: {
  movimientos: Movimiento[];
}) {
  const [filtro, setFiltro] = useState<string>("todos");
  const [soloPrescindibles, setSoloPrescindibles] = useState(false);

  const categorias = Array.from(
    new Set(movimientos.map((m) => m.categoria))
  ).sort();

  const lista = movimientos.filter((m) => {
    if (filtro !== "todos" && m.categoria !== filtro) return false;
    if (soloPrescindibles && !m.prescindible) return false;
    return true;
  });

  return (
    <div>
      {/* Filtros */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <Chip activo={filtro === "todos"} onClick={() => setFiltro("todos")}>
          Todos
        </Chip>
        <Chip
          activo={soloPrescindibles}
          onClick={() => setSoloPrescindibles((v) => !v)}
        >
          Prescindibles
        </Chip>
        {categorias.map((c) => (
          <Chip key={c} activo={filtro === c} onClick={() => setFiltro(c)}>
            {EMOJI_CATEGORIA[c] ?? "•"} {c}
          </Chip>
        ))}
      </div>

      {/* Lista */}
      <div className="card mt-4 divide-y divide-navy/5 p-0">
        {lista.length === 0 && (
          <p className="p-6 text-center text-sm font-semibold text-slate">
            No hay movimientos con ese filtro.
          </p>
        )}
        {lista.map((m) => (
          <div key={m.id} className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan/40 text-lg">
              {EMOJI_CATEGORIA[m.categoria] ?? "•"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-navy">{m.comercio}</p>
              <p className="text-xs font-semibold text-slate">
                {fechaCorta(m.fecha)} · {m.categoria}
                {m.recurrente ? " · recurrente" : ""}
              </p>
            </div>
            <span
              className={`shrink-0 font-display font-bold ${
                m.tipo === "ingreso" ? "text-emerald-600" : "text-navy"
              }`}
            >
              {m.tipo === "ingreso" ? "+" : "−"}
              {euro(m.importe)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-bold transition ${
        activo ? "bg-navy text-white" : "bg-white text-navy"
      }`}
    >
      {children}
    </button>
  );
}
