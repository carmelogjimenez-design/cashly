"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { getTema, aplicarTema, type Tema } from "@/lib/tema";
import { sonidoActivado, setSonido, cling, toque } from "@/lib/feedback";

export default function AjustesApp() {
  const [tema, setTema] = useState<Tema>("claro");
  const [sonido, setSon] = useState(false);

  useEffect(() => {
    setTema(getTema());
    setSon(sonidoActivado());
  }, []);

  function toggleTema() {
    const nuevo: Tema = tema === "oscuro" ? "claro" : "oscuro";
    setTema(nuevo);
    aplicarTema(nuevo);
    toque();
  }

  function toggleSonido() {
    const nuevo = !sonido;
    setSon(nuevo);
    setSonido(nuevo);
    if (nuevo) cling();
  }

  return (
    <div className="card mt-4 divide-y divide-navy/5 p-0">
      <button
        onClick={toggleTema}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan/40 text-navy">
          {tema === "oscuro" ? (
            <Moon size={20} strokeWidth={2.5} />
          ) : (
            <Sun size={20} strokeWidth={2.5} />
          )}
        </span>
        <span className="flex-1 font-display font-bold text-navy">
          Modo noche
        </span>
        <Interruptor activo={tema === "oscuro"} />
      </button>

      <button
        onClick={toggleSonido}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan/40 text-navy">
          {sonido ? (
            <Volume2 size={20} strokeWidth={2.5} />
          ) : (
            <VolumeX size={20} strokeWidth={2.5} />
          )}
        </span>
        <span className="flex-1 font-display font-bold text-navy">
          Sonidos
        </span>
        <Interruptor activo={sonido} />
      </button>
    </div>
  );
}

function Interruptor({ activo }: { activo: boolean }) {
  return (
    <span
      className={`relative h-7 w-12 rounded-full transition-colors ${
        activo ? "bg-yellow" : "bg-navy/15"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
          activo ? "left-6" : "left-1"
        }`}
      />
    </span>
  );
}
