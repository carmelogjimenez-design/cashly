import AppShell from "@/components/AppShell";
import Barra from "@/components/Barra";
import NuevoObjetivo from "@/components/NuevoObjetivo";
import { getResumen } from "@/lib/datos";
import {
  progresoObjetivo,
  aporteMensualObjetivo,
  euro,
} from "@/lib/finanzas";

export default async function ObjetivosPage() {
  const resumen = await getResumen();

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold text-navy">Objetivos</h1>
      <p className="mt-1 font-semibold text-slate">
        Metas realistas y cuánto ahorrar cada mes para llegar.
      </p>

      {resumen.objetivos.length === 0 && (
        <div className="card mt-6 text-center">
          <p className="font-semibold text-slate">
            Aún no tienes objetivos. Crea el primero.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {resumen.objetivos.map((o) => {
          const progreso = progresoObjetivo(o);
          const aporte = aporteMensualObjetivo(o);
          const restante = Math.max(0, o.cantidad_objetivo - o.cantidad_actual);
          return (
            <div key={o.id} className="card">
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-bold text-navy">
                  {o.nombre}
                </p>
                <p className="font-display font-bold text-navy">
                  {Math.round(progreso * 100)}%
                </p>
              </div>
              <div className="mt-2">
                <Barra valor={progreso} color="bg-yellow" alto="h-3" />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm font-semibold text-slate">
                <span>
                  {euro(o.cantidad_actual)} de {euro(o.cantidad_objetivo)}
                </span>
                <span>Faltan {euro(restante)}</span>
              </div>
              {aporte > 0 && (
                <p className="mt-3 rounded-2xl bg-cyan/30 px-3 py-2 text-sm font-bold text-navy">
                  Ahorra {euro(aporte)}/mes para llegar a tiempo.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <NuevoObjetivo />
    </AppShell>
  );
}
