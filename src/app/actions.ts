"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function diasAtras(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// ------------------------------------------------------------
// Cargar datos de ejemplo (perfil ficticio del brief)
// ------------------------------------------------------------
export async function cargarDatosEjemplo() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sin sesión" };
  const uid = user.id;

  // Evita duplicar si ya hay datos.
  const { count } = await supabase
    .from("cuentas")
    .select("id", { count: "exact", head: true });
  if ((count ?? 0) > 0) return { ok: true, yaExistia: true };

  // Perfil
  await supabase.from("perfil_financiero").upsert({
    user_id: uid,
    ingreso_mensual: 5200,
    tipo_ingreso: "fijo",
    situacion: "familia",
    num_hijos: 2,
    objetivo_principal: "Crear un fondo de emergencia",
    fondo_objetivo: 15000,
  });

  // Cuentas
  const { data: cuentas } = await supabase
    .from("cuentas")
    .insert([
      { user_id: uid, nombre: "Cuenta corriente", tipo: "corriente", saldo: 1850 },
      { user_id: uid, nombre: "Cuenta de ahorro", tipo: "ahorro", saldo: 6000 },
      { user_id: uid, nombre: "Cuenta conjunta", tipo: "conjunta", saldo: 900 },
    ])
    .select();

  const corriente =
    cuentas?.find((c) => c.tipo === "corriente")?.id ?? cuentas?.[0]?.id ?? null;

  // Préstamos
  await supabase.from("prestamos").insert([
    {
      user_id: uid,
      nombre: "Hipoteca",
      tipo: "hipoteca",
      saldo_pendiente: 198000,
      cuota_mensual: 1150,
      tin: 3.1,
      fecha_fin: "2049-06-01",
      comision_amortizacion: 0.5,
    },
    {
      user_id: uid,
      nombre: "Préstamo del coche",
      tipo: "coche",
      saldo_pendiente: 8400,
      cuota_mensual: 245,
      tin: 6.5,
      fecha_fin: "2028-03-01",
      comision_amortizacion: 1,
    },
    {
      user_id: uid,
      nombre: "Tarjeta de crédito",
      tipo: "tarjeta",
      saldo_pendiente: 1200,
      cuota_mensual: 90,
      tin: 18.0,
      fecha_fin: null,
      comision_amortizacion: 0,
    },
  ]);

  // Objetivos
  await supabase.from("objetivos").insert([
    {
      user_id: uid,
      nombre: "Fondo de emergencia",
      tipo: "colchon",
      cantidad_objetivo: 15000,
      cantidad_actual: 6000,
      fecha_objetivo: null,
    },
    {
      user_id: uid,
      nombre: "Coche nuevo",
      tipo: "coche",
      cantidad_objetivo: 12000,
      cantidad_actual: 1500,
      fecha_objetivo: diasAtras(-730),
    },
  ]);

  // Movimientos del último mes
  const g = (
    dias: number,
    comercio: string,
    importe: number,
    categoria: string,
    opts: { recurrente?: boolean; prescindible?: boolean; ingreso?: boolean } = {}
  ) => ({
    user_id: uid,
    cuenta_id: corriente,
    fecha: diasAtras(dias),
    comercio,
    importe,
    tipo: opts.ingreso ? "ingreso" : "gasto",
    categoria,
    recurrente: opts.recurrente ?? false,
    prescindible: opts.prescindible ?? false,
  });

  await supabase.from("movimientos").insert([
    // Ingresos
    g(28, "Nómina", 3200, "Ingreso", { ingreso: true, recurrente: true }),
    g(27, "Nómina pareja", 2000, "Ingreso", { ingreso: true, recurrente: true }),
    // Deudas
    g(26, "Hipoteca", 1150, "Deudas", { recurrente: true }),
    g(25, "Préstamo coche", 245, "Deudas", { recurrente: true }),
    g(24, "Pago tarjeta", 90, "Deudas", { recurrente: true }),
    // Vivienda y suministros
    g(20, "Endesa (luz)", 95, "Vivienda", { recurrente: true }),
    g(20, "Naturgy (gas)", 55, "Vivienda", { recurrente: true }),
    g(18, "Canal de Isabel II (agua)", 32, "Vivienda", { recurrente: true }),
    g(15, "Movistar (internet+TV)", 65, "Vivienda", { recurrente: true }),
    g(15, "Móvil (familia)", 42, "Vivienda", { recurrente: true }),
    g(14, "Comunidad de vecinos", 85, "Vivienda", { recurrente: true }),
    g(13, "Seguro del hogar", 24, "Vivienda", { recurrente: true }),
    // Alimentación
    g(24, "Mercadona", 142, "Alimentación"),
    g(19, "Mercadona", 121, "Alimentación"),
    g(13, "Carrefour", 138, "Alimentación"),
    g(7, "Mercadona", 109, "Alimentación"),
    g(3, "Frutería y carnicería", 46, "Alimentación"),
    // Transporte
    g(22, "Repsol (gasolina)", 74, "Transporte"),
    g(12, "Cepsa (gasolina)", 69, "Transporte"),
    g(16, "Seguro del coche", 43, "Transporte", { recurrente: true }),
    g(9, "Parking y peajes", 38, "Transporte"),
    // Educación (2 hijos)
    g(21, "Guardería", 285, "Educación", { recurrente: true }),
    g(21, "Colegio y comedor", 165, "Educación", { recurrente: true }),
    g(17, "Extraescolares (fútbol e inglés)", 95, "Educación", { recurrente: true }),
    // Familia
    g(11, "Ropa de los niños", 78, "Familia", { prescindible: true }),
    g(5, "Farmacia (bebé)", 42, "Familia"),
    // Salud
    g(12, "Farmacia", 28, "Salud"),
    g(8, "Dentista", 55, "Salud"),
    g(6, "Seguro de salud (familia)", 140, "Salud", { recurrente: true }),
    // Ocio / restaurantes (alto)
    g(23, "Restaurante La Tasca", 62, "Ocio", { prescindible: true }),
    g(19, "Cena de aniversario", 89, "Ocio", { prescindible: true }),
    g(15, "Cena con amigos", 54, "Ocio", { prescindible: true }),
    g(14, "Glovo", 28, "Ocio", { prescindible: true }),
    g(11, "Cine en familia", 32, "Ocio", { prescindible: true }),
    g(6, "Restaurante El Rincón", 71, "Ocio", { prescindible: true }),
    g(2, "Bar (cañas)", 32, "Ocio", { prescindible: true }),
    // Compras
    g(18, "Zara", 78, "Ocio", { prescindible: true }),
    g(10, "Amazon (compras varias)", 65, "Ocio", { prescindible: true }),
    g(4, "Peluquería", 35, "Ocio", { prescindible: true }),
    // Suscripciones (alto)
    g(20, "Netflix", 12.99, "Suscripciones", { recurrente: true, prescindible: true }),
    g(20, "Spotify", 10.99, "Suscripciones", { recurrente: true, prescindible: true }),
    g(20, "HBO Max", 9.99, "Suscripciones", { recurrente: true, prescindible: true }),
    g(20, "Disney+", 8.99, "Suscripciones", { recurrente: true, prescindible: true }),
    g(20, "Amazon Prime", 4.99, "Suscripciones", { recurrente: true }),
    g(20, "Gimnasio", 39.99, "Suscripciones", { recurrente: true, prescindible: true }),
    g(20, "iCloud", 2.99, "Suscripciones", { recurrente: true }),
    // Ahorro
    g(27, "Traspaso a ahorro", 200, "Ahorro", { recurrente: true }),
  ]);

  revalidatePath("/dashboard");
  return { ok: true };
}

