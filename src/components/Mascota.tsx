type Estado = "celebra" | "feliz" | "contento" | "neutral" | "preocupado";

export function estadoDesde(puntos: number): Estado {
  if (puntos >= 80) return "celebra";
  if (puntos >= 65) return "feliz";
  if (puntos >= 45) return "contento";
  if (puntos >= 30) return "neutral";
  return "preocupado";
}

export function fraseMascota(estado: Estado): string {
  switch (estado) {
    case "celebra":
      return "¡Lo estás bordando! Tu dinero trabaja para ti.";
    case "feliz":
      return "Vas muy bien. Sigue así y subimos más.";
    case "contento":
      return "Buen punto de partida. Vamos a pulir un par de cosas.";
    case "neutral":
      return "Hay margen de mejora. Damos un paso hoy.";
    case "preocupado":
      return "Tranquilo, lo enderezamos juntos. Vamos por partes.";
  }
}

export default function Mascota({
  puntos,
  estado,
  size = 120,
}: {
  puntos?: number;
  estado?: Estado;
  size?: number;
}) {
  const e: Estado = estado ?? estadoDesde(puntos ?? 50);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className="animate-float"
      role="img"
      aria-label="Cash, tu mascota financiera"
    >
      {/* sombra */}
      <ellipse cx="60" cy="110" rx="30" ry="6" fill="rgba(7,26,58,0.18)" />
      {/* moneda */}
      <circle cx="60" cy="58" r="46" fill="#FFE500" />
      <circle
        cx="60"
        cy="58"
        r="46"
        fill="none"
        stroke="#E5CE00"
        strokeWidth="5"
      />
      <circle
        cx="60"
        cy="58"
        r="37"
        fill="none"
        stroke="#E5CE00"
        strokeWidth="2.5"
        opacity="0.7"
      />

      {/* ojos */}
      <g className="cash-blink">
        {e === "celebra" ? (
          <>
            <path
              d="M40 54 Q46 47 52 54"
              stroke="#071A3A"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M68 54 Q74 47 80 54"
              stroke="#071A3A"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : (
          <>
            <circle cx="46" cy="53" r="5.5" fill="#071A3A" />
            <circle cx="74" cy="53" r="5.5" fill="#071A3A" />
          </>
        )}
      </g>

      {/* mejillas (estados alegres) */}
      {(e === "celebra" || e === "feliz") && (
        <>
          <circle cx="38" cy="66" r="5" fill="#FF8FA3" opacity="0.7" />
          <circle cx="82" cy="66" r="5" fill="#FF8FA3" opacity="0.7" />
        </>
      )}

      {/* boca */}
      {e === "celebra" && (
        <path d="M44 70 Q60 92 76 70 Q60 80 44 70 Z" fill="#071A3A" />
      )}
      {e === "feliz" && (
        <path
          d="M46 71 Q60 86 74 71"
          stroke="#071A3A"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {e === "contento" && (
        <path
          d="M49 72 Q60 81 71 72"
          stroke="#071A3A"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {e === "neutral" && (
        <path
          d="M51 75 Q60 79 69 75"
          stroke="#071A3A"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {e === "preocupado" && (
        <>
          <path
            d="M50 79 Q60 72 70 79"
            stroke="#071A3A"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          {/* gotita */}
          <path
            d="M86 44 q4 6 0 9 a4.5 4.5 0 1 1-0-9 Z"
            fill="#16C7E8"
            opacity="0.9"
          />
        </>
      )}

      {/* destellos al celebrar */}
      {e === "celebra" && (
        <g className="animate-pulse-soft" fill="#ffffff">
          <path d="M18 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" />
          <path d="M100 20 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5 Z" />
        </g>
      )}
    </svg>
  );
}
