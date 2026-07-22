import type { LucideIcon } from "lucide-react";

type PlaceholderProps = {
  icon: LucideIcon;
  titulo: string;
  descripcion: string;
  fase: string;
};

// Pantalla "próximamente" con el nombre real de la sección.
export default function Placeholder({
  icon: Icon,
  titulo,
  descripcion,
  fase,
}: PlaceholderProps) {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-navy">{titulo}</h1>

      <div className="card mt-6 flex flex-col items-center gap-4 py-12 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow">
          <Icon size={30} strokeWidth={2.5} className="text-navy" />
        </span>
        <p className="max-w-xs font-semibold text-slate">{descripcion}</p>
        <span className="rounded-full bg-navy px-4 py-1.5 text-xs font-bold text-yellow">
          {fase}
        </span>
      </div>
    </div>
  );
}
