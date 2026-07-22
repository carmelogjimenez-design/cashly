"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";

export default function PerfilPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");

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

      <div className="card mt-4 flex items-start gap-3">
        <ShieldCheck size={22} strokeWidth={2.5} className="mt-0.5 text-navy" />
        <p className="text-sm font-semibold text-slate">
          Tus datos son tuyos. Cashly nunca ve la contraseña de tu banco y puedes
          desconectar cualquier cuenta cuando quieras.
        </p>
      </div>

      <button className="btn-secondary mt-6 w-full" onClick={handleLogout}>
        <LogOut size={20} strokeWidth={2.5} />
        Cerrar sesión
      </button>
    </AppShell>
  );
}
