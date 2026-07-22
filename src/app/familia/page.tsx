import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import AppShell from "@/components/AppShell";
import Barra from "@/components/Barra";
import { getResumen } from "@/lib/datos";
import { calcularMetricas, progresoObjetivo, euro } from "@/lib/finanzas";

const TIPS = [
  {
    emoji: "🐷",
    texto:
      "Dale a cada peque una hucha con tres partes: gastar, ahorrar y compartir. Aprenden a repartir sin dramas.",
  },
  {
    emoji: "🎯",
    texto:
      "Cuando quieran algo caro, ayúdales a ponerse una meta y ahorrar para ello. Valoran más lo que consiguen.",
  },
  {
    emoji: "🛒",
    texto:
      "Llévalos a la compra y deja que comparen precios. Es la mejor clase de economía doméstica.",
  },
];

export default async function FamiliaPage() {
  const resumen = await getResumen();

  if (!resumen.tieneDatos) {
    return (
      <AppShell>
        <h1 className="font-display text-3xl font-bold text-navy">Familia</h1>
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
  const gastoPeques =
    (m.gastoPorCategoria["Familia"] ?? 0) +
    (m.gastoPorCategoria["Educación"] ?? 0);
  const objetivoFamiliar = resumen.objetivos[0] ?? null;

  return (
    <AppShell>
      <Link
        href="/dashboard"
        className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-navy/70"
      >
        <ArrowLeft size={16} strokeWidth={2.5} /> Volver
      </Link>
      <h1 className="font-display text-3xl font-bold text-navy">Familia</h1>
      <p className="mt-1 font-semibold text-slate">
        La foto económica de vuestra casa.
      </p>

      {/* Resumen del hogar */}
      <div className="card mt-6 bg-navy text-white">
        <div className="flex items-center gap-2">
          <Users size={20} strokeWidth={2.5} className="text-yellow" />
          <p className="font-display text-lg font-bold text-yellow">
            Vuestra economía este mes
          </p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs font-bold text-white/60">Entra</p>
            <p className="font-display text-lg font-bold">
              {euro(m.ingresosMes)}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-white/60">Sale</p>
            <p className="font-display text-lg font-bold">
              {euro(m.gastosMes)}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-white/60">Sobra</p>
            <p className="font-display text-lg font-bold text-yellow">
              {euro(m.ahorroReal)}
            </p>
          </div>
        </div>
      </div>

      {/* Gasto en los peques */}
      <div className="card mt-4">
        <p className="font-display font-bold text-navy">
          👨‍👩‍👧‍👦 Lo que invertís en los peques
        </p>
        <p className="mt-1 font-display text-3xl font-bold text-navy">
          {euro(gastoPeques)}
          <span className="text-base font-bold text-slate"> /mes</span>
        </p>
        <p className="mt-1 text-sm font-semibold text-slate">
          Familia y educación (guardería, colegio, extraescolares, ropa…).
        </p>
      </div>

      {/* Objetivo compartido */}
      {objetivoFamiliar && (
        <div className="card mt-4">
          <p className="font-display font-bold text-navy">
            🎯 Vuestra meta: {objetivoFamiliar.nombre}
          </p>
          <div className="mt-3">
            <Barra
              valor={progresoObjetivo(objetivoFamiliar)}
              color="bg-yellow"
              alto="h-3"
            />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate">
            {euro(objetivoFamiliar.cantidad_actual)} de{" "}
            {euro(objetivoFamiliar.cantidad_objetivo)}
          </p>
        </div>
      )}

      {/* Tips */}
      <p className="mt-6 font-display text-xl font-bold text-navy">
        Enseñarles a manejar el dinero
      </p>
      <div className="mt-3 space-y-3">
        {TIPS.map((t, i) => (
          <div key={i} className="card flex gap-3">
            <span className="text-2xl">{t.emoji}</span>
            <p className="text-sm font-semibold text-slate">{t.texto}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
