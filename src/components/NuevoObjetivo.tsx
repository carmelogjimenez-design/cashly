"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { crearObjetivo } from "@/app/actions";
import { toast } from "@/lib/toast";

export default function NuevoObjetivo() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await crearObjetivo(formData);
      if (res.ok) {
        toast("Objetivo creado");
        setAbierto(false);
        router.refresh();
      }
    });
  }

  if (!abierto) {
    return (
      <button
        className="btn-secondary mt-4 w-full"
        onClick={() => setAbierto(true)}
      >
        <Plus size={20} strokeWidth={2.5} />
        Nuevo objetivo
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="card mt-4 space-y-3">
      <p className="font-display text-lg font-bold text-navy">Nuevo objetivo</p>
      <div>
        <label className="label">¿Qué quieres conseguir?</label>
        <input
          name="nombre"
          className="field"
          placeholder="Ej. Viaje a Japón"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Cantidad total (€)</label>
          <input
            name="cantidad_objetivo"
            type="number"
            className="field"
            placeholder="5000"
            required
          />
        </div>
        <div>
          <label className="label">Ya tienes (€)</label>
          <input
            name="cantidad_actual"
            type="number"
            className="field"
            placeholder="0"
          />
        </div>
      </div>
      <div>
        <label className="label">Fecha objetivo</label>
        <input name="fecha_objetivo" type="date" className="field" />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1" disabled={pending}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setAbierto(false)}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
