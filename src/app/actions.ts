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
