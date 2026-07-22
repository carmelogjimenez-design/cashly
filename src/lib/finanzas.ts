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
