import Link from "next/link";
import { ArrowLeft, AlertTriangle, Info, CheckCircle } from "lucide-react";
import AppShell from "@/components/AppShell";
import { getResumen } from "@/lib/datos";
import { calcularMetricas, calcularAlertas } from "@/lib/finanzas";

export default async function AlertasPage() {
  const resumen = await getResumen();

  if (!resumen.tieneDatos) {
    return (
      <AppShell>
        <h1 className="font-display text-3xl font-bold text-navy">Alertas</h1>
        <div className="card mt-6 text-center">
          <p className="font-semibold text-slate">
            Carga los datos de ejemplo desde tu panel.
          </p>
          <Link href="/dashboard" className="btn-primary mt-4 inline-flex">
            Ir al panel
          </Link>
        </div>
      </AppShell>
    );
  }

  const m = calcularMetricas(resumen);
  const alertas = calcularAlertas(m, resumen.prestamos);

  const estilo = {
    peligro: {
      card: "border-l-4 border-red-500",
      icon: <AlertTriangle size={22} strokeWidth={2.5} className="text-red-500" />,
    },
    aviso: {
      card: "border-l-4 border-amber-400",
      icon: <Info size={22} strokeWidth={2.5} className="text-amber-500" />,
    },
    bien: {
      card: "border-l-4 border-emerald-500",
      icon: (
        <CheckCircle size={22} strokeWidth={2.5} className="text-emerald-500" />
      ),
    },
  };

  return (
    <AppShell>
      <Link
        href="/dashboard"
        className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-navy/70"
      >
        <ArrowLeft size={16} strokeWidth={2.5} /> Volver
      </Link>
      <h1 className="font-display text-3xl font-bold text-navy">Alertas</h1>
      <p className="mt-1 font-semibold text-slate">
        Lo que Cashly ha detectado en tu dinero.
      </p>

      <div className="mt-6 space-y-3">
        {alertas.map((a, i) => (
          <Link key={i} href={a.href} className={`card block ${estilo[a.nivel].card}`}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0">{estilo[a.nivel].icon}</span>
              <div>
                <p className="font-display font-bold text-navy">{a.titulo}</p>
                <p className="mt-0.5 text-sm font-semibold text-slate">
                  {a.detalle}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