// ------------------------------------------------------------
// Borrar datos de ejemplo (empezar de cero)
// ------------------------------------------------------------
export async function borrarDatos() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  await supabase.from("movimientos").delete().eq("user_id", user.id);
  await supabase.from("prestamos").delete().eq("user_id", user.id);
  await supabase.from("objetivos").delete().eq("user_id", user.id);
  await supabase.from("cuentas").delete().eq("user_id", user.id);
  await supabase.from("perfil_financiero").delete().eq("user_id", user.id);

  revalidatePath("/dashboard");
  return { ok: true };
}

// ------------------------------------------------------------
// Crear un objetivo nuevo
// ------------------------------------------------------------
export async function crearObjetivo(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const nombre = String(formData.get("nombre") ?? "").trim();
  const objetivo = Number(formData.get("cantidad_objetivo") ?? 0);
  const actual = Number(formData.get("cantidad_actual") ?? 0);
  const fecha = String(formData.get("fecha_objetivo") ?? "");

  if (!nombre || objetivo <= 0) return { ok: false };

  await supabase.from("objetivos").insert({
    user_id: user.id,
    nombre,
    tipo: "otros",
    cantidad_objetivo: objetivo,
    cantidad_actual: actual,
    fecha_objetivo: fecha || null,
  });

  revalidatePath("/objetivos");
  return { ok: true };
}

