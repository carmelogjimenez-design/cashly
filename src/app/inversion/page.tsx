import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import AppShell from "@/components/AppShell";
import SimuladorInversion from "@/components/SimuladorInversion";
import Mascota from "@/components/Mascota";
import EscalaRiesgo from "@/components/EscalaRiesgo";
import ComparadorInflacion from "@/components/ComparadorInflacion";
import { getResumen } from "@/lib/datos";
import { calcularMetricas, hayDeudaCara } from "@/lib/finanzas";

type Riesgo = string;

const OPCIONES: {
  emoji: string;
  nombre: string;
  riesgo: Riesgo;
  liquidez: string;
  horizonte: string;
  coste: string;
  queEs: string;
  paraQuien: string;
}[] = [
  {
    emoji: "🏦",
    nombre: "Cuenta remunerada",
    riesgo: "Bajo",
    liquidez: "Alta",
    horizonte: "Corto",
    coste: "0",
    queEs:
      "Una cuenta que te paga un interés por tener el dinero ahí, sin inmovilizarlo. Suele estar protegida hasta 100.000 € por el fondo de garantía.",
    paraQuien:
      "El sitio natural para tu fondo de emergencia y el dinero que puedas necesitar pronto.",
  },
  {
    emoji: "🔒",
    nombre: "Depósito a plazo",
    riesgo: "Bajo",
    liquidez: "Baja",
    horizonte: "Corto-medio",
    coste: "0",
    queEs:
      "Bloqueas tu dinero un tiempo (6, 12, 24 meses) a cambio de un interés fijo conocido de antemano. También protegido hasta 100.000 €.",
    paraQuien:
      "Dinero que sabes que no vas a tocar en una temporada y quieres que rente sin sustos.",
  },
  {
    emoji: "📈",
    nombre: "Fondos indexados / ETFs",
    riesgo: "Alto",
    liquidez: "Alta",
    horizonte: "Largo (+5-10 años)",
    coste: "Bajo",
    queEs:
      "Compras de golpe un trocito de miles de empresas del mundo. Suben y bajan, pero a largo plazo es la forma más sencilla y barata de participar en el crecimiento global.",
    paraQuien:
      "Hacer crecer dinero que no necesitas a corto plazo. La opción preferida para el largo plazo por su bajo coste.",
  },
  {
    emoji: "🧾",
    nombre: "Renta fija / bonos",
    riesgo: "Medio",
    liquidez: "Media",
    horizonte: "Medio",
    coste: "Bajo-medio",
    queEs:
      "Prestas dinero a estados o empresas a cambio de intereses. Menos movida que la bolsa, pero también menos rentabilidad esperada.",
    paraQuien:
      "Dar estabilidad a una cartera y no depender solo de la bolsa.",
  },
  {
    emoji: "🧺",
    nombre: "Carteras gestionadas (roboadvisors)",
    riesgo: "Medio",
    liquidez: "Alta",
    horizonte: "Medio-largo",
    coste: "Medio",
    queEs:
      "Una cartera diversificada (bolsa + renta fija) que gestionan por ti según tu perfil de riesgo. Automático y sencillo.",
    paraQuien:
      "Quien quiere invertir diversificado sin tener que elegir ni estar encima.",
  },
  {
    emoji: "👵",
    nombre: "Planes de pensiones / PPI",
    riesgo: "Variable",
    liquidez: "Muy baja",
    horizonte: "Muy largo",
    coste: "Variable",
    queEs:
      "Ahorro para la jubilación con ventajas fiscales, pero no puedes sacarlo hasta jubilarte (salvo casos concretos).",
    paraQuien:
      "Complementar la pensión futura, sabiendo que ese dinero queda inmovilizado años.",
  },
  {
    emoji: "🏠",
    nombre: "Inmobiliario",
    riesgo: "Medio-alto",
    liquidez: "Baja",
    horizonte: "Largo",
    coste: "Alto",
    queEs:
      "Comprar vivienda para alquilar, o invertir en ladrillo a través de fondos/REITs sin comprar un piso entero.",
    paraQuien:
      "Diversificar con inmuebles. Directo requiere mucho capital y da trabajo; vía fondos es más accesible.",
  },
  {
    emoji: "🪙",
    nombre: "Oro y materias primas",
    riesgo: "Alto",
    liquidez: "Media",
    horizonte: "Largo",
    coste: "Medio",
    queEs:
      "Activos como el oro que a veces protegen cuando todo lo demás cae, aunque no generan intereses.",
    paraQuien:
      "Una parte pequeña de la cartera, como refugio o diversificación.",
  },
  {
    emoji: "⚠️",
    nombre: "Criptomonedas",
    riesgo: "Muy alto",
    liquidez: "Alta",
    horizonte: "Largo",
    coste: "Variable",
    queEs:
      "Muy volátiles: pueden multiplicarse o desplomarse. No están protegidas por el fondo de garantía.",
    paraQuien:
      "Solo dinero que te puedas permitir perder por completo, y siempre una parte mínima.",
  },
];

