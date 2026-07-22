export type TipoCuenta =
  | "corriente"
  | "ahorro"
  | "conjunta"
  | "efectivo"
  | "inversion";

export type TipoMovimiento = "ingreso" | "gasto";

export type TipoPrestamo =
  | "hipoteca"
  | "coche"
  | "personal"
  | "tarjeta"
  | "otro";

export interface Cuenta {
  id: string;
  nombre: string;
  tipo: TipoCuenta;
  saldo: number;
}

export interface Movimiento {
  id: string;
  cuenta_id: string | null;
  fecha: string;
  comercio: string;
  importe: number;
  tipo: TipoMovimiento;
  categoria: string;
  recurrente: boolean;
  prescindible: boolean;
}

export interface Prestamo {
  id: string;
  nombre: string;
  tipo: TipoPrestamo;
  saldo_pendiente: number;
  cuota_mensual: number;
  tin: number;
  fecha_fin: string | null;
  comision_amortizacion: number;
}

export interface Objetivo {
  id: string;
  nombre: string;
  tipo: string;
  cantidad_objetivo: number;
  cantidad_actual: number;
  fecha_objetivo: string | null;
}

export interface PerfilFinanciero {
  ingreso_mensual: number;
  tipo_ingreso: "fijo" | "variable";
  situacion: "solo" | "pareja" | "familia";
  num_hijos: number;
  objetivo_principal: string | null;
  fondo_objetivo: number | null;
}

// Resumen agregado que consume el dashboard y las demás pantallas.
export interface ResumenFinanciero {
  perfil: PerfilFinanciero | null;
  cuentas: Cuenta[];
  movimientos: Movimiento[];
  prestamos: Prestamo[];
  objetivos: Objetivo[];
  tieneDatos: boolean;
}
