export default function EscalaRiesgo() {
  return (
    <div className="card">
      <p className="font-display text-lg font-bold text-navy">
        Riesgo y recompensa van de la mano
      </p>
      <p className="mt-1 text-sm font-semibold text-slate">
        No existe "gana mucho y sin riesgo". Cuanto más puede subir algo, más
        puede bajar. Esa es la regla de oro.
      </p>

      <div
        className="mt-4 h-3 rounded-full"
        style={{
          background: "linear-gradient(90deg,#22C58B 0%,#FFD400 55%,#EF4444 100%)",
        }}
      />
      <div className="mt-2 flex justify-between text-xs font-bold text-navy">
        <span>Cuenta · depósito</span>
        <span>Fondos · bolsa</span>
        <span>Cripto</span>
      </div>
      <div className="mt-1 flex justify-between text-[11px] font-semibold text-slate">
        <span>Poco riesgo,</span>
        <span className="text-right">mucho riesgo,</span>
      </div>
      <div className="flex justify-between text-[11px] font-semibold text-slate">
        <span>crece despacio</span>
        <span className="text-right">muy inestable</span>
      </div>
    </div>
  );
}
