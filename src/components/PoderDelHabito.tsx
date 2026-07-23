import Dinero from "@/components/Dinero";

// Cifras calculadas con 20 €/mes y un 7% anual estimado:
// Ana aporta de los 18 a los 28 (2.400 €) y no toca nada más.
// Bea empieza a los 28 y aporta hasta los 65 (8.880 €).
const ANA_APORTADO = 2400;
const ANA_FINAL = 42314;
const BEA_APORTADO = 8880;
const BEA_FINAL = 41931;

export default function PoderDelHabito() {
  const max = Math.max(ANA_FINAL, BEA_FINAL);

  return (
    <div className="card">
      <p className="font-display text-xl font-bold text-navy">
        Ana y Bea (la historia que lo explica todo)
      </p>
      <p className="mt-1 text-sm font-semibold text-slate">
        Las dos apartan 20 € al mes. La única diferencia es{" "}
        <span className="text-navy">cuándo empiezan</span>.
      </p>

      <div className="mt-5 space-y-5">
        <Persona
          emoji="👩‍🦰"
          nombre="Ana"
          detalle="Empieza a los 18 y lo deja a los 28. Solo 10 años. Después no vuelve a meter ni un euro."
          aportado={ANA_APORTADO}
          final={ANA_FINAL}
          max={max}
          color="#22C58B"
          destacar
        />
        <Persona
          emoji="👩"
          nombre="Bea"
          detalle="Empieza a los 28 y no falla ni un mes hasta los 65. 37 años seguidos."
          aportado={BEA_APORTADO}
          final={BEA_FINAL}
          max={max}
          color="#3B6FE0"
        />
      </div>

      <div className="mt-5 rounded-3xl bg-yellow p-4">
        <p className="font-display text-lg font-bold leading-snug text-navy">
          Ana puso casi 4 veces menos dinero… y acabó con más.
        </p>
        <p className="mt-1 text-sm font-semibold text-navy/80">
          No ganó porque metiera más. Ganó porque su dinero tuvo{" "}
          <span className="font-bold">más años</span> para crecer. Eso es el
          interés compuesto: empezar pronto vale más que esforzarse tarde.
        </p>
      </div>

      <p className="mt-3 text-center text-[11px] font-semibold text-navy/50">
        Ejemplo educativo con un 7% anual estimado. No está garantizado.
      </p>
    </div>
  );
}

function Persona({
  emoji,
  nombre,
  detalle,
  aportado,
  final,
  max,
  color,
  destacar = false,
}: {
  emoji: string;
  nombre: string;
  detalle: string;
  aportado: number;
  final: number;
  max: number;
  color: string;
  destacar?: boolean;
}) {
  return (
    <div>
      <div className="flex items-start gap-2">
        <span className="text-2xl">{emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-navy">{nombre}</p>
          <p className="text-xs font-semibold text-slate">{detalle}</p>
        </div>
      </div>

      <div className="mt-2 h-8 w-full overflow-hidden rounded-2xl bg-navy/5">
        <div
          className="flex h-full items-center justify-end rounded-2xl pr-3"
          style={{ width: `${(final / max) * 100}%`, backgroundColor: color }}
        >
          <Dinero
            valor={final}
            size="sm"
            animar={false}
            className="text-white"
          />
        </div>
      </div>

      <p className="mt-1.5 text-xs font-bold text-slate">
        Puso de su bolsillo:{" "}
        <Dinero
          valor={aportado}
          size="sm"
          animar={false}
          className={destacar ? "text-emerald-600" : "text-navy"}
        />
      </p>
    </div>
  );
}
