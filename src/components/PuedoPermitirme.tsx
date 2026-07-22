"use client";

import { useState } from "react";
import { Check, AlertTriangle, X } from "lucide-react";
import type { Metricas } from "@/lib/finanzas";
import { puedoPermitirme } from "@/lib/finanzas";

export default function PuedoPermitirme({ base }: { base: Metricas }) {
  const [importe, setImporte] = useState("");
  const [mensual, setMensual] = useState(false);
  const [res, setRes] = useState<ReturnType<typeof puedoPermitirme> | null>(
    null
  );

  function comprobar() {
    const n = Number(importe.replace(",", "."));
    setRes(puedoPermitirme(base, isNaN(n) ? 0 : n, mensual));
  }

  const estilos = {
    si: {
      bg: "bg-emerald-500",
      icon: <Check size={28} strokeWidth={3} className="text-white" />,
    },
    justo: {
      bg: "bg-amber-400",
      icon: <AlertTriangle size={28} strokeWidth={3} className="text-navy" />,
    },
    no: {
      bg: "bg-red-500",
      icon: <X size={28} strokeWidth={3} className="text-white" />,
    },
  };

  return (
    <div className="mt-6">
      <div className="card">
        <label className="label">¿Cuánto cuesta?</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={importe}
            onChange={(e) => setImporte(e.target.value)}
            placeholder="0"
            className="field"
          />
          <span className="font-display text-xl font-bold text-navy">€</span>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setMensual(false)}
            className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
              !mensual ? "bg-navy text-white" : "bg-white text-navy border-2 border-navy/10"
            }`}
          >
            Pago único
          </button>
          <button
            onClick={() => setMensual(true)}
            className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
              mensual ? "bg-navy text-white" : "bg-white text-navy border-2 border-navy/10"
            }`}
          >
            Cada mes
          </button>
        </div>

        <button className="btn-primary mt-4 w-full" onClick={comprobar}>
          Comprobar
        </button>
      </div>

      {res && res.titulo !== "Introduce una cantidad" && (
        <div className="card mt-4">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                estilos[res.veredicto].bg
              }`}
            >
              {estilos[res.veredicto].icon}
            </span>
            <p className="font-display text-xl font-bold text-navy">
              {res.titulo}
            </p>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate">{res.detalle}</p>
          {res.dato && (
            <p className="mt-2 rounded-2xl bg-cyan/20 px-3 py-2 text-sm font-bold text-navy">
              {res.dato}
            </p>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-xs font-semibold text-navy/50">
        Orientación basada en tu situación actual. La decisión final es tuya.
      </p>
    </div>
  );
}
