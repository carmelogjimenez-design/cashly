import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/AppShell";
import Simulador from "@/components/Simulador";
import { getResumen } from "@/lib/datos";
import {
  calcularMetricas,
  calcularSalud,
  hayDeudaCara,
} from "@/lib/finanzas";

export default async function SimuladorPage() {
  const resumen = await getResumen();

  if (!resumen.tieneDatos) {
    return (
      <AppShell>
        <h1 className="font-display text-3xl font-bold text-navy">Simulador</h1>
        <div className="card mt-6 text-center">
          <p className="font-semibold text-slate">
            Carga los datos de ejemplo desde tu panel para simular.
          </p>
          <Link href="/dashboard" className="btn-primary mt-4 inline-flex">
            Ir al panel
          </Link>
        </div>
      </AppShell>
    );
  }

  const m = calcularMetricas(resumen);
  const salud = calcularSalud(m, hayDeudaCara(resumen.prestamos));

  return (
    <AppShell>
      <Link
        href="/dashboard"
        className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-navy/70"
      >
        <ArrowLeft size={16} strokeWidth={2.5} /> Volver
      </Link>
      <h1 className="font-display text-3xl font-bold text-navy">
        Simulador
      </h1>
      <p className="mt-1 font-semibold text-slate">
        Mueve las palancas y mira cómo cambiaría tu salud financiera.
      </p>

      <Simulador
        base={m}
        prestamos={resumen.prestamos}
        saludBase={salud.total}
        mesesBase={m.mesesFondo}
        tasaBase={m.tasaAhorro}
      />
    </AppShell>
  );
}
