export type ToastTipo = "ok" | "error";

// Lanza un aviso breve. Lo recoge el componente Toaster.
export function toast(mensaje: string, tipo: ToastTipo = "ok") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("cashly-toast", { detail: { mensaje, tipo } })
  );
}
