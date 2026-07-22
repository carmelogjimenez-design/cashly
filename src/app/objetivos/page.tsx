import AppShell from "@/components/AppShell";
import GestorObjetivos from "@/components/GestorObjetivos";
import NuevoObjetivo from "@/components/NuevoObjetivo";
import Mascota from "@/components/Mascota";
import { getResumen } from "@/lib/datos";

export default async function ObjetivosPage() {
  const resumen = await getResumen();

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold text-navy">Objetivos</h1>
      <p className="mt-1 font-semibold text-slate">
        Metas realistas y cuánto ahorrar cada mes para llegar.
      </p>

      {resumen.objetivos.length === 0 && (
        <div className="card mt-6 flex flex-col items-center text-center">
          <Mascota estado="idea" size={96} />
          <p className="mt-2 font-semibold text-navy">
            ¿Qué te haría ilusión conseguir?
          </p>
          <p className="text-sm font-semibold text-slate">
            Crea tu primera meta y te digo cuánto ahorrar al mes.
          </p>
        </div>
      )}

      <GestorObjetivos objetivos={resumen.objetivos} />

      <NuevoObjetivo />
    </AppShell>
  );
}
