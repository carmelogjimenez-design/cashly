import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/AppShell";
import { getResumen } from "@/lib/datos";
import {
  euro,
  ordenAvalancha,
  ordenBolaNieve,
  interesesPendientes,
  mesesHasta,
} from "@/lib/finanzas";

export default async function DeudasPage() {
  const resumen = await getResumen();
  const prestamos = resumen.prestamos;

  const totalDeuda = prestamos.reduce((s, p) => s + p.saldo_pendiente, 0);
  const totalCuota = prestamos.reduce((s, p) => s + p.cuota_mensual, 0);
  const avalancha = ordenAvalancha(prestamos.filter((p) => p.tipo !== "hipoteca"));
  const bola = ordenBolaNieve(prestamos.filter((p) => p.tipo !== "hipoteca"));

  return (
    <AppShell>
      <Link
        href="/dashboard"
        className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-navy/70"
      >
        <ArrowLeft size={16} strokeWidth={2.5} /> Volver
      </Link>
      <h1 className="font-display text-3xl font-bold text-navy">Deudas</h1>

      {prestamos.length === 0 ? (
        <div className="card mt-6 text-center">
          <p className="font-semibold text-slate">
            No tienes deudas registradas. Carga los datos de ejemplo desde tu
            panel.
          </p>
        </div>
      ) : (
        <>
          {/* Totales */}
          <div className="card mt-6 bg-navy text-white">
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

          {/* Lista de préstamos */}
          <div className="mt-4 space-y-3">
            {prestamos.map((p) => {
              const intereses = interesesPendientes(p);
              const meses = p.fecha_fin ? mesesHasta(p.fecha_fin) : null;
              const caro = p.tin >= 15;
              return (
                <div key={p.id} className="card">
                  <div className="flex items-center justify-between">
                    <p className="font-display font-bold text-navy">
                      {p.nombre}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        caro
                          ? "bg-red-100 text-red-600"
                          : "bg-cyan/40 text-navy"
                      }`}
                    >
                      {p.tin.toFixed(1)}% TIN
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-y-1 text-sm font-semibold text-slate">
                    <span>Pendiente</span>
                    <span className="text-right text-navy">
                      {euro(p.saldo_pendiente)}
                    </span>
                    <span>Cuota</span>
                    <span className="text-right text-navy">
                      {euro(p.cuota_mensual)}/mes
                    </span>
                    {meses !== null && (
                      <>
                        <span>Te quedan</span>
                        <span className="text-right text-navy">
                          {meses} meses
                        </span>
                      </>
                    )}
                    {intereses > 0 && (
                      <>
                        <span>Intereses por pagar</span>
                        <span className="text-right text-navy">
                          ~{euro(intereses)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

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
                    {euro(bola[0].saldo_pendiente)}). La quitas antes y coges
                    impulso.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <p className="mt-6 text-center text-xs font-semibold text-navy/50">
        Cálculos orientativos. No sustituyen el asesoramiento profesional.
      </p>
    </AppShell>
  );
}
