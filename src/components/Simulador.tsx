"use client";

import { useState } from "react";
import type { Metricas } from "@/lib/finanzas";
import type { Prestamo } from "@/lib/tipos";
import { simularSalud, euro, ordenAvalancha } from "@/lib/finanzas";

export default function Simulador({
  base,
  prestamos,
  saludBase,
  mesesBase,
  tasaBase,
}: {
  base: Metricas;
  prestamos: Prestamo[];
  saludBase: number;
  mesesBase: number;
  tasaBase: number;
}) {
  const maxRecorte = Math.round(base.gastosPrescindibles);
  const cara = ordenAvalancha(prestamos.filter((p) => p.tin >= 15))[0];
  const maxAmortizar = cara ? Math.round(cara.saldo_pendiente) : 0;

  const [recorte, setRecorte] = useState(0);
  const [aporte, setAporte] = useState(0);
  const [amortizar, setAmortizar] = useState(0);

  const sim = simularSalud(
    base,
    { recorteMensual: recorte, aporteFondo: aporte, amortizarCara: amortizar },
    prestamos
  );

  const delta = sim.salud.total - saludBase;

  return (
    <div>
      {/* Resultado */}
      <div className="card mt-6 bg-navy text-white">
        <p className="text-sm font-bold text-white/70">
          Tu puntuación pasaría a
        </p>
        <div className="flex items-end gap-3">
          <span className="font-display text-5xl font-bold text-yellow">
            {sim.salud.total}
          </span>
          {delta !== 0 && (
            <span
              className={`mb-2 rounded-full px-2.5 py-0.5 text-sm font-bold ${
                delta > 0
                  ? "bg-emerald-400 text-navy"
                  : "bg-red-400 text-navy"
              }`}
            >
              {delta > 0 ? "+" : ""}
              {delta}
            </span>
          )}
          <span className="mb-2 text-sm font-semibold text-white/60">
            (ahora {saludBase})
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Mini
            label="Fondo"
            valor={`${sim.mesesFondo.toFixed(1)} m`}
            sub={`antes ${mesesBase.toFixed(1)}`}
          />
          <Mini
            label="Ahorro"
            valor={`${Math.round(sim.tasaAhorro * 100)}%`}
            sub={`antes ${Math.round(tasaBase * 100)}%`}
          />
          <Mini
            label="Interés/año"
            valor={`−${euro(sim.interesesAhorrados)}`}
            sub="que te ahorras"
          />
        </div>
      </div>

      {/* Palancas */}
      <div className="mt-4 space-y-4">
        <Palanca
          titulo="✂️ Recorto en gastos prescindibles"
          valor={`${euro(recorte)}/mes`}
          min={0}
          max={maxRecorte}
          step={10}
          value={recorte}
          onChange={setRecorte}
        />
        <Palanca
          titulo="🐷 Aporto de golpe a mi fondo"
          valor={euro(aporte)}
          min={0}
          max={5000}
          step={100}
          value={aporte}
          onChange={setAporte}
        />
        {maxAmortizar > 0 && (
          <Palanca
            titulo={`💳 Amortizo "${cara.nombre}"`}
            valor={euro(amortizar)}
            min={0}
            max={maxAmortizar}
            step={50}
            value={amortizar}
            onChange={setAmortizar}
          />
        )}
      </div>

      <button
        className="btn-secondary mt-4 w-full"
        onClick={() => {
          setRecorte(0);
          setAporte(0);
          setAmortizar(0);
        }}
      >
        Reiniciar
      </button>

      <p className="mt-6 text-center text-xs font-semibold text-navy/50">
        Simulación orientativa para ayudarte a decidir. No es asesoramiento
        financiero.
      </p>
    </div>
  );
}

function Mini({
  label,
  valor,
  sub,
}: {
  label: string;
  valor: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-2">
      <p className="text-xs font-bold text-white/60">{label}</p>
      <p className="font-display font-bold text-white">{valor}</p>
      <p className="text-[10px] font-semibold text-white/50">{sub}</p>
    </div>
  );
}

function Palanca({
  titulo,
  valor,
  min,
  max,
  step,
  value,
  onChange,
}: {
  titulo: string;
  valor: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <p className="font-display font-bold text-navy">{titulo}</p>
        <p className="font-display font-bold text-navy">{valor}</p>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-cyan"
      />
    </div>
  );
}
