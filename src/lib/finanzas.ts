import type {
  Movimiento,
  Cuenta,
  Prestamo,
  Objetivo,
  ResumenFinanciero,
} from "./tipos";

// ------------------------------------------------------------
// Categorías
// ------------------------------------------------------------
export const CATEGORIAS = [
  "Vivienda",
  "Alimentación",
  "Transporte",
  "Familia",
  "Salud",
  "Educación",
  "Deudas",
  "Ocio",
  "Suscripciones",
  "Ahorro",
  "Inversión",
  "Imprevistos",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

// Gastos que cubren necesidades básicas.
export const CATEGORIAS_ESENCIALES: string[] = [
  "Vivienda",
  "Alimentación",
  "Transporte",
  "Salud",
  "Educación",
  "Familia",
  "Deudas",
];

// Categorías que son ahorro/inversión (no cuentan como gasto).
export const CATEGORIAS_AHORRO: string[] = ["Ahorro", "Inversión"];

export const EMOJI_CATEGORIA: Record<string, string> = {
  Vivienda: "🏠",
  Alimentación: "🛒",
  Transporte: "🚗",
  Familia: "👨‍👩‍👧",
  Salud: "💊",
  Educación: "🎓",
  Deudas: "💳",
  Ocio: "🎉",
  Suscripciones: "📱",
  Ahorro: "🐷",
  Inversión: "📈",
  Imprevistos: "⚡",
};

// ------------------------------------------------------------
// Formato
// ------------------------------------------------------------
export function euro(n: number, decimales = 0): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(n);
}

export function fechaCorta(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(d);
}

// ------------------------------------------------------------
// Cálculos base del mes
// ------------------------------------------------------------
export interface Metricas {
  ingresosMes: number;
  gastosMes: number;
  gastosEsenciales: number;
  gastosPrescindibles: number;
  ahorroReal: number; // ingresos - gastos
  tasaAhorro: number; // 0..1
  ahorroLiquido: number; // saldo en cuentas de ahorro
  liquidezTotal: number; // todas las cuentas
  deudaNoHipotecaria: number;
  deudaTotal: number;
  cuotasDeudaMes: number;
  cuotasNoHipoteca: number;
  tieneInversiones: boolean;
  mesesFondo: number; // meses de gastos esenciales cubiertos
  gastoPorCategoria: Record<string, number>;
}

function ultimos30(movs: Movimiento[]): Movimiento[] {
  const limite = new Date();
  limite.setDate(limite.getDate() - 31);
  return movs.filter((m) => new Date(m.fecha) >= limite);
}

