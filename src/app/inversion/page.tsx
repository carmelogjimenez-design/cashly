import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import AppShell from "@/components/AppShell";
import SimuladorInversion from "@/components/SimuladorInversion";
import { getResumen } from "@/lib/datos";
import { calcularMetricas, hayDeudaCara } from "@/lib/finanzas";

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
      "A más rentabilidad esperada, más riesgo. Invertir tiene sentido a largo plazo (años), no para el dinero que necesitas pronto.",
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
      <h1 className="font-display text-3xl font-bold text-navy">Inversión</h1>
      <p className="mt-1 font-semibold text-slate">
        Aprende cómo funciona antes de dar el paso.
      </p>

      {/* Semáforo: ¿estás listo? */}
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
                  Todavía no es tu momento
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
          ⚠️ Cashly te forma, no te dice dónde invertir. Esto es contenido
          educativo, no asesoramiento. Las rentabilidades pasadas no garantizan
          las futuras. Ante dudas, consulta con un profesional registrado.
        </p>
      </div>
    </AppShell>
  );
}
