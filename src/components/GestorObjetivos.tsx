"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Minus } from "lucide-react";
import type { Objetivo } from "@/lib/tipos";
import { euro, progresoObjetivo, aporteMensualObjetivo } from "@/lib/finanzas";
import {
  actualizarObjetivo,
  borrarObjetivo,
  aportarObjetivo,
} from "@/app/actions";
import Barra from "@/components/Barra";
import { BotonBorrar } from "@/components/GestorCuentas";
import { toast } from "@/lib/toast";
import { celebra } from "@/lib/celebra";

export default function GestorObjetivos({
  objetivos,
}: {
  objetivos: Objetivo[];
}) {
  const [editando, setEditando] = useState<string | null>(null);

  return (
    <div className="mt-6 space-y-3">
      {objetivos.map((o) =>
        editando === o.id ? (
          <FormObjetivo
            key={o.id}
            objetivo={o}
            onCerrar={() => setEditando(null)}
          />
        ) : (
          <Tarjeta key={o.id} o={o} onEditar={() => setEditando(o.id)} />
        )
      )}
    </div>
  );
}

function Tarjeta({ o, onEditar }: { o: Objetivo; onEditar: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [monto, setMonto] = useState("");
  const progreso = progresoObjetivo(o);
  const aporte = aporteMensualObjetivo(o);
  const restante = Math.max(0, o.cantidad_objetivo - o.cantidad_actual);

  function aportar(signo: number) {
    const n = Number(monto.replace(",", "."));
    if (isNaN(n) || n <= 0) return;
    const nuevoTotal = o.cantidad_actual + signo * n;
    startTransition(async () => {
      await aportarObjetivo(o.id, signo * n);
      setMonto("");
      if (signo > 0 && nuevoTotal >= o.cantidad_objetivo) {
        celebra();
        toast("¡Objetivo completado! 🎉");
      } else {
        toast(signo > 0 ? "Aportado a tu meta" : "Retirado de tu meta");
      }
      router.refresh();
    });
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-bold text-navy">{o.nombre}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={onEditar}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan/30 text-navy"
          >
            <Pencil size={16} strokeWidth={2.5} />
          </button>
          <BotonBorrar onConfirm={() => borrarObjetivo(o.id)} />
        </div>
      </div>
      <div className="mt-2">
        <Barra valor={progreso} color="bg-yellow" alto="h-3" />
      </div>
      <div className="mt-2 flex items-center justify-between text-sm font-semibold text-slate">
        <span>
          {euro(o.cantidad_actual)} de {euro(o.cantidad_objetivo)}
        </span>
        <span>{Math.round(progreso * 100)}%</span>
      </div>
      {aporte > 0 && (
        <p className="mt-2 rounded-2xl bg-cyan/30 px-3 py-2 text-sm font-bold text-navy">
          Ahorra {euro(aporte)}/mes para llegar a tiempo · faltan{" "}
          {euro(restante)}
        </p>
      )}

      {/* Aportar / sacar */}
      <div className="mt-3 flex items-center gap-2">
        <input
          type="number"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          placeholder="Cantidad €"
          className="field flex-1 py-2.5"
        />
        <button
          onClick={() => aportar(1)}
          disabled={pending}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white"
          aria-label="Aportar"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => aportar(-1)}
          disabled={pending}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy text-white"
          aria-label="Sacar"
        >
          <Minus size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function FormObjetivo({
  objetivo,
  onCerrar,
}: {
  objetivo: Objetivo;
  onCerrar: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handle(formData: FormData) {
    startTransition(async () => {
      const res = await actualizarObjetivo(formData);
      if (res.ok) {
        toast("Objetivo actualizado");
        onCerrar();
        router.refresh();
      }
    });
  }

  return (
    <form action={handle} className="card space-y-3">
      <input type="hidden" name="id" defaultValue={objetivo.id} />
      <div>
        <label className="label">Nombre</label>
        <input
          name="nombre"
          className="field"
          defaultValue={objetivo.nombre}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Meta total (€)</label>
          <input
            name="cantidad_objetivo"
            type="number"
            className="field"
            defaultValue={objetivo.cantidad_objetivo}
            required
          />
        </div>
        <div>
          <label className="label">Ya tienes (€)</label>
          <input
            name="cantidad_actual"
            type="number"
            className="field"
            defaultValue={objetivo.cantidad_actual}
          />
        </div>
      </div>
      <div>
        <label className="label">Fecha objetivo</label>
        <input
          name="fecha_objetivo"
          type="date"
          className="field"
          defaultValue={objetivo.fecha_objetivo ?? ""}
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1" disabled={pending}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" className="btn-secondary" onClick={onCerrar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