export function calcularMetricas(r: ResumenFinanciero): Metricas {
  const movs = ultimos30(r.movimientos);

  const ingresosMes = movs
    .filter((m) => m.tipo === "ingreso")
    .reduce((s, m) => s + m.importe, 0);

  const gastos = movs.filter(
    (m) => m.tipo === "gasto" && !CATEGORIAS_AHORRO.includes(m.categoria)
  );
  const gastosMes = gastos.reduce((s, m) => s + m.importe, 0);
  const gastosEsenciales = gastos
    .filter((m) => CATEGORIAS_ESENCIALES.includes(m.categoria))
    .reduce((s, m) => s + m.importe, 0);
  const gastosPrescindibles = gastos
    .filter((m) => m.prescindible)
    .reduce((s, m) => s + m.importe, 0);

  const gastoPorCategoria: Record<string, number> = {};
  for (const m of gastos) {
    gastoPorCategoria[m.categoria] =
      (gastoPorCategoria[m.categoria] ?? 0) + m.importe;
  }

  const ahorroReal = ingresosMes - gastosMes;
  const tasaAhorro = ingresosMes > 0 ? ahorroReal / ingresosMes : 0;

  const ahorroLiquido = r.cuentas
    .filter((c) => c.tipo === "ahorro")
    .reduce((s, c) => s + c.saldo, 0);
  const liquidezTotal = r.cuentas.reduce((s, c) => s + c.saldo, 0);

  const deudaNoHipotecaria = r.prestamos
    .filter((p) => p.tipo !== "hipoteca")
    .reduce((s, p) => s + p.saldo_pendiente, 0);
  const deudaTotal = r.prestamos.reduce((s, p) => s + p.saldo_pendiente, 0);
  const cuotasDeudaMes = r.prestamos.reduce((s, p) => s + p.cuota_mensual, 0);
  const cuotasNoHipoteca = r.prestamos
    .filter((p) => p.tipo !== "hipoteca")
    .reduce((s, p) => s + p.cuota_mensual, 0);

  const tieneInversiones =
    r.cuentas.some((c) => c.tipo === "inversion") ||
    r.objetivos.some((o) => /inver/i.test(o.tipo) || /inver/i.test(o.nombre));

  const gastoEsencialMensual = gastosEsenciales > 0 ? gastosEsenciales : 1;
  const mesesFondo = ahorroLiquido / gastoEsencialMensual;

  return {
    ingresosMes,
    gastosMes,
    gastosEsenciales,
    gastosPrescindibles,
    ahorroReal,
    tasaAhorro,
    ahorroLiquido,
    liquidezTotal,
    deudaNoHipotecaria,
    deudaTotal,
    cuotasDeudaMes,
    cuotasNoHipoteca,
    tieneInversiones,
    mesesFondo,
    gastoPorCategoria,
  };
}

// ------------------------------------------------------------
// Puntuación de salud financiera (0–100)
// ------------------------------------------------------------
export interface AreaSalud {
  nombre: string;
  puntos: number; // 0..20
  resumen: string;
}

