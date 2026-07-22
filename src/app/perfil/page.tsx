"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  Wallet,
  ArrowLeftRight,
  CreditCard,
  Target,
  ChevronRight,
  Sparkles,
  Trash2,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { cargarDatosEjemplo, borrarDatos } from "@/app/actions";

export default function PerfilPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");
  const [pendingEjemplo, startEjemplo] = useTransition();
  const [pendingBorrar, startBorrar] = useTransition();
  const [confirmarBorrar, setConfirmarBorrar] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? "");
      setNombre((user?.user_metadata?.nombre as string) ?? "");
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold text-navy">Perfil</h1>

      <div className="card mt-6 flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan font-display text-2xl font-bold text-navy">
          {(nombre || email || "?").charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold text-navy">
            {nombre || "Tu cuenta"}
          </p>
          <p className="truncate text-sm font-semibold text-slate">{email}</p>
        </div>
      </div>

      {/* Gestionar mis datos */}
      <p className="mt-6 font-display text-lg font-bold text-navy">
        Gestionar mis datos
      </p>
      <div className="mt-3 space-y-2">
        <Fila href="/cuentas" icon={<Wallet size={20} strokeWidth={2.5} />} texto="Mis cuentas" />
        <Fila
          href="/movimientos"
          icon={<ArrowLeftRight size={20} strokeWidth={2.5} />}
          texto="Mis movimientos"
        />
        <Fila
          href="/deudas"
          icon={<CreditCard size={20} strokeWidth={2.5} />}
          texto="Mis deudas"
        />
        <Fila
          href="/objetivos"
          icon={<Target size={20} strokeWidth={2.5} />}
          texto="Mis objetivos"
        />
      </div>

      {/* Datos de ejemplo */}
      <div className="card mt-6">
        <p className="font-display font-bold text-navy">Datos de ejemplo</p>
        <p className="mt-1 text-sm font-semibold text-slate">
          Puedes cargar una familia de ejemplo para probar, o borrar todo y
          empezar con tus datos reales.
        </p>
        <button
          className="btn-secondary mt-4 w-full"
          disabled={pendingEjemplo}
          onClick={() =>
            startEjemplo(async () => {
              await cargarDatosEjemplo();
              router.refresh();
            })
          }
        >
          <Sparkles size={20} strokeWidth={2.5} />
          {pendingEjemplo ? "Cargando…" : "Cargar datos de ejemplo"}
        </button>

        {confirmarBorrar ? (
          <button
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-6 py-3.5 font-display text-lg font-semibold text-white"
            disabled={pendingBorrar}
            onClick={() =>
              startBorrar(async () => {
                await borrarDatos();
                setConfirmarBorrar(false);
                router.refresh();
              })
            }
          >
            <Trash2 size={20} strokeWidth={2.5} />
            {pendingBorrar ? "Borrando…" : "Sí, borrar todo"}
          </button>
        ) : (
          <button
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-red-200 bg-white px-6 py-3.5 font-display text-lg font-semibold text-red-500"
            onClick={() => setConfirmarBorrar(true)}
          >
            <Trash2 size={20} strokeWidth={2.5} />
            Borrar todos mis datos
          </button>
        )}
      </div>

      <button className="btn-secondary mt-6 w-full" onClick={handleLogout}>
        <LogOut size={20} strokeWidth={2.5} />
        Cerrar sesión
      </button>
    </AppShell>
  );
}

function Fila({
  href,
  icon,
  texto,
}: {
  href: string;
  icon: React.ReactNode;
  texto: string;
}) {
  return (
    <Link href={href} className="card flex items-center gap-3 py-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan/40 text-navy">
        {icon}
      </span>
      <span className="flex-1 font-display font-bold text-navy">{texto}</span>
      <ChevronRight size={18} strokeWidth={2.5} className="text-slate" />
    </Link>
  );
}
