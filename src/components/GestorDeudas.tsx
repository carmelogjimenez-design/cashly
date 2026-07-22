"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import type { Prestamo } from "@/lib/tipos";
import { euro, mesesHasta, interesesPendientes } from "@/lib/finanzas";
import { crearPrestamo, actualizarPrestamo, borrarPrestamo } from "@/app/actions";
import { toast } from "@/lib/toast";
import { BotonBorrar } from "@/components/GestorCuentas";

const TIPOS = [
  { valor: "hipoteca", etiqueta: "Hipoteca" },
  { valor: "coche", etiqueta: "Coche" },
  { valor: "personal", etiqueta: "Personal" },
  { valor: "tarjeta", etiqueta: "Tarjeta" },
  { valor: "otro", etiqueta: "Otro" },
];

export default function GestorDeudas({ prestamos }: { prestamos: Prestamo[] }) {
  const [nuevo, setNuevo] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);

  return (
    <div className="mt-4">
      <div className="space-y-3">
        {prestamos.map((p) =>
          editando === p.id ? (
            <FormDeuda
              key={p.id}
              prestamo={p}
              onCerrar={() => setEditando(null)}
            />
          ) : (
            <div key={p.id} className="card">
              <div className="flex items-center justify-between">
                <p className="font-display font-bold text-navy">{p.nombre}</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      p.tin >= 15
                        ? "bg-red-100 text-red-600"
                        : "bg-cyan/40 text-navy"
                    }`}
                  >
                    {p.tin.toFixed(1)}%
                  </span>
                  <button
                    onClick={() => setEditando(p.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan/30 text-navy"
                  >
                    <Pencil size={16} strokeWidth={2.5} />
                  </button>
                  <BotonBorrar onConfirm={() => borrarPrestamo(p.id)} />
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-y-1 text-sm font-semibold text-slate">
                <span>Pendiente</span>
                <span className="text-right text-navy">
                  {euro(p.saldo_pendiente)}
                </span>
                <span>Cuota</span>
                <span className="text-right text-navy">
                  {euro(p.cuota_mensual)}/mes
                </span>
                {p.fecha_fin && (
                  <>
                    <span>Te quedan</span>
                    <span className="text-right text-navy">
                      {mesesHasta(p.fecha_fin)} meses
                    </span>
                  </>
                )}
                {interesesPendientes(p) > 0 && (
                  <>
                    <span>Intereses por pagar</span>
                    <span className="text-right text-navy">
                      ~{euro(interesesPendientes(p))}
                    </span>
                  </>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {nuevo ? (
        <FormDeuda onCerrar={() => setNuevo(false)} />
      ) : (
        <button
          className="btn-secondary mt-3 w-full"
          onClick={() => setNuevo(true)}
        >
          <Plus size={20} strokeWidth={2.5} /> Añadir deuda
        </button>
      )}
    </div>
  );
}

function FormDeuda({
  prestamo,
  onCerrar,
}: {
  prestamo?: Prestamo;
  onCerrar: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handle(formData: FormData) {
    startTransition(async () => {
      const res = prestamo
        ? await actualizarPrestamo(formData)
        : await crearPrestamo(formData);
      if (res.ok) {
        toast(prestamo ? "Deuda actualizada" : "Deuda añadida");
        onCerrar();
        router.refresh();
      }
    });
  }

  return (
    <form action={handle} className="card mt-3 space-y-3">
      {prestamo && <input type="hidden" name="id" defaultValue={prestamo.id} />}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Nombre</label>
          <input
            name="nombre"
            className="field"
            defaultValue={prestamo?.nombre}
            placeholder="Ej. Tarjeta"
            required
          />
        </div>
        <div>
          <label className="label">Tipo</label>
          <select
            name="tipo"
            className="field"
            defaultValue={prestamo?.tipo ?? "personal"}
          >
            {TIPOS.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.etiqueta}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Saldo pendiente (€)</label>
          <input
            name="saldo_pendiente"
            type="number"
            step="0.01"
            className="field"
            defaultValue={prestamo?.saldo_pendiente}
            placeholder="0"
          />
        </div>
        <div>
          <label className="label">Cuota mensual (€)</label>
          <input
            name="cuota_mensual"
            type="number"
            step="0.01"
            className="field"
            defaultValue={prestamo?.cuota_mensual}
            placeholder="0"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Interés TIN (%)</label>
          <input
            name="tin"
            type="number"
            step="0.1"
            className="field"
            defaultValue={prestamo?.tin}
            placeholder="0"
          />
        </div>
        <div>
          <label className="label">Fin (opcional)</label>
          <input
            name="fecha_fin"
            type="date"
            className="field"
            defaultValue={prestamo?.fecha_fin ?? ""}
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
