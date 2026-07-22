import Link from "next/link";
import {
  ArrowLeftRight,
  Wallet,
  Target,
  CreditCard,
  PiggyBank,
  ArrowRight,
  Bell,
  Landmark,
  SlidersHorizontal,
  Calculator,
  Sparkles,
  TrendingUp,
  Users,
  Trophy,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import AnilloSalud from "@/components/AnilloSalud";
import Barra from "@/components/Barra";
import Onboarding from "@/components/Onboarding";
import Mascota, { estadoDesde, fraseMascota } from "@/components/Mascota";
import FlujoDinero from "@/components/FlujoDinero";
import Atmosfera from "@/components/Atmosfera";
import Tendencias from "@/components/Tendencias";
import { createClient } from "@/lib/supabase/server";
import { getResumen } from "@/lib/datos";
import {
  calcularMetricas,
  calcularSalud,
  mejorMovimiento,
  calcularAlertas,
  calcularTendencias,
  hayDeudaCara,
  euro,
} from "@/lib/finanzas";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const nombre =
    (user?.user_metadata?.nombre as string | undefined)?.split(" ")[0] ||
    "de nuevo";

  const resumen = await getResumen();

  if (!resumen.tieneDatos) {
    return (
      <AppShell>
        <Onboarding />
      </AppShell>
    );
  }

  const m = calcularMetricas(resumen);
  const salud = calcularSalud(m, hayDeudaCara(resumen.prestamos));
  const reco = mejorMovimiento(
    m,
    resumen.prestamos,
    resumen.perfil?.fondo_objetivo ?? null
  );
  const alertas = calcularAlertas(m, resumen.prestamos);
  const tendencias = calcularTendencias(resumen);
  const numAvisos = alertas.filter((a) => a.nivel !== "bien").length;

  const otrosGastos = Math.max(
    0,
    m.gastosMes - m.gastosEsenciales - m.gastosPrescindibles
  );

  return (
    <AppShell>
      <Atmosfera puntos={salud.total} />

      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-lg font-semibold text-navy/70">
            Hola, {nombre} 👋
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight text-navy">
            Este es tu panel.
          </h1>
        </div>
        <Link
          href="/alertas"
          className="relative mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-card"
        >
          <Bell size={20} strokeWidth={2.5} className="text-navy" />
          {numAvisos > 0 && (
            <span className="animate-pulse-soft absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {numAvisos}
            </span>
          )}
        </Link>
      </div>

      {/* Mascota con mensaje */}
      <div className="card mt-5 flex items-center gap-3">
        <Mascota puntos={salud.total} size={88} />
        <p className="flex-1 font-semibold leading-snug text-navy">
          {fraseMascota(estadoDesde(salud.total))}
        </p>
      </div>

      {/* Salud financiera */}
      <div className="card mt-4 bg-navy text-white">
        <div className="flex items-center gap-5">
          <AnilloSalud puntos={salud.total} nivel={salud.nivel} />
          <div className="flex-1">
            <p className="font-display text-lg font-bold text-yellow">
              Tu salud financiera
            </p>
            <p className="text-sm font-semibold text-white/80">
              Sobre 100. Cinco áreas de tu economía.
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {salud.areas.map((a) => (
            <div key={a.nombre}>
              <div className="mb-1 flex items-center justify-between text-sm font-bold">
                <span className="text-white">{a.nombre}</span>
                <span className="text-yellow">{a.puntos}/20</span>
              </div>
              <Barra valor={a.puntos / 20} color="bg-yellow" alto="h-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Flujo del dinero */}
      <div className="mt-4">
        <FlujoDinero
          ingresos={m.ingresosMes}
          esenciales={m.gastosEsenciales}
          otros={otrosGastos}
          prescindible={m.gastosPrescindibles}
          ahorro={m.ahorroReal}
        />
      </div>

      {/* Tendencias */}
      {tendencias.hayComparacion && (
        <div className="mt-4">
          <Tendencias datos={tendencias} />
        </div>
      )}

      {/* Tu mejor movimiento */}
      <div className="card mt-4 bg-yellow">
        <p className="text-xs font-bold uppercase tracking-wide text-navy/60">
          Tu mejor movimiento
        </p>
        <p className="mt-1 font-display text-xl font-bold text-navy">
          {reco.titulo}
        </p>
        <p className="mt-1 text-sm font-semibold text-navy/80">
          {reco.detalle}
        </p>
      </div>

      {/* Accesos rápidos */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Acceso
          href="/movimientos"
          icon={<ArrowLeftRight size={20} strokeWidth={2.5} />}
          titulo="Movimientos"
          nota="Dónde se te escapa"
        />
        <Acceso
          href="/presupuesto"
          icon={<Wallet size={20} strokeWidth={2.5} />}
          titulo="Presupuesto"
          nota="Tu margen de mejora"
        />
        <Acceso
          href="/objetivos"
          icon={<Target size={20} strokeWidth={2.5} />}
          titulo="Objetivos"
          nota="Tus metas"
        />
        <Acceso
          href="/deudas"
          icon={<CreditCard size={20} strokeWidth={2.5} />}
          titulo="Deudas"
          nota={euro(m.deudaTotal)}
        />
        <Acceso
          href="/fondo-emergencia"
          icon={<PiggyBank size={20} strokeWidth={2.5} />}
          titulo="Fondo emergencia"
          nota={`${m.mesesFondo.toFixed(1)} meses`}
        />
        <Acceso
          href="/cuentas"
          icon={<Landmark size={20} strokeWidth={2.5} />}
          titulo="Mis cuentas"
          nota={euro(m.liquidezTotal)}
        />
      </div>

      {/* Herramientas */}
      <p className="mt-6 font-display text-xl font-bold text-navy">
        Herramientas
      </p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Herramienta
          href="/simulador"
          icon={<SlidersHorizontal size={22} strokeWidth={2.5} />}
          titulo="Simulador"
        />
        <Herramienta
          href="/me-lo-puedo-permitir"
          icon={<Calculator size={22} strokeWidth={2.5} />}
          titulo="¿Me lo puedo permitir?"
        />
        <Herramienta
          href="/asistente"
          icon={<Sparkles size={22} strokeWidth={2.5} />}
          titulo="Asistente"
        />
        <Herramienta
          href="/inversion"
          icon={<TrendingUp size={22} strokeWidth={2.5} />}
          titulo="Inversión"
        />
        <Herramienta
          href="/familia"
          icon={<Users size={22} strokeWidth={2.5} />}
          titulo="Familia"
        />
        <Herramienta
          href="/logros"
          icon={<Trophy size={22} strokeWidth={2.5} />}
          titulo="Logros"
        />
      </div>

      <p className="mt-6 text-center text-xs font-semibold text-navy/50">
        Cashly ofrece información y educación financiera. No sustituye el
        asesoramiento profesional.
      </p>
    </AppShell>
  );
}

function Acceso({
  href,
  icon,
  titulo,
  nota,
}: {
  href: string;
  icon: React.ReactNode;
  titulo: string;
  nota: string;
}) {
  return (
    <Link href={href} className="card press flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan text-navy">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display font-bold text-navy">{titulo}</p>
        <p className="truncate text-xs font-semibold text-slate">{nota}</p>
      </div>
      <ArrowRight size={16} strokeWidth={2.5} className="text-slate" />
    </Link>
  );
}

function Herramienta({
  href,
  icon,
  titulo,
}: {
  href: string;
  icon: React.ReactNode;
  titulo: string;
}) {
  return (
    <Link
      href={href}
      className="card press flex flex-col items-center gap-2 px-2 py-4 text-center"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow text-navy">
        {icon}
      </span>
      <span className="text-xs font-bold leading-tight text-navy">
        {titulo}
      </span>
    </Link>
  );
}
