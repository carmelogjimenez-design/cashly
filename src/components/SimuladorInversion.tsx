"use client";

import { useState } from "react";
import { valorFuturoInversion, euro } from "@/lib/finanzas";
import Barra from "@/components/Barra";

export default function SimuladorInversion() {
  const [aporte, setAporte] = useState(100);
  const [anios, setAnios] = useState(20);
  const [tasa, setTasa] = useState(5);

  const r = valorFuturoInversion(aporte, anios, tasa);
  const pctIntereses = r.total > 0 ? r.intereses / r.total : 0;

  return (
    <div className="card mt-4">
      <p className="font-display text-lg font-bold text-navy">
        Calculadora de interés compuesto
      </p>
      <p className="mt-1 text-sm font-semibold text-slate">
        Mira cómo crece el ahorro constante con el tiempo. Es un ejemplo, no una
        previsión.
      </p>

      <div className="mt-4 space-y-4">
        <Campo
          label="Aporto al mes"
          valor={`${euro(aporte)}`}
          min={10}
          max={1000}
          step={10}
          value={aporte}
          onChange={setAporte}
        />
        <Campo
          label="Durante"
          valor={`${anios} años`}
          min={1}
          max={40}
          step={1}
          value={anios}
          onChange={setAnios}
        />
        <Campo
          label="Rentabilidad anual estimada"
          valor={`${tasa}%`}
          min={0}
          max={10}
          step={0.5}
          value={tasa}
          onChange={setTasa}
        />
      </div>

      <div className="mt-5 rounded-3xl bg-navy p-5 text-center text-white">
        <p className="text-sm font-bold text-white/70">
          Tendrías aproximadamente
        </p>
        <p className="font-display text-4xl font-bold text-yellow">
          {euro(r.total)}
        </p>
        <div className="mt-4">
          <Barra valor={1 - pctIntereses} color="bg-cyan" alto="h-3" />
          <div className="mt-2 flex justify-between text-xs font-bold">
            <span className="text-white/80">
              Tú pones: {euro(r.aportado)}
            </span>
            <span className="text-yellow">
              Intereses: {euro(r.intereses)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Campo({
  label,
  valor,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  valor: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-navy">{label}</span>
        <span className="font-display font-bold text-navy">{valor}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-cyan"
      />
    </div>
  );
}
