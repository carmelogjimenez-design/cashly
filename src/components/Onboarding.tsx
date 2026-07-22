"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Mascota from "@/components/Mascota";
import { guardarPerfilOnboarding, cargarDatosEjemplo } from "@/app/actions";
import { toque, celebrarFeedback } from "@/lib/feedback";

export default function Onboarding() {
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [pending, startTransition] = useTransition();

  const [ingreso, setIngreso] = useState("");
  const [situacion, setSituacion] = useState("familia");
  const [hijos, setHijos] = useState("0");
  const [fondo, setFondo] = useState("");

  function siguiente() {
    toque();
    setPaso((p) => p + 1);
  }

  function guardar(cargarEjemplo: boolean) {
    const fd = new FormData();
    fd.set("ingreso_mensual", ingreso || "0");
    fd.set("situacion", situacion);
    fd.set("num_hijos", hijos || "0");
    fd.set("fondo_objetivo", fondo || "0");
    startTransition(async () => {
      await guardarPerfilOnboarding(fd);
      if (cargarEjemplo) await cargarDatosEjemplo();
      celebrarFeedback();
      router.refresh();
    });
  }

  // Paso 0: bienvenida
  if (paso === 0) {
    return (
      <div className="flex flex-col items-center pt-6 text-center">
        <Mascota estado="feliz" size={150} />
        <h1 className="mt-4 font-display text-3xl font-bold text-navy">
          ¡Hola! Soy Cash 👋
        </h1>
        <p className="mt-2 max-w-xs font-semibold text-navy/80">
          Voy a ser tu copiloto. Con tres preguntas rápidas preparo tu Cashly a
          tu medida.
        </p>
        <button className="btn-primary mt-8 w-full max-w-xs" onClick={siguiente}>
          Empezar <ArrowRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  // Paso 1: ingresos
  if (paso === 1) {
    return (
      <Paso
        titulo="¿Cuánto entra en casa al mes?"
        subtitulo="Suma todas las nóminas o ingresos fijos. Puedes cambiarlo luego."
        puedeSeguir={Number(ingreso) > 0}
        onSeguir={siguiente}
      >
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={ingreso}
            onChange={(e) => setIngreso(e.target.value)}
            placeholder="2500"
            className="field text-2xl font-bold"
            autoFocus
          />
          <span className="font-display text-2xl font-bold text-navy">€</span>
        </div>
      </Paso>
    );
  }

  // Paso 2: situación + hijos
  if (paso === 2) {
    return (
      <Paso
        titulo="¿Cómo es tu casa?"
        subtitulo="Me ayuda a ajustar tu colchón de emergencia."
        puedeSeguir
        onSeguir={siguiente}
      >
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: "solo", t: "Solo/a" },
            { v: "pareja", t: "En pareja" },
            { v: "familia", t: "Con hijos" },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setSituacion(o.v)}
              className={`rounded-2xl px-2 py-3 text-sm font-bold transition ${
                situacion === o.v
                  ? "bg-navy text-white"
                  : "border-2 border-navy/10 bg-white text-navy"
              }`}
            >
              {o.t}
            </button>
          ))}
        </div>
        {situacion === "familia" && (
          <div className="mt-4">
            <label className="label">¿Cuántos hijos?</label>
            <input
              type="number"
              value={hijos}
              onChange={(e) => setHijos(e.target.value)}
              className="field"
              min="0"
            />
          </div>
        )}
      </Paso>
    );
  }

  // Paso 3: objetivo de fondo
  if (paso === 3) {
    return (
      <Paso
        titulo="¿Cuánto quieres tener de colchón?"
        subtitulo="Un fondo para imprevistos. Si no lo sabes, deja el que te sugiero."
        puedeSeguir
        onSeguir={siguiente}
      >
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={fondo}
            onChange={(e) => setFondo(e.target.value)}
            placeholder="10000"
            className="field text-2xl font-bold"
          />
          <span className="font-display text-2xl font-bold text-navy">€</span>
        </div>
        <p className="mt-2 text-xs font-semibold text-slate">
          Lo habitual son entre 3 y 6 meses de tus gastos.
        </p>
      </Paso>
    );
  }

  // Paso 4: listo
  return (
    <div className="flex flex-col items-center pt-6 text-center">
      <Mascota estado="celebra" size={150} />
      <h1 className="mt-4 font-display text-3xl font-bold text-navy">
        ¡Todo listo!
      </h1>
      <p className="mt-2 max-w-xs font-semibold text-navy/80">
        ¿Quieres ver Cashly con datos de ejemplo o empezar directamente con lo
        tuyo?
      </p>
      <button
        className="btn-primary mt-8 w-full max-w-xs"
        disabled={pending}
        onClick={() => guardar(true)}
      >
        <Sparkles size={20} strokeWidth={2.5} />
        {pending ? "Preparando…" : "Ver con datos de ejemplo"}
      </button>
      <button
        className="btn-secondary mt-3 w-full max-w-xs"
        disabled={pending}
        onClick={() => guardar(false)}
      >
        Empezar con lo mío
      </button>
      <Link
        href="/cuentas"
        className="mt-4 text-sm font-bold text-navy/60 underline"
      >
        Añadiré mis cuentas luego
      </Link>
    </div>
  );
}

function Paso({
  titulo,
  subtitulo,
  children,
  puedeSeguir,
  onSeguir,
}: {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
  puedeSeguir: boolean;
  onSeguir: () => void;
}) {
  return (
    <div className="pt-4">
      <div className="mb-6 flex justify-center">
        <Mascota estado="contento" size={110} />
      </div>
      <h1 className="font-display text-2xl font-bold text-navy">{titulo}</h1>
      <p className="mt-1 text-sm font-semibold text-slate">{subtitulo}</p>
      <div className="mt-5">{children}</div>
      <button
        className="btn-primary mt-8 w-full disabled:opacity-40"
        disabled={!puedeSeguir}
        onClick={onSeguir}
      >
        Continuar <ArrowRight size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}
