import Link from "next/link";
import AppShell from "@/components/AppShell";
import Barra from "@/components/Barra";
import { getResumen } from "@/lib/datos";
import {
  calcularMetricas,
  sugerirPresupuesto,
  euro,
  EMOJI_CATEGORIA,
} from "@/lib/finanzas";

export default async function PresupuestoPage() {
  const resumen = await getResumen();

  if (!resumen.tieneDatos) {
    return (
      <AppShell>
        <h1 className="font-display text-3xl font-bold text-navy">Presupuesto</h1>
        <div className="card mt-6 text-center">
          <p className="font-semibold text-slate">
            Carga los datos de ejemplo desde tu panel para ver tu presupuesto.
          </p>
          <Link href="/dashboard" className="btn-primary mt-4 inline-flex">
            Ir al panel
          </Link>
        </div>
      </AppShell>
    );
  }

  const m = calcularMetricas(resumen);
  const lineas = sugerirPresupuesto(m);
  const ahorroAnualTotal = lineas.reduce((s, l) => s + l.ahorroAnual, 0);

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold text-navy">Presupuesto</h1>
      <p className="mt-1 font-semibold text-slate">
        Adaptado a lo que gastas de verdad, no a reglas genéricas.
      </p>

      {/* Impacto total */}
      <div className="card mt-6 bg-yellow text-center">
        <p className="text-sm font-bold text-navy/70">
          Si ajustas todas las categorías, podrías ahorrar hasta
        </p>
        <p className="font-display text-4xl font-bold text-navy">
          {euro(ahorroAnualTotal)}
        </p>
        <p className="text-sm font-bold text-navy/70">al año</p>
      </div>

      {/* Líneas por categoría */}
      <div className="mt-4 space-y-3">
        {lineas.map((l) => {
          const ratio = l.gastoActual > 0 ? l.sugerido / l.gastoActual : 1;
          return (
            <div key={l.categoria} className="card">
              <div className="flex items-center justify-between">
                <p className="font-display font-bold text-navy">
                  {EMOJI_CATEGORIA[l.categoria] ?? "•"} {l.categoria}
                </p>
                <p className="font-display font-bold text-navy">
                  {euro(l.gastoActual)}
                </p>
              </div>
              <div className="mt-2">
                <Barra valor={ratio} color="bg-cyan" alto="h-2" />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm font-semibold">
                <span className="text-slate">
                  Objetivo sugerido:{" "}
                  <span className="text-navy">{euro(l.sugerido)}</span>
                </span>
                {l.ahorroAnual > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    −{euro(l.ahorroAnual)}/año
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs font-semibold text-navy/50">
        Los objetivos sugeridos son orientativos. Ajusta según tu situación.
      </p>
    </AppShell>
  );
}
