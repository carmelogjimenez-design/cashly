import AppShell from "@/components/AppShell";
import GestorObjetivos from "@/components/GestorObjetivos";
import NuevoObjetivo from "@/components/NuevoObjetivo";
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
        <div className="card mt-6 text-center">
          <p className="font-semibold text-slate">
            Aún no tienes objetivos. Crea el primero.
          </p>
        </div>
      )}

      <GestorObjetivos objetivos={resumen.objetivos} />

      <NuevoObjetivo />
    </AppShell>
  );
}
