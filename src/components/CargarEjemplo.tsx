"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { cargarDatosEjemplo } from "@/app/actions";

export default function CargarEjemplo() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const res = await cargarDatosEjemplo();
      if (res.ok) {
        router.refresh();
      } else {
        setError("No se pudieron cargar los datos. Revisa que ejecutaste el SQL en Supabase.");
      }
    });
  }

  return (
    <div className="card mt-6 text-center">
      <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow">
        <Sparkles size={30} strokeWidth={2.5} className="text-navy" />
      </span>
      <h2 className="font-display text-xl font-bold text-navy">
        Empieza con datos de ejemplo
      </h2>
      <p className="mx-auto mt-2 max-w-xs text-sm font-semibold text-slate">
        Cargamos una familia de ejemplo (2 hijos, hipoteca, coche, ahorros) para
        que veas Cashly funcionando al instante. Podrás borrarlos cuando quieras.
      </p>
      {error && (
        <div className="mt-3 rounded-2xl bg-navy px-4 py-3 text-sm font-bold text-white">
          {error}
        </div>
      )}
      <button
        className="btn-primary mt-5 w-full"
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? "Cargando…" : "Cargar datos de ejemplo"}
      </button>
    </div>
  );
}
