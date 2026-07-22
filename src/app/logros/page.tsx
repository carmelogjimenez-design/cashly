import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/AppShell";
import Barra from "@/components/Barra";
import { getResumen } from "@/lib/datos";
import {
  calcularMetricas,
  calcularSalud,
  hayDeudaCara,
  nivelDesde,
  calcularLogros,
} from "@/lib/finanzas";

export default async function LogrosPage() {
  const resumen = await getResumen();

  if (!resumen.tieneDatos) {
    return (
      <AppShell>
        <h1 className="font-display text-3xl font-bold text-navy">Logros</h1>
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
  const salud = calcularSalud(m, hayDeudaCara(resumen.prestamos));
  const nivel = nivelDesde(salud.total);
  const logros = calcularLogros(m, resumen.prestamos, resumen.objetivos.length);
  const conseguidos = logros.filter((l) => l.desbloqueado).length;

  return (
    <AppShell>
      <Link
        href="/dashboard"
        className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-navy/70"
      >
        <ArrowLeft size={16} strokeWidth={2.5} /> Volver
      </Link>
      <h1 className="font-display text-3xl font-bold text-navy">Logros</h1>

      {/* Nivel */}
      <div className="card mt-6 bg-navy text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white/70">Tu nivel</p>
            <p className="font-display text-2xl font-bold text-yellow">
              {nivel.num}. {nivel.nombre}
            </p>
          </div>
          <span className="font-display text-4xl font-bold text-white">
            {salud.total}
          </span>
        </div>
        <div className="mt-4">
          <Barra valor={nivel.progresoPct / 100} color="bg-yellow" alto="h-3" />
          <p className="mt-2 text-xs font-bold text-white/70">
            {nivel.faltanPuntos > 0
              ? `Te faltan ${nivel.faltanPuntos} puntos para el siguiente nivel`
              : "¡Nivel máximo alcanzado!"}
          </p>
        </div>
      </div>

      {/* Contador */}
      <p className="mt-6 font-display text-xl font-bold text-navy">
        Insignias {conseguidos}/{logros.length}
      </p>

      {/* Rejilla de logros */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        {logros.map((l) => (
          <div
            key={l.nombre}
            className={`card text-center ${
              l.desbloqueado ? "" : "opacity-45 grayscale"
            }`}
          >
            <span className="text-4xl">{l.emoji}</span>
            <p className="mt-2 font-display font-bold text-navy">{l.nombre}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate">{l.desc}</p>
            {l.desbloqueado ? (
              <p className="mt-2 text-xs font-bold text-emerald-600">
                ✓ Conseguido
              </p>
            ) : (
              <p className="mt-2 text-xs font-bold text-slate">Bloqueado</p>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
