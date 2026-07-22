import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Tendencias } from "@/lib/finanzas";

export default function Tendencias({ datos }: { datos: Tendencias }) {
  if (!datos.hayComparacion) return null;

  return (
    <div className="card">
      <div className="flex items-baseline justify-between">
        <p className="font-display text-lg font-bold text-navy">
          Cómo vas vs. el mes pasado
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {datos.items.map((t) => {
          const d = t.deltaPct;
          const sube = (d ?? 0) > 0.5;
          const baja = (d ?? 0) < -0.5;
          const bueno = t.mejorSiBaja ? baja : sube;
          const malo = t.mejorSiBaja ? sube : baja;

          const color = bueno
            ? "text-emerald-600"
            : malo
            ? "text-red-500"
            : "text-slate";
          const Icono = sube ? TrendingUp : baja ? TrendingDown : Minus;

          return (
            <div key={t.etiqueta} className="rounded-2xl bg-navy/[0.03] p-3">
              <p className="text-xs font-bold text-slate">{t.etiqueta}</p>
              <div className={`mt-1 flex items-center gap-1.5 ${color}`}>
                <Icono size={18} strokeWidth={2.8} />
                <span className="font-display text-lg font-bold">
                  {d === null
                    ? "—"
                    : `${d > 0 ? "+" : ""}${Math.round(d)}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs font-semibold text-slate">
        Verde = vas mejor que el mes pasado. Se irá afinando conforme uses
        Cashly cada mes.
      </p>
    </div>
  );
}
