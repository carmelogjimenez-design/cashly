import AppShell from "@/components/AppShell";
import MovimientosLista from "@/components/MovimientosLista";
import { getResumen } from "@/lib/datos";
import { calcularMetricas, euro } from "@/lib/finanzas";

export default async function MovimientosPage() {
  const resumen = await getResumen();
  const hayMovimientos = resumen.movimientos.length > 0;
  const m = hayMovimientos ? calcularMetricas(resumen) : null;

  const suscripciones = m ? m.gastoPorCategoria["Suscripciones"] ?? 0 : 0;
  const topCategoria = m
    ? Object.entries(m.gastoPorCategoria)
        .filter(([c]) => c !== "Deudas" && c !== "Vivienda")
        .sort((a, b) => b[1] - a[1])[0]
    : null;

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold text-navy">Movimientos</h1>

      {/* ¿Dónde se te escapa el dinero? */}
      {m && (
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
      )}

      <MovimientosLista
        movimientos={resumen.movimientos}
        cuentas={resumen.cuentas}
      />
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
