import Link from "next/link";
import AppShell from "@/components/AppShell";
import MovimientosLista from "@/components/MovimientosLista";
import { getResumen } from "@/lib/datos";
import { calcularMetricas, euro } from "@/lib/finanzas";

export default async function MovimientosPage() {
  const resumen = await getResumen();

  if (!resumen.tieneDatos) {
    return (
      <AppShell>
        <h1 className="font-display text-3xl font-bold text-navy">Movimientos</h1>
        <div className="card mt-6 text-center">
          <p className="font-semibold text-slate">
            Aún no hay movimientos. Carga los datos de ejemplo desde tu panel.
          </p>
          <Link href="/dashboard" className="btn-primary mt-4 inline-flex">
            Ir al panel
          </Link>
        </div>
      </AppShell>
    );
  }

  const m = calcularMetricas(resumen);

  // Fugas: suscripciones, prescindibles y categoría más cara.
  const suscripciones = m.gastoPorCategoria["Suscripciones"] ?? 0;
  const topCategoria = Object.entries(m.gastoPorCategoria)
    .filter(([c]) => c !== "Deudas" && c !== "Vivienda")
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold text-navy">Movimientos</h1>

      {/* ¿Dónde se te escapa el dinero? */}
      <div className="card mt-6 bg-navy text-white">
        <p className="font-display text-lg font-bold text-yellow">
          ¿Dónde se te escapa el dinero?
        </p>
        <div className="mt-3 space-y-3 text-sm font-semibold">
          <Fuga
            titulo="Gastos prescindibles"
            valor={euro(m.gastosPrescindibles)}
            nota={`Este mes. Al año son ${euro(m.gastosPrescindibles * 12)}.`}
          />
          <Fuga
            titulo="Suscripciones"
            valor={euro(suscripciones)}
            nota={`Revisa cuáles usas de verdad. Al año: ${euro(
              suscripciones * 12
            )}.`}
          />
          {topCategoria && (
            <Fuga
              titulo={`Tu mayor gasto variable: ${topCategoria[0]}`}
              valor={euro(topCategoria[1])}
              nota="Es donde más margen tienes para recortar."
            />
          )}
        </div>
      </div>

      <MovimientosLista movimientos={resumen.movimientos} />
    </AppShell>
  );
}

function Fuga({
  titulo,
  valor,
  nota,
}: {
  titulo: string;
  valor: string;
  nota: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3 last:border-0 last:pb-0">
      <div>
        <p className="text-white">{titulo}</p>
        <p className="text-xs font-medium text-white/60">{nota}</p>
      </div>
      <span className="shrink-0 font-display font-bold text-yellow">
        {valor}
      </span>
    </div>
  );
}