export interface Salud {
  total: number; // 0..100
  areas: AreaSalud[];
  nivel: string;
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export function calcularSalud(m: Metricas, tieneDeudaCara: boolean): Salud {
  // 1. Control de gastos
  const ratioGasto = m.ingresosMes > 0 ? m.gastosMes / m.ingresosMes : 1.2;
  let control = clamp((1.05 - ratioGasto) / 0.35, 0, 1) * 20;
  const ratioPrescindible =
    m.gastosMes > 0 ? m.gastosPrescindibles / m.gastosMes : 0;
  if (ratioPrescindible > 0.25) control -= 3;
  control = clamp(control, 0, 20);

  // 2. Nivel de ahorro
  const ahorro = clamp(m.tasaAhorro / 0.2, 0, 1) * 20;

  // 3. Fondo de emergencia
  const fondo = clamp(m.mesesFondo / 6, 0, 1) * 20;

  // 4. Nivel de deuda (deuda de consumo, la hipoteca cuenta como gasto)
  const ratioCuota =
    m.ingresosMes > 0 ? m.cuotasNoHipoteca / m.ingresosMes : 0.3;
  let deuda = clamp((0.2 - ratioCuota) / 0.2, 0, 1) * 20;
  if (tieneDeudaCara) deuda -= 4;
  deuda = clamp(deuda, 0, 20);

  // 5. Preparación para el futuro
  let futuro = 0;
  if (m.mesesFondo >= 1) futuro += 6;
  if (m.tasaAhorro > 0.05) futuro += 5;
  if (m.tieneInversiones) futuro += 6;
  else if (m.mesesFondo >= 3) futuro += 3;
  futuro = clamp(futuro, 0, 20);

  const areas: AreaSalud[] = [
    {
      nombre: "Control de gastos",
      puntos: Math.round(control),
      resumen:
        ratioGasto < 0.85
          ? "Gastas menos de lo que ingresas. Bien."
          : "Tus gastos se comen casi todo lo que entra.",
    },
    {
      nombre: "Nivel de ahorro",
      puntos: Math.round(ahorro),
      resumen:
        m.tasaAhorro >= 0.15
          ? "Ahorras un buen porcentaje cada mes."
          : "Ahorras poco al final del mes.",
    },
    {
      nombre: "Fondo de emergencia",
      puntos: Math.round(fondo),
      resumen: `Cubres ${m.mesesFondo.toFixed(1)} meses de gastos básicos.`,
    },
    {
      nombre: "Nivel de deuda",
      puntos: Math.round(deuda),
      resumen: tieneDeudaCara
        ? "Tienes deuda con interés alto que conviene atacar."
        : "Tu carga de deuda es manejable.",
    },
    {
      nombre: "Preparación para el futuro",
      puntos: Math.round(futuro),
      resumen: m.tieneInversiones
        ? "Ya das pasos para hacer crecer tu dinero."
        : "Aún no inviertes de cara al futuro.",
    },
  ];

  const total = clamp(
    Math.round(areas.reduce((s, a) => s + a.puntos, 0)),
    0,
    100
  );

  let nivel = "En construcción";
  if (total >= 80) nivel = "Muy sólida";
  else if (total >= 65) nivel = "Buena";
  else if (total >= 45) nivel = "Mejorable";
  else nivel = "Frágil";

  return { total, areas, nivel };
}

// ------------------------------------------------------------
// Recomendación prioritaria + próximas acciones
// ------------------------------------------------------------
export interface Recomendacion {
  titulo: string;
  detalle: string;
}

export function mejorMovimiento(
  m: Metricas,
  prestamos: Prestamo[],
  fondoObjetivo: number | null
): Recomendacion {
  const deudaCara = prestamos
    .filter((p) => p.tin >= 15)
    .sort((a, b) => b.tin - a.tin)[0];

  if (deudaCara && m.mesesFondo < 3) {
    return {
      titulo: `Ataca primero "${deudaCara.nombre}"`,
      detalle: `Paga al ${deudaCara.tin.toFixed(
        1
      )}% de interés: es lo que más te cuesta. Mantén un pequeño colchón y reduce esa deuda antes de invertir.`,
    };
  }

  if (m.mesesFondo < 3) {
    const objetivo =
      fondoObjetivo && fondoObjetivo > 0
        ? fondoObjetivo
        : Math.round(m.gastosEsenciales * 4);
    return {
      titulo: "Construye tu fondo de emergencia",
      detalle: `Ahora mismo tu mejor movimiento no es invertir. Primero completa un colchón de ${euro(
        objetivo
      )} para dormir tranquilo.`,
    };
  }

  if (!m.tieneInversiones && m.tasaAhorro > 0.05) {
    const aporte = Math.max(50, Math.round((m.ahorroReal * 0.4) / 10) * 10);
    return {
      titulo: "Ya puedes empezar a invertir",
      detalle: `Tienes colchón y ahorras cada mes. Podrías estudiar aportar unos ${euro(
        aporte
      )}/mes en productos diversificados y de bajo coste. Revisa antes riesgo, comisiones y fiscalidad.`,
    };
  }

  if (m.tasaAhorro <= 0.05) {
    return {
      titulo: "Recorta una fuga y gana margen",
      detalle: `Casi no te queda ahorro al final del mes. Reducir gastos prescindibles (${euro(
        m.gastosPrescindibles
      )} este mes) es tu palanca más rápida.`,
    };
  }

  return {
    titulo: "Vas por buen camino",
    detalle:
      "Mantén el ritmo de ahorro y revisa tus objetivos para seguir subiendo tu puntuación.",
  };
}

// ------------------------------------------------------------
// Presupuesto adaptativo
// ------------------------------------------------------------
export interface LineaPresupuesto {
  categoria: string;
  gastoActual: number;
  sugerido: number;
  ahorroAnual: number;
}

// Sugiere un tope por categoría partiendo de lo que ya gasta el usuario:
// recorta lo prescindible y respeta lo esencial.
export function sugerirPresupuesto(m: Metricas): LineaPresupuesto[] {
  const lineas: LineaPresupuesto[] = [];
  for (const [categoria, gastoActual] of Object.entries(m.gastoPorCategoria)) {
    let factor = 1;
    if (categoria === "Ocio" || categoria === "Suscripciones") factor = 0.7;
    else if (!CATEGORIAS_ESENCIALES.includes(categoria)) factor = 0.85;
    const sugerido = Math.round((gastoActual * factor) / 5) * 5;
    const ahorroAnual = Math.max(0, (gastoActual - sugerido) * 12);
    lineas.push({ categoria, gastoActual, sugerido, ahorroAnual });
  }
  return lineas.sort((a, b) => b.ahorroAnual - a.ahorroAnual);
}

// ------------------------------------------------------------
// Deuda: coste y estrategias
// ------------------------------------------------------------
export function interesesPendientes(p: Prestamo): number {
  // Aproximación simple: cuota total restante menos capital pendiente.
  if (p.cuota_mensual <= 0 || !p.fecha_fin) return 0;
  const meses = mesesHasta(p.fecha_fin);
  const totalPorPagar = p.cuota_mensual * meses;
  return Math.max(0, totalPorPagar - p.saldo_pendiente);
}

export function mesesHasta(iso: string): number {
  const fin = new Date(iso);
  const hoy = new Date();
  const meses =
    (fin.getFullYear() - hoy.getFullYear()) * 12 +
    (fin.getMonth() - hoy.getMonth());
  return Math.max(0, meses);
}

// Orden avalancha (mayor interés primero) y bola de nieve (menor saldo primero).
export function ordenAvalancha(prestamos: Prestamo[]): Prestamo[] {
  return [...prestamos].sort((a, b) => b.tin - a.tin);
}
export function ordenBolaNieve(prestamos: Prestamo[]): Prestamo[] {
  return [...prestamos].sort((a, b) => a.saldo_pendiente - b.saldo_pendiente);
}

// ------------------------------------------------------------
// Objetivos
// ------------------------------------------------------------
export function aporteMensualObjetivo(o: Objetivo): number {
  const restante = Math.max(0, o.cantidad_objetivo - o.cantidad_actual);
  if (!o.fecha_objetivo) return 0;
  const meses = Math.max(1, mesesHasta(o.fecha_objetivo));
  return restante / meses;
}

export function progresoObjetivo(o: Objetivo): number {
  if (o.cantidad_objetivo <= 0) return 0;
  return clamp(o.cantidad_actual / o.cantidad_objetivo, 0, 1);
}

// Utilidad para detectar deuda cara desde fuera del motor.
export function hayDeudaCara(prestamos: Prestamo[]): boolean {
  return prestamos.some((p) => p.tin >= 15 && p.saldo_pendiente > 0);
}

// Total de saldo en cuentas de un tipo.
export function saldoPorTipo(cuentas: Cuenta[], tipo: string): number {
  return cuentas.filter((c) => c.tipo === tipo).reduce((s, c) => s + c.saldo, 0);
}

// ============================================================
// FASE 4 · Simulador "¿qué pasa si…?"
// ============================================================
export interface Simulacion {
  recorteMensual: number; // menos gasto prescindible al mes
  aporteFondo: number; // € que metes de golpe al fondo
  amortizarCara: number; // € que amortizas de la deuda más cara
}

export interface ResultadoSimulacion {
  salud: Salud;
  mesesFondo: number;
  tasaAhorro: number;
  ahorroReal: number;
  interesesAhorrados: number;
}

export function simularSalud(
  base: Metricas,
  sim: Simulacion,
  prestamos: Prestamo[]
): ResultadoSimulacion {
  const gastosMes = Math.max(0, base.gastosMes - sim.recorteMensual);
  const gastosPrescindibles = Math.max(
    0,
    base.gastosPrescindibles - sim.recorteMensual
  );
  const ahorroReal = base.ingresosMes - gastosMes;
  const tasaAhorro = base.ingresosMes > 0 ? ahorroReal / base.ingresosMes : 0;
  const ahorroLiquido = base.ahorroLiquido + sim.aporteFondo;
  const mesesFondo =
    ahorroLiquido / (base.gastosEsenciales > 0 ? base.gastosEsenciales : 1);

  const cara = ordenAvalancha(prestamos.filter((p) => p.tin >= 15))[0];
  const caraRestante = cara
    ? Math.max(0, cara.saldo_pendiente - sim.amortizarCara)
    : 0;
  const tieneDeudaCara = !!cara && caraRestante > 0;
  const interesesAhorrados = cara
    ? Math.min(sim.amortizarCara, cara.saldo_pendiente) * (cara.tin / 100)
    : 0;

  const m2: Metricas = {
    ...base,
    gastosMes,
    gastosPrescindibles,
    ahorroReal,
    tasaAhorro,
    ahorroLiquido,
    mesesFondo,
  };

  return {
    salud: calcularSalud(m2, tieneDeudaCara),
    mesesFondo,
    tasaAhorro,
    ahorroReal,
    interesesAhorrados,
  };
}

// ============================================================
// FASE 4 · ¿Me lo puedo permitir?
// ============================================================
export interface VeredictoCompra {
  veredicto: "si" | "justo" | "no";
  titulo: string;
  detalle: string;
  dato: string;
}

export function puedoPermitirme(
  m: Metricas,
  importe: number,
  mensual: boolean
): VeredictoCompra {
  if (importe <= 0) {
    return {
      veredicto: "justo",
      titulo: "Introduce una cantidad",
      detalle: "Escribe cuánto cuesta lo que quieres comprar.",
      dato: "",
    };
  }

  if (mensual) {
    const nuevoAhorro = m.ahorroReal - importe;
    const nuevaTasa = m.ingresosMes > 0 ? nuevoAhorro / m.ingresosMes : 0;
    if (importe <= m.ahorroReal * 0.5) {
      return {
        veredicto: "si",
        titulo: "Sí, entra en tu presupuesto",
        detalle: `Después seguirías ahorrando ${euro(
          nuevoAhorro
        )} al mes. Es un gasto asumible.`,
        dato: `Tu ahorro pasaría de ${euro(m.ahorroReal)} a ${euro(
          nuevoAhorro
        )}/mes (${Math.round(nuevaTasa * 100)}%).`,
      };
    }
    if (nuevoAhorro >= 0) {
      return {
        veredicto: "justo",
        titulo: "Sí, pero te deja muy justo",
        detalle:
          "Te lo puedes permitir, aunque te comería casi todo el margen de ahorro. Piensa si compensa.",
        dato: `Solo te quedarían ${euro(nuevoAhorro)} de ahorro al mes.`,
      };
    }
    return {
      veredicto: "no",
      titulo: "Mejor no, ahora mismo",
      detalle:
        "Este gasto fijo te pondría en números rojos cada mes. Busca una opción más barata o libera antes otro gasto.",
      dato: `Te faltarían ${euro(Math.abs(nuevoAhorro))} al mes.`,
    };
  }

  // Compra única
  const otraLiquidez = m.liquidezTotal - m.ahorroLiquido;
  const delAhorro = Math.max(0, importe - otraLiquidez);
  const nuevoFondo = Math.max(0, m.ahorroLiquido - delAhorro);
  const mesesTras =
    nuevoFondo / (m.gastosEsenciales > 0 ? m.gastosEsenciales : 1);
  const liquidezTras = m.liquidezTotal - importe;

  if (liquidezTras < m.gastosEsenciales) {
    return {
      veredicto: "no",
      titulo: "Mejor espera",
      detalle:
        "Pagarlo ahora te dejaría casi sin colchón para imprevistos. Ahorra un poco más antes.",
      dato: `Tu fondo bajaría a ${mesesTras.toFixed(1)} meses de gastos.`,
    };
  }
  if (mesesTras < 3) {
    return {
      veredicto: "justo",
      titulo: "Puedes, pero con cuidado",
      detalle:
        "Te lo puedes permitir, aunque tu fondo de emergencia quedaría por debajo de lo recomendable. Valora si es urgente.",
      dato: `Tu fondo pasaría a ${mesesTras.toFixed(1)} meses.`,
    };
  }
  return {
    veredicto: "si",
    titulo: "Sí, puedes permitírtelo",
    detalle:
      "Después de esta compra seguirías teniendo un colchón sano. Adelante.",
    dato: `Tu fondo se mantendría en ${mesesTras.toFixed(1)} meses.`,
  };
}

// ============================================================
// FASE 4 · Asistente (respuestas a partir de tus datos)
// ============================================================
export interface RespuestaAsistente {
  pregunta: string;
  respuesta: string;
}

export function respuestaAsistente(
  clave: string,
  m: Metricas,
  prestamos: Prestamo[]
): string {
  switch (clave) {
    case "ahorrar": {
      const extra = m.gastosPrescindibles;
      return `Ahora mismo te quedan unos ${euro(
        m.ahorroReal
      )} al mes. Si recortaras la mitad de lo prescindible (${euro(
        extra / 2
      )}), podrías subir a ${euro(m.ahorroReal + extra / 2)}/mes.`;
    }
    case "deuda": {
      const caras = ordenAvalancha(prestamos.filter((p) => p.tipo !== "hipoteca"));
      if (caras.length === 0) return "No tienes deudas de consumo. ¡Bien!";
      return `Empieza por "${caras[0].nombre}" (${caras[0].tin.toFixed(
        1
      )}% de interés): es la que más te cuesta. Es la estrategia que más dinero te ahorra.`;
    }
    case "fondo": {
      if (m.mesesFondo >= 3)
        return `Vas bien: cubres ${m.mesesFondo.toFixed(
          1
        )} meses de gastos. Lo recomendable es entre 3 y 6.`;
      return `Cubres ${m.mesesFondo.toFixed(
        1
      )} meses. Es tu punto más flojo: intenta llegar al menos a 3 meses antes de otras metas.`;
    }
    case "fugas": {
      const cat = Object.entries(m.gastoPorCategoria)
        .filter(([c]) => c !== "Deudas" && c !== "Vivienda")
        .sort((a, b) => b[1] - a[1])[0];
      return `Este mes lo prescindible suma ${euro(
        m.gastosPrescindibles
      )} (${euro(m.gastosPrescindibles * 12)} al año). Tu mayor gasto variable es ${
        cat ? cat[0] : "Ocio"
      }.`;
    }
    case "invertir": {
      if (m.mesesFondo < 3)
        return "Aún no. Primero completa tu fondo de emergencia (3-6 meses). Invertir con el colchón a medias es arriesgado.";
      if (hayDeudaCara(prestamos))
        return "Antes de invertir, quita la deuda cara: te cuesta más de lo que suele rentar una inversión.";
      return `Tienes colchón y sin deuda cara: ya puedes plantearte invertir a largo plazo una parte de tu ahorro. Fórmate primero en la sección de Inversión.`;
    }
    case "puntuacion": {
      return "Tu puntuación sube atacando tu área más floja. Normalmente son el fondo de emergencia y empezar a invertir. Pequeños pasos constantes valen más que grandes cambios puntuales.";
    }
    default:
      return "Prueba con una de las preguntas de abajo.";
  }
}

// ============================================================
// FASE 5 · Inversión (calculadora educativa de interés compuesto)
// ============================================================
export function valorFuturoInversion(
  aporteMensual: number,
  anios: number,
  tasaAnual: number
): { total: number; aportado: number; intereses: number } {
  const n = anios * 12;
  const i = tasaAnual / 100 / 12;
  const total =
    i === 0 ? aporteMensual * n : aporteMensual * ((Math.pow(1 + i, n) - 1) / i);
  const aportado = aporteMensual * n;
  return {
    total,
    aportado,
    intereses: Math.max(0, total - aportado),
  };
}

// ============================================================
// FASE 5 · Alertas (a partir de tus datos)
// ============================================================
export interface Alerta {
  nivel: "peligro" | "aviso" | "bien";
  titulo: string;
  detalle: string;
  href: string;
}

export function calcularAlertas(m: Metricas, prestamos: Prestamo[]): Alerta[] {
  const alertas: Alerta[] = [];

  if (hayDeudaCara(prestamos)) {
    const cara = ordenAvalancha(prestamos.filter((p) => p.tin >= 15))[0];
    alertas.push({
      nivel: "peligro",
      titulo: "Tienes una deuda cara",
      detalle: `"${cara.nombre}" al ${cara.tin.toFixed(
        1
      )}%. Es lo primero que conviene atacar.`,
      href: "/deudas",
    });
  }

  if (m.mesesFondo < 3) {
    alertas.push({
      nivel: m.mesesFondo < 1 ? "peligro" : "aviso",
      titulo: "Fondo de emergencia bajo",
      detalle: `Cubres ${m.mesesFondo.toFixed(
        1
      )} meses. Lo sano es tener entre 3 y 6.`,
      href: "/fondo-emergencia",
    });
  }

  if (m.gastosMes > 0 && m.gastosPrescindibles / m.gastosMes > 0.15) {
    alertas.push({
      nivel: "aviso",
      titulo: "Gasto prescindible alto",
      detalle: `${euro(m.gastosPrescindibles)} este mes en cosas no esenciales (${euro(
        m.gastosPrescindibles * 12
      )} al año).`,
      href: "/movimientos",
    });
  }

  const subs = m.gastoPorCategoria["Suscripciones"] ?? 0;
  if (subs > 60) {
    alertas.push({
      nivel: "aviso",
      titulo: "Muchas suscripciones",
      detalle: `${euro(subs)} al mes. Revisa cuáles usas de verdad.`,
      href: "/movimientos",
    });
  }

  if (m.tasaAhorro >= 0.15) {
    alertas.push({
      nivel: "bien",
      titulo: "Buen ritmo de ahorro",
      detalle: `Ahorras el ${Math.round(
        m.tasaAhorro * 100
      )}% de lo que ingresas. ¡Sigue así!`,
      href: "/objetivos",
    });
  }

  return alertas;
}

// ============================================================
// FASE 5 · Gamificación (nivel + logros)
// ============================================================
export interface Nivel {
  num: number;
  nombre: string;
  progresoPct: number; // dentro del nivel actual
  faltanPuntos: number;
}

export function nivelDesde(total: number): Nivel {
  const bandas = [
    { min: 0, max: 45, num: 1, nombre: "Aprendiz" },
    { min: 45, max: 65, num: 2, nombre: "En marcha" },
    { min: 65, max: 80, num: 3, nombre: "Sólido" },
    { min: 80, max: 101, num: 4, nombre: "Maestro" },
  ];
  const b = bandas.find((x) => total >= x.min && total < x.max) ?? bandas[3];
  const rango = b.max - b.min;
  const progresoPct = Math.round(((total - b.min) / rango) * 100);
  const faltanPuntos = b.num < 4 ? b.max - total : 0;
  return { num: b.num, nombre: b.nombre, progresoPct, faltanPuntos };
}

export interface Logro {
  emoji: string;
  nombre: string;
  desc: string;
  desbloqueado: boolean;
}

export function calcularLogros(
  m: Metricas,
  prestamos: Prestamo[],
  numObjetivos: number
): Logro[] {
  return [
    {
      emoji: "🚀",
      nombre: "Primer paso",
      desc: "Empezaste a controlar tu dinero",
      desbloqueado: true,
    },
    {
      emoji: "🎯",
      nombre: "Con objetivos",
      desc: "Tienes al menos una meta",
      desbloqueado: numObjetivos > 0,
    },
    {
      emoji: "🛡️",
      nombre: "Colchón de 1 mes",
      desc: "Fondo de 1 mes de gastos",
      desbloqueado: m.mesesFondo >= 1,
    },
    {
      emoji: "🏰",
      nombre: "Colchón de 3 meses",
      desc: "Fondo de 3 meses de gastos",
      desbloqueado: m.mesesFondo >= 3,
    },
    {
      emoji: "🐷",
      nombre: "Ahorrador",
      desc: "Ahorras el 15% o más",
      desbloqueado: m.tasaAhorro >= 0.15,
    },
    {
      emoji: "✂️",
      nombre: "Cazador de fugas",
      desc: "Prescindible por debajo del 15%",
      desbloqueado:
        m.gastosMes > 0 && m.gastosPrescindibles / m.gastosMes < 0.15,
    },
    {
      emoji: "💳",
      nombre: "Sin deuda cara",
      desc: "Nada por encima del 15% de interés",
      desbloqueado: !hayDeudaCara(prestamos),
    },
    {
      emoji: "📈",
      nombre: "Inversor",
      desc: "Ya haces crecer tu dinero",
      desbloqueado: m.tieneInversiones,
    },
  ];
}

// ============================================================
// Tendencias: este mes vs. el mes anterior
// ============================================================
export interface Tendencia {
  etiqueta: string;
  actual: number;
  anterior: number;
  deltaPct: number | null;
  mejorSiBaja: boolean; // true = que baje es bueno (gastos, caprichos)
}

export interface Tendencias {
  hayComparacion: boolean;
  items: Tendencia[];
}

export function calcularTendencias(r: ResumenFinanciero): Tendencias {
  const now = Date.now();
  const dia = 86400000;
  const enVentana = (m: Movimiento, desde: number, hasta: number) => {
    const t = new Date(m.fecha).getTime();
    return t <= now - desde * dia && t > now - hasta * dia;
  };
  const sum = (arr: Movimiento[], pred: (m: Movimiento) => boolean) =>
    arr.filter(pred).reduce((s, m) => s + m.importe, 0);

  const esGasto = (m: Movimiento) =>
    m.tipo === "gasto" && !CATEGORIAS_AHORRO.includes(m.categoria);
  const esIngreso = (m: Movimiento) => m.tipo === "ingreso";
  const esPresc = (m: Movimiento) => m.tipo === "gasto" && m.prescindible;

  const A = r.movimientos.filter((m) => enVentana(m, 0, 31));
  const B = r.movimientos.filter((m) => enVentana(m, 31, 62));
  const hayComparacion = B.length > 0;

  const gA = sum(A, esGasto),
    gB = sum(B, esGasto);
  const iA = sum(A, esIngreso),
    iB = sum(B, esIngreso);
  const pA = sum(A, esPresc),
    pB = sum(B, esPresc);
  const sA = iA - gA,
    sB = iB - gB;

  const delta = (a: number, b: number) =>
    b > 0 ? ((a - b) / b) * 100 : null;

  const items: Tendencia[] = [
    { etiqueta: "Gastos", actual: gA, anterior: gB, deltaPct: delta(gA, gB), mejorSiBaja: true },
    { etiqueta: "Ahorro", actual: sA, anterior: sB, deltaPct: delta(sA, sB), mejorSiBaja: false },
    { etiqueta: "Caprichos", actual: pA, anterior: pB, deltaPct: delta(pA, pB), mejorSiBaja: true },
    { etiqueta: "Ingresos", actual: iA, anterior: iB, deltaPct: delta(iA, iB), mejorSiBaja: false },
  ];

  return { hayComparacion, items };
}

// Valor futuro de una cantidad única (interés compuesto anual).
export function valorFuturoUnico(
  principal: number,
  anios: number,
  tasaAnual: number
): number {
  return principal * Math.pow(1 + tasaAnual / 100, anios);
}
