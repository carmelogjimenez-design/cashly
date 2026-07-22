import { createClient } from "@/lib/supabase/server";
import type { ResumenFinanciero } from "@/lib/tipos";

// Trae todo lo del usuario en paralelo y arma el resumen que usan las pantallas.
export async function getResumen(): Promise<ResumenFinanciero> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const vacio: ResumenFinanciero = {
    perfil: null,
    cuentas: [],
    movimientos: [],
    prestamos: [],
    objetivos: [],
    tieneDatos: false,
  };

  if (!user) return vacio;

  const [perfil, cuentas, movimientos, prestamos, objetivos] =
    await Promise.all([
      supabase.from("perfil_financiero").select("*").maybeSingle(),
      supabase.from("cuentas").select("*").order("creado_en"),
      supabase
        .from("movimientos")
        .select("*")
        .order("fecha", { ascending: false }),
      supabase.from("prestamos").select("*").order("saldo_pendiente", {
        ascending: false,
      }),
      supabase.from("objetivos").select("*").order("creado_en"),
    ]);

  const tieneDatos =
    (cuentas.data?.length ?? 0) > 0 || (movimientos.data?.length ?? 0) > 0;

  return {
    perfil: perfil.data ?? null,
    cuentas: cuentas.data ?? [],
    movimientos: movimientos.data ?? [],
    prestamos: prestamos.data ?? [],
    objetivos: objetivos.data ?? [],
    tieneDatos,
  };
}
