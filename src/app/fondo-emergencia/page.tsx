import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import AppShell from "@/components/AppShell";
import Barra from "@/components/Barra";
import { getResumen } from "@/lib/datos";
import { calcularMetricas, euro } from "@/lib/finanzas";

export default async function FondoPage() {
  const resumen = await getResumen();

  if (!resumen.tieneDatos) {
    return (
      <AppShell>
        <h1 className="font-display text-3xl font-bold text-navy">
          Fondo de emergencia
        </h1>
        <div className="card mt-6 text-center">
          <p className="font-semibold text-slate">
            Carga los datos de ejemplo desde tu panel para calcular tu fondo.
          </p>
          <Link href="/dashboard" className="btn-primary mt-4 inline-flex">
            Ir al panel
          </Link>
        </div>
      </AppShell>
    );
  }

  const m = calcularMetricas(resumen);
  const esencialMes = m.gastosEsenciales;
  const recomendado =
    resumen.perfil?.fondo_objetivo && resumen.perfil.fondo_objetivo > 0
      ? resumen.perfil.fondo_objetivo
      : Math.round(esencialMes * 6);
  const actual = m.ahorroLiquido;
  const restante = Math.max(0, recomendado - actual);
  const progreso = recomendado > 0 ? actual / recomendado : 0;

  // A qué ritmo lo completa con su ahorro mensual actual.
  const ahorroMensual = Math.max(0, m.ahorroReal);
  const mesesParaCompletar =
    ahorroMensual > 0 ? Math.ceil(restante / ahorroMensual) : null;

  let nivel = "Frágil";
  let colorNivel = "text-red-500";
  if (m.mesesFondo >= 6) {
    nivel = "Protección sólida";
    colorNivel = "text-emerald-600";
  } else if (m.mesesFondo >= 3) {
    nivel = "Situación razonable";
    colorNivel = "text-emerald-600";
  } else if (m.mesesFondo >= 1) {
    nivel = "Protección limitada";
    colorNivel = "text-amber-500";
  }

  return (
    <AppShell>
      <Link
        href="/dashboard"
        className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-navy/70"
      >
        <ArrowLeft size={16} strokeWidth={2.5} /> Volver
      </Link>
      <h1 className="font-display text-3xl font-bold text-navy">
        Fondo de emergencia
      </h1>

      {/* Estado */}
      <div className="card mt-6 text-center">
        <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan">
          <ShieldCheck size={30} strokeWidth={2.5} className="text-navy" />
        </span>
        <p className="font-display text-4xl font-bold text-navy">
          {m.mesesFondo.toFixed(1)}
        </p>
        <p className="text-sm font-bold text-slate">
          meses de gastos básicos cubiertos
        </p>
        <p className={`mt-2 font-display text-lg font-bold ${colorNivel}`}>
          {nivel}
        </p>
      </div>

      {/* Progreso */}
      <div className="card mt-4">
        <div className="flex items-center justify-between text-sm font-bold">
          <span className="text-navy">{euro(actual)}</span>
          <span className="text-slate">Meta: {euro(recomendado)}</span>
        </div>
        <div className="mt-2">
          <Barra valor={progreso} color="bg-yellow" alto="h-4" />
        </div>
        <div className="mt-3 space-y-2 text-sm font-semibold text-slate">
          <div className="flex justify-between">
            <span>Gastos básicos al mes</span>
            <span className="text-navy">{euro(esencialMes)}</span>
          </div>
          <div className="flex justify-between">
            <span>Te falta</span>
            <span className="text-navy">{euro(restante)}</span>
          </div>
          {mesesParaCompletar !== null && restante > 0 && (
            <div className="flex justify-between">
              <span>A tu ritmo de ahorro</span>
              <span className="text-navy">
                {mesesParaCompletar} meses
              </span>
            </div>
          )}
        </div>
      </div>

      {restante > 0 && (
        <div className="card mt-4 bg-yellow">
          <p className="font-display font-bold text-navy">
            {mesesParaCompletar !== null
              ? `Ahorrando ${euro(
                  ahorroMensual
                )}/mes lo completas en ${mesesParaCompletar} meses.`
              : "Ahora mismo no te queda ahorro al final del mes. Recortar una fuga es el primer paso para arrancar tu colchón."}
          </p>
        </div>
      )}

      <p className="mt-6 text-center text-xs font-semibold text-navy/50">
        La recomendación se adapta a tus gastos, empleo e hijos. Es orientativa.
      </p>
    </AppShell>
  );
}
