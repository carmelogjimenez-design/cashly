import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/AppShell";
import PuedoPermitirme from "@/components/PuedoPermitirme";
import { getResumen } from "@/lib/datos";
import { calcularMetricas } from "@/lib/finanzas";

export default async function PermitirPage() {
  const resumen = await getResumen();

  if (!resumen.tieneDatos) {
    return (
      <AppShell>
        <h1 className="font-display text-3xl font-bold text-navy">
          ¿Me lo puedo permitir?
        </h1>
        <div className="card mt-6 text-center">
          <p className="font-semibold text-slate">
            Carga los datos de ejemplo desde tu panel para usar esta herramienta.
          </p>
          <Link href="/dashboard" className="btn-primary mt-4 inline-flex">
            Ir al panel
          </Link>
        </div>
      </AppShell>
    );
  }

  const m = calcularMetricas(resumen);

  return (
    <AppShell>
      <Link
        href="/dashboard"
        className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-navy/70"
      >
        <ArrowLeft size={16} strokeWidth={2.5} /> Volver
      </Link>
      <h1 className="font-display text-3xl font-bold leading-tight text-navy">
        ¿Me lo puedo permitir?
      </h1>
      <p className="mt-1 font-semibold text-slate">
        Antes de un capricho o un gasto grande, compruébalo aquí.
      </p>

      <PuedoPermitirme base={m} />
    </AppShell>
  );
}
