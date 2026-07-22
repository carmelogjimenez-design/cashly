"use client";

import { useEffect } from "react";

// Ajusta el color del halo superior según la salud financiera.
// Cálido y suave cuando hay margen de mejora; nunca un rojo de alarma.
export default function Atmosfera({ puntos }: { puntos: number }) {
  useEffect(() => {
    const root = document.documentElement;
    let halo = "rgba(255,255,255,0.35)";
    if (puntos < 45) halo = "rgba(255,201,120,0.5)";
    else if (puntos < 65) halo = "rgba(255,238,196,0.45)";
    root.style.setProperty("--halo", halo);
    return () => {
      root.style.removeProperty("--halo");
    };
  }, [puntos]);

  return null;
}
