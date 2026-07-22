import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/AppShell";
import GestorCuentas from "@/components/GestorCuentas";
import { getResumen } from "@/lib/datos";
import { euro } from "@/lib/finanzas";

export default async function CuentasPage() {
  const resumen = await getResumen();
  const total = resumen.cuentas.reduce((s, c) => s + c.saldo, 0);

  return (
    <AppShell>
      <Link
        href="/dashboard"
        className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-navy/70"
      >
        <ArrowLeft size={16} strokeWidth={2.5} /> Volver
      </Link>
      <h1 className="font-display text-3xl font-bold text-navy">Mis cuentas</h1>

      <div className="card mt-4 bg-navy text-center text-white">
        <p className="text-sm font-bold text-white/70">Tienes en total</p>
        <p className="font-display text-4xl font-bold text-yellow">
          {euro(total)}
        </p>
      </div>

      <GestorCuentas cuentas={resumen.cuentas} />
    </AppShell>
  );
}
