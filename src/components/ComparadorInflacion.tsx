"use client";

import { useState } from "react";
import Dinero from "@/components/Dinero";

const INFLACION = 3;

export default function ComparadorInflacion() {
  const [cantidad, setCantidad] = useState(5000);
  const [anios, setAnios] = useState(10);

  const real = (tasa: number) =>
    cantidad * Math.pow((1 + tasa / 100) / (1 + INFLACION / 100), anios);

  const filas = [
    { label: "🛏️ Bajo el colchón", tasa: 0, color: "#EF4444" },
    { label: "🏦 Cuenta remunerada (~2%)", tasa: 2, color: "#F5A623" },
    { label: "📈 Invertido a largo plazo (~6%)", tasa: 6, color: "#22C58B" },
  ].map((f) => ({ ...f, valor: real(f.tasa) }));

  const max = Math.max(...filas.map((f) => f.valor), cantidad);

  return (
    <div className="card">
      <p className="font-display text-lg font-bold text-navy">
        ¿Por qué no dejarlo quieto?
      </p>
      <p className="mt-1 text-sm font-semibold text-slate">
        Dejar el dinero parado no es "seguro": la inflación le quita poder de
        compra cada año. Mira qué podrías comprar dentro de unos años, en dinero
        de hoy.
      </p>

      <div className="mt-4 space-y-4">
        <Campo
          label="Si tuviera"
          valor={<Dinero valor={cantidad} size="sm" animar={false} className="text-navy" />}
          min={500}
          max={50000}
          step={500}
          value={cantidad}
          onChange={setCantidad}
        />
        <Campo
          label="Dentro de"
          valor={<span className="font-display font-bold text-navy">{anios} años</span>}
          min={1}
          max={30}
          step={1}
          value={anios}
          onChange={setAnios}
        />
      </div>

      <div className="mt-5 space-y-3">
        {filas.map((f) => (
          <div key={f.label}>
            <div className="flex items-center justify-between text-sm font-bold text-navy">
              <span>{f.label}</span>
              <Dinero valor={f.valor} size="sm" className="text-navy" />
            </div>
            <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-navy/5">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(f.valor / max) * 100}%`,
                  backgroundColor: f.color,
                  transition: "width 0.5s var(--ease-out)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs font-semibold text-navy/50">
        En poder de compra de hoy, con una inflación estimada del 3% y
        rentabilidades orientativas. La inversión no está garantizada y puede
        bajar.
      </p>
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
  valor: React.ReactNode;
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
        {valor}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full"
      />
    </div>
  );
}
