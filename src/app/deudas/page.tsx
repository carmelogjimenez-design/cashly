import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/AppShell";
import GestorDeudas from "@/components/GestorDeudas";
import { getResumen } from "@/lib/datos";
import { euro, ordenAvalancha, ordenBolaNieve } from "@/lib/finanzas";

export default async function DeudasPage() {
  const resumen = await getResumen();
  const prestamos = resumen.prestamos;

  const totalDeuda = prestamos.reduce((s, p) => s + p.saldo_pendiente, 0);
  const totalCuota = prestamos.reduce((s, p) => s + p.cuota_mensual, 0);
  const consumo = prestamos.filter((p) => p.tipo !== "hipoteca");
  const avalancha = ordenAvalancha(consumo);
  const bola = ordenBolaNieve(consumo);

  return (
    <AppShell>
      <Link
        href="/dashboard"
        className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-navy/70"
      >
        <ArrowLeft size={16} strokeWidth={2.5} /> Volver
      </Link>
      <h1 className="font-display text-3xl font-bold text-navy">Deudas</h1>

      {/* Totales */}
      {prestamos.length > 0 && (
        <div className="card mt-4 bg-navy text-white">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-xs font-bold text-white/70">Deuda total</p>
              <p className="font-display text-2xl font-bold text-yellow">
                {euro(totalDeuda)}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-white/70">Cuotas al mes</p>
              <p className="font-display text-2xl font-bold text-yellow">
                {euro(totalCuota)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista editable + añadir */}
      <GestorDeudas prestamos={prestamos} />

      {/* Estrategias */}
      {avalancha.length > 1 && (
        <div className="card mt-4">
          <p className="font-display text-lg font-bold text-navy">
            ¿Por cuál empiezo?
          </p>
          <div className="mt-3 space-y-3 text-sm font-semibold">
            <div className="rounded-2xl bg-cyan/20 p-3">
              <p className="font-bold text-navy">
                🏔️ Avalancha (ahorras más intereses)
              </p>
              <p className="mt-1 text-slate">
                Ataca primero la de mayor interés:{" "}
                <span className="text-navy">{avalancha[0].nombre}</span> (
                {avalancha[0].tin.toFixed(1)}%).
              </p>
            </div>
            <div className="rounded-2xl bg-cyan/20 p-3">
              <p className="font-bold text-navy">
                ⛄ Bola de nieve (más motivación)
              </p>
              <p className="mt-1 text-slate">
                Empieza por la más pequeña:{" "}
                <span className="text-navy">{bola[0].nombre}</span> (
                {euro(bola[0].saldo_pendiente)}).
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-xs font-semibold text-navy/50">
        Cálculos orientativos. No sustituyen el asesoramiento profesional.
      </p>
    </AppShell>
  );
}
