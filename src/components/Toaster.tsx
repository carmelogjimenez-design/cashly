"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import type { ToastTipo } from "@/lib/toast";

type Item = { id: number; mensaje: string; tipo: ToastTipo };

export default function Toaster() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    function onToast(e: Event) {
      const { mensaje, tipo } = (e as CustomEvent).detail as {
        mensaje: string;
        tipo: ToastTipo;
      };
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, mensaje, tipo }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }, 2600);
    }
    window.addEventListener("cashly-toast", onToast);
    return () => window.removeEventListener("cashly-toast", onToast);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4">
      {items.map((i) => (
        <div
          key={i.id}
          className="animate-pop flex items-center gap-2 rounded-2xl bg-navy px-4 py-3 text-sm font-bold text-white shadow-[0_12px_28px_-10px_rgba(7,26,58,0.6)]"
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full ${
              i.tipo === "ok" ? "bg-emerald-400" : "bg-red-400"
            } text-navy`}
          >
            {i.tipo === "ok" ? (
              <Check size={15} strokeWidth={3} />
            ) : (
              <X size={15} strokeWidth={3} />
            )}
          </span>
          {i.mensaje}
        </div>
      ))}
    </div>
  );
}
