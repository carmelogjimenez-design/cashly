import Link from "next/link";
import {
  ArrowLeftRight,
  Wallet,
  Target,
  CreditCard,
  PiggyBank,
  ArrowRight,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import AnilloSalud from "@/components/AnilloSalud";
import Barra from "@/components/Barra";
import CargarEjemplo from "@/components/CargarEjemplo";
import { createClient } from "@/lib/supabase/server";
import { getResumen } from "@/lib/datos";
import {
  calcularMetricas,
  calcularSalud,
  mejorMovimiento,
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
        <p className="font-display text-lg font-semibold text-navy/70">
          Hola, {nombre} 👋
        </p>
        <h1 className="font-display text-3xl font-bold leading-tight text-navy">
          Vamos a poner en marcha tu Cashly.
        </h1>
        <CargarEjemplo />
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

  return (
    <AppShell>
      <p className="font-display text-lg font-semibold text-navy/70">
        Hola, {nombre} 👋
      </p>
      <h1 className="font-display text-3xl font-bold leading-tight text-navy">
        Este es tu panel de Cashly.
      </h1>

      {/* Salud financiera */}
      <div className="card mt-6 bg-navy text-white">
        <div className="flex items-center gap-5">
          <AnilloSalud puntos={salud.total} nivel={salud.nivel} />
          <div className="flex-1">
            <p className="font-display text-lg font-bold text-yellow">
              Tu salud financiera
            </p>
            <p className="text-sm font-semibold text-white/80">
              Sobre 100. Se calcula con cinco áreas de tu economía.
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

      {/* Resumen del mes */}
      <div className="card mt-4">
        <p className="font-display text-lg font-bold text-navy">
          Resumen del mes
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs font-bold text-slate">Ingresos</p>
            <p className="font-display text-lg font-bold text-navy">
              {euro(m.ingresosMes)}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate">Gastos</p>
            <p className="font-display text-lg font-bold text-navy">
              {euro(m.gastosMes)}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate">Ahorro</p>
            <p
              className={`font-display text-lg font-bold ${
                m.ahorroReal >= 0 ? "text-navy" : "text-red-500"
              }`}
            >
              {euro(m.ahorroReal)}
            </p>
          </div>
        </div>
      </div>

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
    <Link href={href} className="card flex items-center gap-3">
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