const colorRiesgo: Record<string, string> = {
  Bajo: "bg-emerald-100 text-emerald-700",
  Medio: "bg-amber-100 text-amber-700",
  "Medio-alto": "bg-orange-100 text-orange-700",
  Alto: "bg-red-100 text-red-600",
  "Muy alto": "bg-red-200 text-red-700",
  Variable: "bg-navy/10 text-navy",
};

const CONCEPTOS = [
  {
    emoji: "⏳",
    titulo: "Interés compuesto",
    texto:
      "Tus intereses generan más intereses. Cuanto antes empiezas, más trabaja el tiempo a tu favor.",
  },
  {
    emoji: "🧺",
    titulo: "Diversificación",
    texto:
      "No pongas todos los huevos en la misma cesta. Repartir reduce el riesgo de que algo salga mal.",
  },
  {
    emoji: "📉",
    titulo: "Riesgo y plazo",
    texto:
      "A más rentabilidad esperada, más riesgo. Invertir tiene sentido a largo plazo, no para el dinero que necesitas pronto.",
  },
  {
    emoji: "✂️",
    titulo: "Comisiones",
    texto:
      "Comisiones altas se comen tu rentabilidad año tras año. Compáralas siempre antes de contratar nada.",
  },
];

export default async function InversionPage() {
  const resumen = await getResumen();
  const m = resumen.tieneDatos ? calcularMetricas(resumen) : null;
  const listoParaInvertir =
    m !== null && m.mesesFondo >= 3 && !hayDeudaCara(resumen.prestamos);

  return (
    <AppShell>
      <Link
        href="/dashboard"
        className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-navy/70"
      >
        <ArrowLeft size={16} strokeWidth={2.5} /> Volver
      </Link>

      <div className="flex items-center gap-3">
        <Mascota estado="dinero" size={72} />
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">
            Inversión
          </h1>
          <p className="mt-1 font-semibold text-slate">
            Entiende qué implica antes de dar el paso.
          </p>
        </div>
      </div>

      {/* Qué es invertir */}
      <div className="card mt-6">
        <p className="font-display text-lg font-bold text-navy">
          ¿Qué es invertir, en cristiano?
        </p>
        <p className="mt-2 text-sm font-semibold text-slate">
          Es poner tu dinero a trabajar: en vez de dejarlo quieto, compras algo
          (trozos de empresas, préstamos a estados…) que con el tiempo puede
          valer más. A cambio de que pueda crecer más que en una cuenta,
          aceptas que por el camino suba y baje, y que puedas perder parte,
          sobre todo a corto plazo.
        </p>
        <p className="mt-2 text-sm font-semibold text-navy">
          No es apostar ni hacerse rico rápido. Es tiempo, paciencia y no tocar
          el dinero que no necesitas.
        </p>
      </div>

      {/* Qué implica de verdad */}
      <p className="mt-6 font-display text-xl font-bold text-navy">
        Qué implica de verdad
      </p>
      <div className="mt-3 space-y-3">
        {[
          {
            emoji: "📉",
            t: "Puede bajar antes de subir",
            d: "No es dinero garantizado. Habrá años en rojo. Es normal y forma parte del juego.",
          },
          {
            emoji: "⏳",
            t: "Es cosa de años, no de semanas",
            d: "A corto plazo es una montaña rusa; a largo plazo tiende a crecer. Sin prisa.",
          },
          {
            emoji: "🧯",
            t: "Solo el dinero que no necesites pronto",
            d: "Si lo vas a usar en 1-2 años, no lo inviertas. Ese va a tu fondo o a una cuenta.",
          },
          {
            emoji: "⚖️",
            t: "Más subida = más bajada posible",
            d: "Si algo promete ganar mucho, rápido y sin riesgo, desconfía. No existe.",
          },
        ].map((x) => (
          <div key={x.t} className="card flex gap-3">
            <span className="text-2xl">{x.emoji}</span>
            <div>
              <p className="font-display font-bold text-navy">{x.t}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate">{x.d}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Riesgo y recompensa */}
      <div className="mt-4">
        <EscalaRiesgo />
      </div>

      {/* Por qué no dejarlo quieto */}
      <div className="mt-4">
        <ComparadorInflacion />
      </div>

      {/* ¿Estás listo? */}
      {m !== null && (
        <div
          className={`card mt-6 ${
            listoParaInvertir ? "bg-emerald-500 text-white" : "bg-navy text-white"
          }`}
        >
          {listoParaInvertir ? (
            <>
              <p className="font-display text-lg font-bold">
                ✅ Ya podrías empezar
              </p>
              <p className="mt-1 text-sm font-semibold text-white/90">
                Tienes colchón de emergencia y no arrastras deuda cara. Fórmate
                con calma y empieza poco a poco.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Lock size={20} strokeWidth={2.5} className="text-yellow" />
                <p className="font-display text-lg font-bold text-yellow">
                  Antes de invertir
                </p>
              </div>
              <p className="mt-1 text-sm font-semibold text-white/90">
                {hayDeudaCara(resumen.prestamos)
                  ? "Primero quita la deuda cara: suele costar más de lo que rinde una inversión."
                  : `Primero completa tu fondo de emergencia (cubres ${m.mesesFondo.toFixed(
                      1
                    )} meses; el mínimo sano son 3).`}
              </p>
            </>
          )}
        </div>
      )}

      {/* Contexto de mercado */}
      <div className="card mt-4">
        <p className="font-display text-lg font-bold text-navy">
          Cómo está el mercado ahora
        </p>
        <p className="mt-2 text-sm font-semibold text-slate">
          Estamos en un entorno de tipos de interés moderados (el BCE ronda el
          2%), más altos que la década anterior de tipos casi cero: cuentas
          remuneradas, depósitos y renta fija vuelven a ofrecer algo de
          rentabilidad. La inflación en España sigue algo por encima del 2%, así
          que el dinero parado en la cuenta pierde poder de compra cada año. La
          bolsa mundial continúa siendo la vía de crecimiento a largo plazo
          (históricamente en torno al 6-8% anual, con altibajos).
        </p>
        <p className="mt-2 text-xs font-semibold text-navy/50">
          Cifras orientativas de 2026. Los tipos y rentabilidades cambian:
          confirma siempre las condiciones actuales antes de decidir.
        </p>
      </div>

      {/* ¿Dónde se puede invertir? */}
      <p className="mt-6 font-display text-xl font-bold text-navy">
        ¿Dónde se puede invertir?
      </p>
      <p className="mt-1 text-sm font-semibold text-slate">
        Ordenado de menos a más riesgo. No es una recomendación de compra: es
        el mapa para que sepas qué es cada cosa.
      </p>

      <div className="mt-3 space-y-3">
        {OPCIONES.map((o) => (
          <div key={o.nombre} className="card">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display font-bold text-navy">
                {o.emoji} {o.nombre}
              </p>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  colorRiesgo[o.riesgo] ?? "bg-navy/10 text-navy"
                }`}
              >
                Riesgo {o.riesgo.toLowerCase()}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate">{o.queEs}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-cyan/20 px-2.5 py-1 text-navy">
                Liquidez: {o.liquidez}
              </span>
              <span className="rounded-full bg-cyan/20 px-2.5 py-1 text-navy">
                Plazo: {o.horizonte}
              </span>
              <span className="rounded-full bg-cyan/20 px-2.5 py-1 text-navy">
                Coste: {o.coste}
              </span>
            </div>
            <p className="mt-3 rounded-2xl bg-navy/[0.03] px-3 py-2 text-sm font-semibold text-navy">
              👉 {o.paraQuien}
            </p>
          </div>
        ))}
      </div>

      {/* Cómo elegir */}
      <div className="card mt-4 bg-navy text-white">
        <p className="font-display text-lg font-bold text-yellow">
          En qué orden tiene sentido
        </p>
        <ol className="mt-3 space-y-2 text-sm font-semibold text-white/90">
          <li>1. Quita primero la deuda cara (tarjetas, revolving).</li>
          <li>2. Completa tu fondo de emergencia (3-6 meses).</li>
          <li>3. Empieza a invertir a largo plazo, diversificado y barato.</li>
          <li>4. No metas dinero que puedas necesitar en pocos años.</li>
        </ol>
      </div>

      {/* Calculadora */}
      <SimuladorInversion />

      {/* Conceptos */}
      <p className="mt-6 font-display text-xl font-bold text-navy">
        Lo básico, en claro
      </p>
      <div className="mt-3 space-y-3">
        {CONCEPTOS.map((c) => (
          <div key={c.titulo} className="card">
            <p className="font-display font-bold text-navy">
              {c.emoji} {c.titulo}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate">{c.texto}</p>
          </div>
        ))}
      </div>

      <div className="card mt-4 bg-yellow">
        <p className="text-sm font-bold text-navy">
          ⚠️ Cashly te forma, no te dice qué comprar. Esto es contenido
          educativo, no asesoramiento financiero. Las rentabilidades pasadas no
          garantizan las futuras. Para decisiones concretas, consulta con un
          asesor registrado.
        </p>
      </div>
    </AppShell>
  );
}
