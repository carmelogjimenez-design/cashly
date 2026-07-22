type Props = {
  valor: number; // 0..1
  color?: string; // clase de fondo
  alto?: string;
};

export default function Barra({
  valor,
  color = "bg-cyan",
  alto = "h-3",
}: Props) {
  const pct = Math.max(0, Math.min(1, valor)) * 100;
  return (
    <div className={`w-full overflow-hidden rounded-full bg-navy/10 ${alto}`}>
      <div
        className={`${alto} rounded-full ${color} transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