// ============================================================
// CRUD · Cuentas
// ============================================================
async function usuario() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function crearCuenta(formData: FormData) {
  const { supabase, user } = await usuario();
  if (!user) return { ok: false };
  const nombre = String(formData.get("nombre") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "corriente");
  const saldo = Number(formData.get("saldo") ?? 0);
  if (!nombre) return { ok: false };
  await supabase
    .from("cuentas")
    .insert({ user_id: user.id, nombre, tipo, saldo });
  revalidatePath("/cuentas");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function actualizarCuenta(formData: FormData) {
  const { supabase, user } = await usuario();
  if (!user) return { ok: false };
  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "corriente");
  const saldo = Number(formData.get("saldo") ?? 0);
  if (!id || !nombre) return { ok: false };
  await supabase
    .from("cuentas")
    .update({ nombre, tipo, saldo })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/cuentas");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function borrarCuenta(id: string) {
  const { supabase, user } = await usuario();
  if (!user) return { ok: false };
  await supabase.from("cuentas").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/cuentas");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ============================================================
// CRUD · Movimientos
// ============================================================
export async function crearMovimiento(formData: FormData) {
  const { supabase, user } = await usuario();
  if (!user) return { ok: false };
  const comercio = String(formData.get("comercio") ?? "").trim();
  const importe = Math.abs(Number(formData.get("importe") ?? 0));
  const tipo = String(formData.get("tipo") ?? "gasto");
  const categoria = String(formData.get("categoria") ?? "Imprevistos");
  const fecha = String(formData.get("fecha") ?? "");
  const cuenta_id = String(formData.get("cuenta_id") ?? "") || null;
  const recurrente = formData.get("recurrente") === "on";
  const prescindible = formData.get("prescindible") === "on";
  if (!comercio || importe <= 0) return { ok: false };
  await supabase.from("movimientos").insert({
    user_id: user.id,
    comercio,
    importe,
    tipo,
    categoria,
    fecha: fecha || new Date().toISOString().slice(0, 10),
    cuenta_id,
    recurrente,
    prescindible,
  });
  revalidatePath("/movimientos");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function actualizarMovimiento(formData: FormData) {
  const { supabase, user } = await usuario();
  if (!user) return { ok: false };
  const id = String(formData.get("id") ?? "");
  const comercio = String(formData.get("comercio") ?? "").trim();
  const importe = Math.abs(Number(formData.get("importe") ?? 0));
  const tipo = String(formData.get("tipo") ?? "gasto");
  const categoria = String(formData.get("categoria") ?? "Imprevistos");
  const fecha = String(formData.get("fecha") ?? "");
  const recurrente = formData.get("recurrente") === "on";
  const prescindible = formData.get("prescindible") === "on";
  if (!id || !comercio || importe <= 0) return { ok: false };
  await supabase
    .from("movimientos")
    .update({ comercio, importe, tipo, categoria, fecha, recurrente, prescindible })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/movimientos");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function borrarMovimiento(id: string) {
  const { supabase, user } = await usuario();
  if (!user) return { ok: false };
  await supabase
    .from("movimientos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/movimientos");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ============================================================
// CRUD · Deudas (prestamos)
// ============================================================
export async function crearPrestamo(formData: FormData) {
  const { supabase, user } = await usuario();
  if (!user) return { ok: false };
  const nombre = String(formData.get("nombre") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "personal");
  const saldo_pendiente = Number(formData.get("saldo_pendiente") ?? 0);
  const cuota_mensual = Number(formData.get("cuota_mensual") ?? 0);
  const tin = Number(formData.get("tin") ?? 0);
  const fecha_fin = String(formData.get("fecha_fin") ?? "") || null;
  if (!nombre) return { ok: false };
  await supabase.from("prestamos").insert({
    user_id: user.id,
    nombre,
    tipo,
    saldo_pendiente,
    cuota_mensual,
    tin,
    fecha_fin,
    comision_amortizacion: 0,
  });
  revalidatePath("/deudas");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function actualizarPrestamo(formData: FormData) {
  const { supabase, user } = await usuario();
  if (!user) return { ok: false };
  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "personal");
  const saldo_pendiente = Number(formData.get("saldo_pendiente") ?? 0);
  const cuota_mensual = Number(formData.get("cuota_mensual") ?? 0);
  const tin = Number(formData.get("tin") ?? 0);
  const fecha_fin = String(formData.get("fecha_fin") ?? "") || null;
  if (!id || !nombre) return { ok: false };
  await supabase
    .from("prestamos")
    .update({ nombre, tipo, saldo_pendiente, cuota_mensual, tin, fecha_fin })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/deudas");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function borrarPrestamo(id: string) {
  const { supabase, user } = await usuario();
  if (!user) return { ok: false };
  await supabase.from("prestamos").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/deudas");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ============================================================
// CRUD · Objetivos (editar / borrar / aportar)
// ============================================================
export async function actualizarObjetivo(formData: FormData) {
  const { supabase, user } = await usuario();
  if (!user) return { ok: false };
  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const cantidad_objetivo = Number(formData.get("cantidad_objetivo") ?? 0);
  const cantidad_actual = Number(formData.get("cantidad_actual") ?? 0);
  const fecha_objetivo = String(formData.get("fecha_objetivo") ?? "") || null;
  if (!id || !nombre) return { ok: false };
  await supabase
    .from("objetivos")
    .update({ nombre, cantidad_objetivo, cantidad_actual, fecha_objetivo })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/objetivos");
  return { ok: true };
}

export async function aportarObjetivo(id: string, cantidad: number) {
  const { supabase, user } = await usuario();
  if (!user) return { ok: false };
  const { data: obj } = await supabase
    .from("objetivos")
    .select("cantidad_actual")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!obj) return { ok: false };
  const nuevo = Math.max(0, Number(obj.cantidad_actual) + cantidad);
  await supabase
    .from("objetivos")
    .update({ cantidad_actual: nuevo })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/objetivos");
  return { ok: true };
}

export async function borrarObjetivo(id: string) {
  const { supabase, user } = await usuario();
  if (!user) return { ok: false };
  await supabase.from("objetivos").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/objetivos");
  return { ok: true };
}
