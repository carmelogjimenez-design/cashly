"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import type { Movimiento, Cuenta } from "@/lib/tipos";
import {
  euro,
  fechaCorta,
  EMOJI_CATEGORIA,
  CATEGORIAS,
} from "@/lib/finanzas";
import {
  crearMovimiento,
  actualizarMovimiento,
  borrarMovimiento,
} from "@/app/actions";
import { BotonBorrar } from "@/components/GestorCuentas";

export default function MovimientosLista({
  movimientos,
  cuentas,
}: {
  movimientos: Movimiento[];
  cuentas: Cuenta[];
}) {
  const [filtro, setFiltro] = useState<string>("todos");
  const [soloPrescindibles, setSoloPrescindibles] = useState(false);
  const [nuevo, setNuevo] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);

  const categorias = Array.from(
    new Set(movimientos.map((m) => m.categoria))
  ).sort();

  const lista = movimientos.filter((m) => {
    if (filtro !== "todos" && m.categoria !== filtro) return false;
    if (soloPrescindibles && !m.prescindible) return false;
    return true;
  });

  return (
    <div>
      {/* Añadir */}
      {nuevo ? (
        <div className="mt-4">
          <FormMovimiento cuentas={cuentas} onCerrar={() => setNuevo(false)} />
        </div>
      ) : (
        <button
          className="btn-primary mt-4 w-full"
          onClick={() => setNuevo(true)}
        >
          <Plus size={20} strokeWidth={2.5} /> Añadir movimiento
        </button>
      )}

      {/* Filtros */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <Chip activo={filtro === "todos"} onClick={() => setFiltro("todos")}>
          Todos
        </Chip>
        <Chip
          activo={soloPrescindibles}
          onClick={() => setSoloPrescindibles((v) => !v)}
        >
          Prescindibles
        </Chip>
        {categorias.map((c) => (
          <Chip key={c} activo={filtro === c} onClick={() => setFiltro(c)}>
            {EMOJI_CATEGORIA[c] ?? "•"} {c}
          </Chip>
        ))}
      </div>

      {/* Lista */}
      <div className="mt-4 space-y-2">
        {lista.length === 0 && (
          <p className="card text-center text-sm font-semibold text-slate">
            No hay movimientos con ese filtro.
          </p>
        )}
        {lista.map((m) =>
          editando === m.id ? (
            <FormMovimiento
              key={m.id}
              cuentas={cuentas}
              movimiento={m}
              onCerrar={() => setEditando(null)}
            />
          ) : (
            <div key={m.id} className="card flex items-center gap-3 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan/40 text-lg">
                {EMOJI_CATEGORIA[m.categoria] ?? "•"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-navy">{m.comercio}</p>
                <p className="text-xs font-semibold text-slate">
                  {fechaCorta(m.fecha)} · {m.categoria}
                  {m.recurrente ? " · recurrente" : ""}
                </p>
              </div>
              <span
                className={`shrink-0 font-display font-bold ${
                  m.tipo === "ingreso" ? "text-emerald-600" : "text-navy"
                }`}
              >
                {m.tipo === "ingreso" ? "+" : "−"}
                {euro(m.importe)}
              </span>
              <button
                onClick={() => setEditando(m.id)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan/30 text-navy"
              >
                <Pencil size={16} strokeWidth={2.5} />
              </button>
              <BotonBorrar onConfirm={() => borrarMovimiento(m.id)} />
            </div>
          )
        )}
      </div>
    </div>
  );
}

function FormMovimiento({
  cuentas,
  movimiento,
  onCerrar,
}: {
  cuentas: Cuenta[];
  movimiento?: Movimiento;
  onCerrar: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tipo, setTipo] = useState(movimiento?.tipo ?? "gasto");
  const hoy = new Date().toISOString().slice(0, 10);

  function handle(formData: FormData) {
    formData.set("tipo", tipo);
    startTransition(async () => {
      const res = movimiento
        ? await actualizarMovimiento(formData)
        : await crearMovimiento(formData);
      if (res.ok) {
        onCerrar();
        router.refresh();
      }
    });
  }

  return (
    <form action={handle} className="card space-y-3">
      {movimiento && (
        <input type="hidden" name="id" defaultValue={movimiento.id} />
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTipo("gasto")}
          className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold ${
            tipo === "gasto"
              ? "bg-navy text-white"
              : "border-2 border-navy/10 bg-white text-navy"
          }`}
        >
          Gasto
        </button>
        <button
          type="button"
          onClick={() => setTipo("ingreso")}
          className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold ${
            tipo === "ingreso"
              ? "bg-emerald-600 text-white"
              : "border-2 border-navy/10 bg-white text-navy"
          }`}
        >
          Ingreso
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Concepto</label>
          <input
            name="comercio"
            className="field"
            defaultValue={movimiento?.comercio}
            placeholder="Ej. Mercadona"
            required
          />
        </div>
        <div>
          <label className="label">Importe (€)</label>
          <input
            name="importe"
            type="number"
            step="0.01"
            className="field"
            defaultValue={movimiento?.importe}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Categoría</label>
          <select
            name="categoria"
            className="field"
            defaultValue={movimiento?.categoria ?? "Alimentación"}
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Fecha</label>
          <input
            name="fecha"
            type="date"
            className="field"
            defaultValue={movimiento?.fecha ?? hoy}
          />
        </div>
      </div>

      {cuentas.length > 0 && (
        <div>
          <label className="label">Cuenta</label>
          <select
            name="cuenta_id"
            className="field"
            defaultValue={movimiento?.cuenta_id ?? ""}
          >
            <option value="">Sin especificar</option>
            {cuentas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm font-bold text-navy">
          <input
            type="checkbox"
            name="recurrente"
            defaultChecked={movimiento?.recurrente}
            className="h-4 w-4 accent-cyan"
          />
          Recurrente
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-navy">
          <input
            type="checkbox"
            name="prescindible"
            defaultChecked={movimiento?.prescindible}
            className="h-4 w-4 accent-cyan"
          />
          Prescindible
        </label>
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

function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-bold transition ${
        activo ? "bg-navy text-white" : "bg-white text-navy"
      }`}
    >
      {children}
    </button>
  );
}
