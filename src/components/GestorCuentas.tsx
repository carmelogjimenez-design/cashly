"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Cuenta } from "@/lib/tipos";
import { euro } from "@/lib/finanzas";
import { crearCuenta, actualizarCuenta, borrarCuenta } from "@/app/actions";

const TIPOS: { valor: string; etiqueta: string }[] = [
  { valor: "corriente", etiqueta: "Corriente" },
  { valor: "ahorro", etiqueta: "Ahorro" },
  { valor: "conjunta", etiqueta: "Conjunta" },
  { valor: "efectivo", etiqueta: "Efectivo" },
  { valor: "inversion", etiqueta: "Inversión" },
];

export default function GestorCuentas({ cuentas }: { cuentas: Cuenta[] }) {
  const [modo, setModo] = useState<"lista" | "nueva" | string>("lista");

  return (
    <div className="mt-6">
      {cuentas.length === 0 && modo === "lista" && (
        <div className="card text-center">
          <p className="font-semibold text-slate">
            Aún no tienes cuentas. Añade la primera.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {cuentas.map((c) =>
          modo === c.id ? (
            <FormCuenta
              key={c.id}
              cuenta={c}
              onCerrar={() => setModo("lista")}
            />
          ) : (
            <div key={c.id} className="card flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-bold text-navy">
                  {c.nombre}
                </p>
                <p className="text-xs font-semibold capitalize text-slate">
                  {c.tipo}
                </p>
              </div>
              <p className="font-display font-bold text-navy">
                {euro(c.saldo)}
              </p>
              <button
                onClick={() => setModo(c.id)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan/30 text-navy"
              >
                <Pencil size={16} strokeWidth={2.5} />
              </button>
              <BotonBorrar onConfirm={() => borrarCuenta(c.id)} />
            </div>
          )
        )}
      </div>

      {modo === "nueva" ? (
        <FormCuenta onCerrar={() => setModo("lista")} />
      ) : (
        modo === "lista" && (
          <button
            className="btn-secondary mt-3 w-full"
            onClick={() => setModo("nueva")}
          >
            <Plus size={20} strokeWidth={2.5} /> Añadir cuenta
          </button>
        )
      )}
    </div>
  );
}

function FormCuenta({
  cuenta,
  onCerrar,
}: {
  cuenta?: Cuenta;
  onCerrar: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handle(formData: FormData) {
    startTransition(async () => {
      const res = cuenta
        ? await actualizarCuenta(formData)
        : await crearCuenta(formData);
      if (res.ok) {
        onCerrar();
        router.refresh();
      }
    });
  }

  return (
    <form action={handle} className="card space-y-3">
      {cuenta && <input type="hidden" name="id" defaultValue={cuenta.id} />}
      <div>
        <label className="label">Nombre</label>
        <input
          name="nombre"
          className="field"
          defaultValue={cuenta?.nombre}
          placeholder="Ej. Cuenta corriente"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Tipo</label>
          <select
            name="tipo"
            className="field"
            defaultValue={cuenta?.tipo ?? "corriente"}
          >
            {TIPOS.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.etiqueta}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Saldo (€)</label>
          <input
            name="saldo"
            type="number"
            step="0.01"
            className="field"
            defaultValue={cuenta?.saldo ?? 0}
          />
        </div>
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

export function BotonBorrar({ onConfirm }: { onConfirm: () => Promise<unknown> }) {
  const router = useRouter();
  const [confirmar, setConfirmar] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirmar) {
    return (
      <button
        onClick={() =>
          startTransition(async () => {
            await onConfirm();
            router.refresh();
          })
        }
        disabled={pending}
        className="rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white"
      >
        {pending ? "…" : "Seguro"}
      </button>
    );
  }
  return (
    <button
      onClick={() => setConfirmar(true)}
      className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-500"
    >
      <Trash2 size={16} strokeWidth={2.5} />
    </button>
  );
}
