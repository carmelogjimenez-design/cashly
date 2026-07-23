"use client";

import { useState } from "react";
import Dinero from "@/components/Dinero";

const TASA = 7; // rentabilidad histórica orientativa de la bolsa mundial a largo plazo

function fv(mensual: number, anios: number, tasa = TASA) {
  const n = anios * 12;
  const i = tasa / 100 / 12;
  if (i === 0) return mensual * n;
  return mensual * ((Math.pow(1 + i, n) - 1) / i);
}

// Traduce el aporte mensual a cosas del día a día.
function enCosas(m: number): string {
  if (m <= 10) return "menos que un menú del McDonald's al mes";
  if (m <= 20) return "un par de cafés a la semana";
  if (m <= 35) return "una suscripción de streaming";
  if (m <= 60) return "dos cenas a domicilio al mes";
  if (m <= 100) return "una noche de fiesta al mes";
  if (m <= 200) return "unas zapatillas nuevas cada dos meses";
  return "un buen pellizco al mes";
}

export default function MaquinaDelTiempo() {
  const [edad, setEdad] = useState(25);
  const [mensual, setMensual] = useState(20);

  const aniosHastaJubilar = Math.max(1, 65 - edad);
  const ahora = fv(mensual, aniosHastaJubilar);
  const desde18 = fv(mensual, 65 - 18);
  const perdido = Math.max(0, desde18 - ahora);
  const aportado = mensual * 12 * aniosHastaJubilar;
  const regalado = Math.max(0, ahora - aportado);

  // Puntos para la curva
  const puntos: { x: number; y: number }[] = [];
  for (let a = 0; a <= aniosHastaJubilar; a++) {
    puntos.push({ x: a, y: fv(mensual, a) });
  }
  const maxY = puntos[puntos.length - 1].y || 1;
  const W = 300;
  const H = 110;
  const path = puntos
    .map((p, i) => {
      const x = (p.x / aniosHastaJubilar) * W;
      const y = H - (p.y / maxY) * H;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `${path} L${W},${H} L0,${H} Z`;

  return (
    <div className="card bg-navy text-white">
      <p className="font-display text-xl font-bold text-yellow">
        La máquina del tiempo
      </p>
      <p className="mt-1 text-sm font-semibold text-white/80">
        Lo que más hace crecer tu dinero no es cuánto metes. Es cuántos años lo
        dejas trabajando.
      </p>

      {/* Controles */}
      <div className="mt-5 space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm font-bold">
            <span className="text-white/70">Tengo</span>
            <span className="font-display text-lg text-white">{edad} años</span>
          </div>
          <input
            type="range"
            min={16}
            max={60}
            step={1}
            value={edad}
            onChange={(e) => setEdad(Number(e.target.value))}
            className="mt-2 w-full"
          />
        </div>
        <div>
          <div className="flex items-center justify-between text-sm font-bold">
            <span className="text-white/70">Aparto al mes</span>
            <Dinero
              valor={mensual}
              size="sm"
              animar={false}
              className="text-white"
            />
          </div>
          <input
            type="range"
            min={5}
            max={300}
            step={5}
            value={mensual}
            onChange={(e) => setMensual(Number(e.target.value))}
            className="mt-2 w-full"
          />
          <p className="mt-1 text-xs font-semibold text-white/60">
            Aprox. {enCosas(mensual)}.
          </p>
        </div>
      </div>

      {/* Resultado */}
      <div className="mt-5 rounded-3xl bg-white/10 p-4 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-white/60">
          Si empiezas hoy, a los 65 tendrías
        </p>
        <Dinero valor={ahora} size="xl" className="mt-1 text-yellow" />
        <p className="mt-1 text-xs font-semibold text-white/70">
          De ahí, tú habrías puesto <Dinero valor={aportado} size="sm" animar={false} className="text-white" /> · el
          resto (<Dinero valor={regalado} size="sm" animar={false} className="text-yellow" />) lo pone el tiempo.
        </p>

        {/* Curva */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mt-4 w-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="gradTiempo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE500" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#FFE500" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#gradTiempo)" />
          <path
            d={path}
            fill="none"
            stroke="#FFE500"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <div className="flex justify-between text-[11px] font-bold text-white/50">
          <span>hoy</span>
          <span>65 años</span>
        </div>
      </div>

      {/* El coste de esperar */}
      {edad > 18 && perdido > 0 && (
        <div className="mt-4 rounded-3xl bg-yellow p-4 text-navy">
          <p className="text-xs font-bold uppercase tracking-wide text-navy/60">
            El coste de haber esperado
          </p>
          <p className="mt-1 font-display text-lg font-bold leading-snug">
            Con esos mismos {mensual} € al mes, empezando a los 18 tendrías{" "}
            <Dinero valor={desde18} size="md" animar={false} className="text-navy" />
          </p>
          <p className="mt-1 text-sm font-semibold text-navy/80">
            Esperar te ha costado{" "}
            <Dinero valor={perdido} size="sm" animar={false} className="text-navy" />{" "}
            — sin haber puesto ni un euro más. Por eso el mejor momento para
            empezar era hace años… y el segundo mejor es hoy.
          </p>
        </div>
      )}

      <p className="mt-4 text-center text-[11px] font-semibold text-white/50">
        Ejemplo educativo con una rentabilidad estimada del {TASA}% anual (media
        histórica a largo plazo). No está garantizado: los mercados suben y
        bajan.
      </p>
    </div>
  );
}
