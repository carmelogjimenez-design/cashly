type Props = {
  puntos: number; // 0..100
  nivel: string;
};

export default function AnilloSalud({ puntos, nivel }: Props) {
  const radio = 52;
  const circ = 2 * Math.PI * radio;
  const progreso = circ * (1 - puntos / 100);

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-90">
        <circle
          cx="72"
          cy="72"
          r={radio}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="14"
        />
        <circle
          cx="72"
          cy="72"
          r={radio}
          fill="none"
          stroke="#FFE500"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={progreso}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-4xl font-bold text-white">
          {puntos}
        </span>
        <span className="text-xs font-bold text-yellow">{nivel}</span>
      </div>
    </div>
  );
}
