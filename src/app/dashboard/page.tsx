import { Sparkles } from "lucide-react";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nombre =
    (user?.user_metadata?.nombre as string | undefined)?.split(" ")[0] ||
    "de nuevo";

  return (
    <AppShell>
      <p className="font-display text-lg font-semibold text-navy/70">
        Hola, {nombre} 👋
      </p>
      <h1 className="font-display text-3xl font-bold leading-tight text-navy">
        Este es tu panel de Cashly.
      </h1>

      {/* Adelanto: la puntuación de salud financiera llega en la Fase 1 */}
      <div className="card mt-6 flex items-center gap-4 bg-navy text-white">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow">
          <Sparkles size={26} strokeWidth={2.5} className="text-navy" />
        </span>
        <div>
          <p className="font-display text-lg font-bold text-yellow">
            Tu salud financiera
          </p>
          <p className="text-sm font-semibold text-white/80">
            Aquí verás tu puntuación de 0 a 100 y qué hacer para subirla.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { t: "Resumen del mes", d: "Ingresos, gastos y ahorro real." },
          { t: "Tu mejor movimiento", d: "Una recomendación clara cada día." },
          { t: "Fondo de emergencia", d: "Cuántos meses tienes cubiertos." },
          { t: "¿Dónde se te escapa?", d: "Fugas de dinero detectadas." },
        ].map((c) => (
          <div key={c.t} className="card">
            <p className="font-display font-bold text-navy">{c.t}</p>
            <p className="mt-1 text-sm font-semibold text-slate">{c.d}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs font-semibold text-navy/60">
        Estás en la versión inicial. Próxima fase: datos reales y tu puntuación
        financiera.
      </p>
    </AppShell>
  );
}
