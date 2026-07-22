"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { Metricas } from "@/lib/finanzas";
import type { Prestamo } from "@/lib/tipos";
import { respuestaAsistente } from "@/lib/finanzas";

const PREGUNTAS = [
  { clave: "ahorrar", texto: "¿Cuánto puedo ahorrar al mes?" },
  { clave: "deuda", texto: "¿Por qué deuda empiezo?" },
  { clave: "fondo", texto: "¿Voy bien de fondo de emergencia?" },
  { clave: "fugas", texto: "¿En qué se me va el dinero?" },
  { clave: "invertir", texto: "¿Puedo empezar a invertir?" },
  { clave: "puntuacion", texto: "¿Cómo subo mi puntuación?" },
];

type Burbuja = { de: "yo" | "cashly"; texto: string };

export default function Asistente({
  base,
  prestamos,
}: {
  base: Metricas;
  prestamos: Prestamo[];
}) {
  const [chat, setChat] = useState<Burbuja[]>([
    {
      de: "cashly",
      texto:
        "¡Hola! Soy tu asistente de Cashly. Toca una pregunta y te respondo con tus números reales.",
    },
  ]);

  function preguntar(clave: string, texto: string) {
    const resp = respuestaAsistente(clave, base, prestamos);
    setChat((c) => [
      ...c,
      { de: "yo", texto },
      { de: "cashly", texto: resp },
    ]);
  }

  return (
    <div className="mt-6">
      <div className="space-y-3">
        {chat.map((b, i) => (
          <div
            key={i}
            className={`flex ${b.de === "yo" ? "justify-end" : "justify-start"}`}
          >
            {b.de === "cashly" && (
              <span className="mr-2 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow">
                <Sparkles size={16} strokeWidth={2.5} className="text-navy" />
              </span>
            )}
            <div
              className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm font-semibold ${
                b.de === "yo"
                  ? "rounded-br-lg bg-navy text-white"
                  : "rounded-bl-lg bg-white text-navy shadow-card"
              }`}
            >
              {b.texto}
            </div>
          </div>
        ))}
      </div>

      {/* Preguntas rápidas */}
      <div className="mt-5 flex flex-wrap gap-2">
        {PREGUNTAS.map((p) => (
          <button
            key={p.clave}
            onClick={() => preguntar(p.clave, p.texto)}
            className="rounded-full bg-white px-3.5 py-2 text-sm font-bold text-navy shadow-card transition active:translate-y-0.5"
          >
            {p.texto}
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-xs font-semibold text-navy/50">
        Respuestas orientativas calculadas con tus datos. No es asesoramiento
        financiero.
      </p>
    </div>
  );
}
